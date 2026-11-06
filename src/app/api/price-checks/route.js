import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';
import { PRICE_CHECK_MARKETS } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function clean(value, maxLength) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function dbError(error) {
  console.error('[api/price-checks]', error);
  const offline = ['ECONNREFUSED', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_ACCESS_DENIED_ERROR'].includes(error?.code);
  return NextResponse.json(
    {
      error: offline
        ? 'The database is not reachable. Check that MySQL is running in XAMPP and that database.sql has been imported.'
        : 'Something went wrong. Please try again.',
    },
    { status: offline ? 503 : 500 }
  );
}

/* GET /api/price-checks  (admin only) */
export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  try {
    const checks = await query(
      `SELECT id, market, seller_name, charcoal_quality, bag_weight_kg, price_ugx,
              ROUND(price_ugx / bag_weight_kg) AS price_per_kg,
              check_date, notes, recorded_by, created_at
         FROM price_checks
        ORDER BY check_date DESC, id DESC
        LIMIT 200`
    );
    return NextResponse.json({ checks });
  } catch (error) {
    return dbError(error);
  }
}

/* POST /api/price-checks  (admin only) — records one seller interview */
export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const errors = {};
  const market = clean(body.market, 40);
  if (!PRICE_CHECK_MARKETS.includes(market)) errors.market = 'Choose a market.';

  const sellerName = clean(body.sellerName, 120);
  if (sellerName.length < 2) errors.sellerName = 'Enter the seller name or stall.';

  const quality = clean(body.charcoalQuality, 80);
  if (quality.length < 2) errors.charcoalQuality = 'Describe the charcoal quality.';

  const bagWeight = Number(body.bagWeightKg);
  if (!Number.isFinite(bagWeight) || bagWeight <= 0 || bagWeight > 200) errors.bagWeightKg = 'Bag weight must be between 0 and 200 kg.';

  const price = Number(body.priceUgx);
  if (!Number.isInteger(price) || price < 100 || price > 2000000) errors.priceUgx = 'Enter the price in whole shillings.';

  const checkDate = clean(body.checkDate, 10);
  const parsedDate = new Date(checkDate + 'T00:00:00');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkDate) || Number.isNaN(parsedDate.getTime())) {
    errors.checkDate = 'Enter a valid date.';
  } else if (parsedDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    errors.checkDate = 'The date cannot be in the future.';
  }

  const notes = clean(body.notes, 255);
  const recordedBy = clean(body.recordedBy, 80);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', fields: errors }, { status: 422 });
  }

  try {
    const result = await query(
      `INSERT INTO price_checks
         (market, seller_name, charcoal_quality, bag_weight_kg, price_ugx, check_date, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [market, sellerName, quality, Math.round(bagWeight * 100) / 100, price, checkDate, notes || null, recordedBy || null]
    );
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  } catch (error) {
    return dbError(error);
  }
}
