'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { useCart } from '../components/CartProvider';
import {
  LOCATIONS,
  MAX_ORDER_KG,
  getProduct,
  formatUGX,
  unitText,
  normalisePhone,
  orderReference,
  buildWhatsAppLink,
} from '@/lib/products';

const EMPTY_FORM = {
  customerName: '',
  phone: '',
  deliveryLocation: '',
  deliveryNotes: '',
};

function validate(form) {
  const errors = {};
  if (form.customerName.trim().length < 2) errors.customerName = 'Please enter your full name.';
  if (!normalisePhone(form.phone)) errors.phone = 'Enter a valid Ugandan mobile number, e.g. 0772 123456.';
  if (!LOCATIONS.includes(form.deliveryLocation)) errors.deliveryLocation = 'Choose where we should deliver.';
  return errors;
}

function buildMessage({ lines, total, totalKg, form, orderId }) {
  const text = ['Hello Eco Coal, I would like to order:', ''];
  lines.forEach((line) => {
    text.push(`- ${line.name}: ${unitText(line.quantity, line.unitLabel)} (${formatUGX(line.lineTotal)})`);
  });
  text.push('', `Total: ${formatUGX(total)} for ${totalKg} kg`, '');
  text.push(`Name: ${form.customerName.trim() || '-'}`);
  text.push(`Phone: ${form.phone.trim() || '-'}`);
  text.push(
    `Delivery: ${form.deliveryLocation || '-'}${form.deliveryNotes.trim() ? ' (' + form.deliveryNotes.trim() + ')' : ''}`
  );
  if (orderId) text.push('', `Order reference: ${orderReference(orderId)}`);
  return text.join('\n');
}

export default function CheckoutPage() {
  const cart = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [placed, setPlaced] = useState(null);

  const overLimit = cart.totalKg > MAX_ORDER_KG;
  const shown = placed || cart;
  const whatsappLink = buildWhatsAppLink(
    buildMessage({ lines: shown.lines, total: shown.total, totalKg: shown.totalKg, form, orderId: placed?.id })
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (cart.lines.length === 0 || overLimit) return;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ state: 'error', message: 'Please check the highlighted fields.' });
      return;
    }

    setStatus({ state: 'saving', message: '' });
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: cart.items }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        setStatus({
          state: 'error',
          message:
            (data.fields?.items || data.error || 'We could not place your order.') +
            (response.status >= 500 ? ' You can still send your order to us on WhatsApp.' : ''),
        });
        return;
      }

      setPlaced(data.order);
      cart.clearCart();
      setStatus({ state: 'done', message: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus({
        state: 'error',
        message: 'We could not reach our order system. You can still send your order to us on WhatsApp.',
      });
    }
  }

  function startAgain() {
    setPlaced(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setStatus({ state: 'idle', message: '' });
  }

  const isEmpty = cart.loaded && cart.lines.length === 0 && !placed;

  return (
    <section className="shop">
      {/* ---------- Left: cart + details ---------- */}
      <div className="shop__workspace">
        <div className="shop__inner">
          <p className="eyebrow">Checkout</p>

          {placed ? (
            <>
              <h1 className="display display--medium">
                Thank you, {placed.customerName.split(' ')[0]}. <em>Your order is in.</em>
              </h1>
              <div className="confirmation" role="status">
                <p className="confirmation__ref">Order {orderReference(placed.id)}</p>
                <p>
                  We have your order for {placed.totalKg} kg ({formatUGX(placed.total)}) to {placed.deliveryLocation}.
                  Tap the button below to send it to us on WhatsApp, and we’ll reply to agree a delivery time.{' '}
                  {SITE.payment}
                </p>
                <div className="button-row">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                    Confirm on WhatsApp
                  </a>
                  <Link href="/shop" className="btn btn--ghost" onClick={startAgain}>
                    Continue shopping
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="display display--medium">
                Your cart. <em>Almost there.</em>
              </h1>

              {!cart.loaded ? (
                <p className="muted">Loading your cart…</p>
              ) : isEmpty ? (
                <div className="empty-cart">
                  <p className="lede">Your cart is empty.</p>
                  <div className="button-row">
                    <Link href="/shop" className="btn btn--primary">
                      Browse the shop
                    </Link>
                    <Link href="/shop#trial-pack" className="btn btn--ghost">
                      Try the 5 kg Trial Pack
                    </Link>
                  </div>
                </div>
              ) : (
                <form id="checkout-form" className="order-form" onSubmit={handleSubmit} noValidate>
                  {/* Cart lines */}
                  <fieldset className="field-group">
                    <legend className="field-group__legend">
                      <span>01</span> Your items
                    </legend>

                    <ul className="cart-lines">
                      {cart.lines.map((line) => {
                        const product = getProduct(line.productId);
                        return (
                          <li key={line.productId} className="cart-line">
                            <Link
                              href={`/products/${line.productId}`}
                              className="cart-line__thumb"
                              style={{ backgroundColor: line.imageBg }}
                            >
                              <Image src={line.image} alt="" fill sizes="80px" />
                            </Link>
                            <div className="cart-line__info">
                              <p className="cart-line__name">{line.name}</p>
                              <p className="cart-line__meta">
                                {line.unitLabel === 'kg'
                                  ? `${formatUGX(line.unitPrice)} per kg`
                                  : `${line.kgPerUnit} kg ${line.unitLabel} · ${formatUGX(line.unitPrice)}`}
                              </p>
                              <button
                                type="button"
                                className="cart-line__remove"
                                onClick={() => cart.removeItem(line.productId)}
                              >
                                Remove
                              </button>
                            </div>

                            <div className="quantity quantity--small">
                              <button
                                type="button"
                                className="quantity__btn"
                                onClick={() => cart.setQuantity(line.productId, line.quantity - 1)}
                                aria-label={`One less ${line.name}`}
                              >
                                &minus;
                              </button>
                              <label className="quantity__field">
                                <span className="visually-hidden">Quantity of {line.name}</span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  max={product.maxQty}
                                  value={line.quantity}
                                  onChange={(event) => {
                                    const value = Math.floor(Number(event.target.value));
                                    if (!Number.isNaN(value) && value >= 1) cart.setQuantity(line.productId, value);
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                className="quantity__btn"
                                onClick={() => cart.setQuantity(line.productId, line.quantity + 1)}
                                disabled={line.quantity >= product.maxQty}
                                aria-label={`One more ${line.name}`}
                              >
                                +
                              </button>
                            </div>

                            <p className="cart-line__total">{formatUGX(line.lineTotal)}</p>
                          </li>
                        );
                      })}
                    </ul>

                    {overLimit && (
                      <p className="field-error">
                        Your cart is {cart.totalKg} kg. We deliver up to {MAX_ORDER_KG} kg per order, so please reduce
                        it, or message us on WhatsApp for a bulk order.
                      </p>
                    )}
                    {errors.items && <p className="field-error">{errors.items}</p>}
                    <Link href="/shop" className="text-link">
                      Add more items
                    </Link>
                  </fieldset>

                  {/* Details */}
                  <fieldset className="field-group">
                    <legend className="field-group__legend">
                      <span>02</span> Delivery details
                    </legend>

                    <div className="field">
                      <label htmlFor="customerName">Full name</label>
                      <input
                        id="customerName"
                        name="customerName"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        value={form.customerName}
                        onChange={updateField}
                        aria-invalid={Boolean(errors.customerName)}
                      />
                      {errors.customerName && <p className="field-error">{errors.customerName}</p>}
                    </div>

                    <div className="field">
                      <label htmlFor="phone">Phone number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="0772 123456"
                        maxLength={16}
                        value={form.phone}
                        onChange={updateField}
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {errors.phone && <p className="field-error">{errors.phone}</p>}
                    </div>

                    <div className="field">
                      <label htmlFor="deliveryLocation">Delivery area</label>
                      <select
                        id="deliveryLocation"
                        name="deliveryLocation"
                        value={form.deliveryLocation}
                        onChange={updateField}
                        aria-invalid={Boolean(errors.deliveryLocation)}
                      >
                        <option value="">Select an area</option>
                        {LOCATIONS.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                      {errors.deliveryLocation && <p className="field-error">{errors.deliveryLocation}</p>}
                    </div>

                    <div className="field">
                      <label htmlFor="deliveryNotes">
                        Landmark or directions <span className="field__optional">optional</span>
                      </label>
                      <textarea
                        id="deliveryNotes"
                        name="deliveryNotes"
                        rows={3}
                        maxLength={255}
                        value={form.deliveryNotes}
                        onChange={updateField}
                      />
                    </div>
                  </fieldset>

                  {status.state === 'error' && (
                    <p className="form-alert" role="alert">
                      {status.message}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------- Right: order summary ---------- */}
      <aside className="shop__summary" aria-live="polite">
        <div className="summary">
          <p className="eyebrow eyebrow--amber">{placed ? 'Order placed' : 'Order summary'}</p>

          {shown.lines.length === 0 ? (
            <p className="summary__empty">Nothing here yet. Items you add will appear in this summary.</p>
          ) : (
            <>
              <dl className="summary__lines">
                {shown.lines.map((line) => (
                  <div key={line.productId}>
                    <dt>
                      {line.name}
                      <span>{unitText(line.quantity, line.unitLabel)}</span>
                    </dt>
                    <dd>{formatUGX(line.lineTotal)}</dd>
                  </div>
                ))}
                <div>
                  <dt>Total weight</dt>
                  <dd>{shown.totalKg} kg</dd>
                </div>
              </dl>

              <div className="summary__total">
                <span>Total</span>
                <strong>{formatUGX(shown.total)}</strong>
              </div>

              {!placed && (
                <button
                  type="submit"
                  form="checkout-form"
                  className="btn btn--amber btn--block summary__submit"
                  disabled={status.state === 'saving' || overLimit}
                >
                  {status.state === 'saving' ? 'Placing order…' : 'Place order'}
                </button>
              )}

              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp btn--block">
                {placed ? 'Confirm on WhatsApp' : 'Or order on WhatsApp'}
              </a>
            </>
          )}

          <ul className="summary__fine">
            <li>{SITE.payment}</li>
            <li>We confirm your delivery time on WhatsApp.</li>
            <li>Delivery to {SITE.deliveryAreas.join(', ')} and other parts of Kampala on request.</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
