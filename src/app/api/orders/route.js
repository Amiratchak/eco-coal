import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';
import {
  LOCATIONS,
  MAX_ORDER_KG,
  DAILY_TARGET_KG,
  DAILY_COST_MIN,
  DAILY_COST_MAX,
  priceCart,
  getProduct,
  normalisePhone,
} from '@/lib/products';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];

function clean(value, maxLength) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function dbError(error) {
  console.error('[api/orders]', error);
  const offline = ['ECONNREFUSED', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_FIELD_ERROR'].includes(
    error?.code
  );
  return NextResponse.json(
    {
      error: offline
        ? 'Our order system is offline right now.'
        : 'Something went wrong while saving your order. Please try again.',
    },
    { status: offline ? 503 : 500 }
  );
}

/* GET /api/orders  (staff only)
 * Latest orders with their items, plus today's totals. */
export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const orders = await query(
      `SELECT id, customer_name, phone, delivery_location, delivery_notes,
              item_count, total_kg, total_ugx, status, created_at
         FROM orders
        ORDER BY created_at DESC, id DESC
        LIMIT 200`
    );

    let items = [];
    if (orders.length > 0) {
      const ids = orders.map((order) => order.id);
      items = await query(
        `SELECT order_id, product_id, product_name, unit_label, quantity, line_kg, line_total_ugx
           FROM order_items
          WHERE order_id IN (${ids.map(() => '?').join(',')})
          ORDER BY id`,
        ids
      );
    }

    const itemsByOrder = {};
    items.forEach((item) => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });

    const [today] = await query(
      `SELECT COUNT(*) AS order_count,
              COALESCE(SUM(total_kg), 0) AS kg,
              COALESCE(SUM(total_ugx), 0) AS revenue
         FROM orders
        WHERE DATE(created_at) = CURDATE() AND status <> 'cancelled'`
    );

    const [allTime] = await query(
      `SELECT COUNT(*) AS order_count,
              COALESCE(SUM(total_kg), 0) AS kg,
              COALESCE(SUM(total_ugx), 0) AS revenue
         FROM orders
        WHERE status <> 'cancelled'`
    );

    const byProduct = await query(
      `SELECT oi.product_name AS name, SUM(oi.quantity) AS units, MIN(oi.unit_label) AS unit_label,
              SUM(oi.line_kg) AS kg
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
        WHERE o.status <> 'cancelled'
        GROUP BY oi.product_name
        ORDER BY kg DESC`
    );

    const byLocation = await query(
      `SELECT delivery_location AS location, COUNT(*) AS order_count, COALESCE(SUM(total_kg), 0) AS kg
         FROM orders
        WHERE status <> 'cancelled'
        GROUP BY delivery_location
        ORDER BY kg DESC`
    );

    return NextResponse.json({
      orders: orders.map((order) => ({ ...order, items: itemsByOrder[order.id] || [] })),
      summary: {
        today: { orders: Number(today.order_count), kg: Number(today.kg), revenue: Number(today.revenue) },
        allTime: { orders: Number(allTime.order_count), kg: Number(allTime.kg), revenue: Number(allTime.revenue) },
        byProduct: byProduct.map((row) => ({
          name: row.name,
          units: Number(row.units),
          unitLabel: row.unit_label,
          kg: Number(row.kg),
        })),
        byLocation: byLocation.map((row) => ({ location: row.location, orders: Number(row.order_count), kg: Number(row.kg) })),
        targetKg: DAILY_TARGET_KG,
        dailyCostMin: DAILY_COST_MIN,
        dailyCostMax: DAILY_COST_MAX,
      },
    });
  } catch (error) {
    return dbError(error);
  }
}

/* POST /api/orders  (public, used by checkout)
 * Body: { customerName, phone, deliveryLocation, deliveryNotes, items: [{ productId, quantity }] }
 * Every field is validated and every price is recalculated on the server. */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const errors = {};

  const customerName = clean(body.customerName, 120);
  if (customerName.length < 2) errors.customerName = 'Please enter your full name.';
  else if (!/^[\p{L}\p{M}' .-]+$/u.test(customerName)) errors.customerName = 'Use letters only for the name.';

  const phone = normalisePhone(body.phone);
  if (!phone) errors.phone = 'Enter a valid Ugandan mobile number, e.g. 0772 123456.';

  const location = clean(body.deliveryLocation, 40);
  if (!LOCATIONS.includes(location)) errors.deliveryLocation = 'Choose a delivery area from the list.';

  const notes = clean(body.deliveryNotes, 255);

  const requested = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
  const unknown = requested.some((item) => !getProduct(item?.productId));
  const cart = priceCart(requested);

  if (unknown || cart.lines.length === 0) {
    errors.items = 'Your cart is empty or contains an item we no longer sell.';
  } else {
    const overLimit = cart.lines.find((line) => {
      const asked = requested
        .filter((item) => item.productId === line.productId)
        .reduce((sum, item) => sum + Math.floor(Number(item.quantity) || 0), 0);
      return asked > line.quantity;
    });
    if (overLimit) {
      errors.items = `The ${overLimit.name} is limited to ${getProduct(overLimit.productId).maxQty} per order.`;
    } else if (cart.totalKg > MAX_ORDER_KG) {
      errors.items = `We can deliver up to ${MAX_ORDER_KG} kg per order. Please reduce your cart or contact us on WhatsApp.`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Please check your details.', fields: errors }, { status: 422 });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO orders
         (customer_name, phone, delivery_location, delivery_notes, item_count, total_kg, total_ugx)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customerName, phone, location, notes || null, cart.itemCount, cart.totalKg, cart.total]
    );
    const orderId = result.insertId;

    for (const line of cart.lines) {
      await connection.execute(
        `INSERT INTO order_items
           (order_id, product_id, product_name, unit_label, kg_per_unit, unit_price_ugx, quantity, line_kg, line_total_ugx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, line.productId, line.name, line.unitLabel, line.kgPerUnit, line.unitPrice, line.quantity, line.lineKg, line.lineTotal]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: orderId,
          customerName,
          phone,
          deliveryLocation: location,
          deliveryNotes: notes,
          ...cart,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        /* ignore rollback failure */
      }
    }
    return dbError(error);
  } finally {
    if (connection) connection.release();
  }
}

/* PATCH /api/orders  (staff only)
 * Body: { id, status } */
export async function PATCH(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const id = Number(body.id);
  const status = String(body.status || '');
  if (!Number.isInteger(id) || id < 1 || !STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid order or status.' }, { status: 422 });
  }

  try {
    const result = await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    return dbError(error);
  }
}
