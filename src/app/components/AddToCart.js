'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { getProduct, formatUGX, unitText } from '@/lib/products';

/*
 * Add-to-cart control for one product.
 *   variant="full"    quantity picker + button (product page)
 *   variant="compact" single "Add" button (product cards)
 */
export default function AddToCart({ productId, variant = 'full' }) {
  const product = getProduct(productId);
  const { addItem, quantityOf } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return undefined;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  if (!product) return null;

  const inCart = quantityOf(product.id);
  const room = product.maxQty - inCart;
  const atLimit = room <= 0;

  function add(amount) {
    if (atLimit) return;
    addItem(product.id, Math.min(amount, room));
    setQty(1);
    setAdded(true);
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        className={`add-btn${added ? ' is-added' : ''}`}
        onClick={() => add(1)}
        disabled={atLimit}
        aria-label={`Add ${product.name} to cart`}
      >
        {atLimit ? 'In cart' : added ? 'Added' : 'Add to cart'}
      </button>
    );
  }

  const max = Math.max(1, room);
  const quick = product.unitLabel === 'kg' ? [2, 5, 10, 20].filter((n) => n <= room) : [];

  return (
    <div className="add-to-cart">
      <div className="add-to-cart__row">
        <div className="quantity">
          <button
            type="button"
            className="quantity__btn"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            disabled={qty <= 1 || atLimit}
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <label className="quantity__field">
            <span className="visually-hidden">Quantity</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={max}
              value={qty}
              disabled={atLimit}
              onChange={(event) => {
                const value = Math.floor(Number(event.target.value));
                if (!Number.isNaN(value)) setQty(Math.max(1, Math.min(max, value)));
              }}
            />
          </label>
          <button
            type="button"
            className="quantity__btn"
            onClick={() => setQty((value) => Math.min(max, value + 1))}
            disabled={qty >= room || atLimit}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          className={`btn btn--primary add-to-cart__btn${added ? ' is-added' : ''}`}
          onClick={() => add(qty)}
          disabled={atLimit}
        >
          {atLimit ? 'Limit reached' : added ? 'Added to cart ✓' : `Add to cart · ${formatUGX(product.price * qty)}`}
        </button>
      </div>

      {quick.length > 0 && (
        <div className="quick-picks" aria-label="Quick amounts">
          {quick.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`quick-picks__btn${qty === amount ? ' is-active' : ''}`}
              onClick={() => setQty(amount)}
            >
              {amount} kg
            </button>
          ))}
        </div>
      )}

      <p className="add-to-cart__note" aria-live="polite">
        {inCart > 0 ? (
          <>
            {unitText(inCart, product.unitLabel)} in your cart · <Link href="/checkout">Go to checkout</Link>
          </>
        ) : product.maxQty < 10 ? (
          `Up to ${unitText(product.maxQty, product.unitLabel)} per order.`
        ) : (
          ' '
        )}
      </p>
    </div>
  );
}
