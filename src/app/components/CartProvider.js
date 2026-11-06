'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, priceCart } from '@/lib/products';

/*
 * Shopping cart shared by every page.
 * Items are kept as [{ productId, quantity }] and saved in the
 * browser's localStorage so the cart survives a page refresh.
 */

const STORAGE_KEY = 'eco-coal-cart';
const CartContext = createContext(null);

function readCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => getProduct(item?.productId)) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable: the cart still works until the tab closes */
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeCart(items);
  }, [items, loaded]);

  const setQuantity = useCallback((productId, quantity) => {
    const product = getProduct(productId);
    if (!product) return;
    const qty = Math.max(0, Math.min(product.maxQty, Math.floor(Number(quantity) || 0)));
    setItems((current) => {
      const others = current.filter((item) => item.productId !== productId);
      if (qty === 0) return others;
      const exists = current.some((item) => item.productId === productId);
      return exists
        ? current.map((item) => (item.productId === productId ? { productId, quantity: qty } : item))
        : [...current, { productId, quantity: qty }];
    });
  }, []);

  const addItem = useCallback((productId, quantity = 1) => {
    const product = getProduct(productId);
    if (!product) return;
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      const next = Math.min(product.maxQty, (existing?.quantity || 0) + Math.max(1, Math.floor(quantity)));
      return existing
        ? current.map((item) => (item.productId === productId ? { productId, quantity: next } : item))
        : [...current, { productId, quantity: next }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const priced = priceCart(items);
    return {
      items,
      loaded,
      ...priced,
      quantityOf: (productId) => items.find((item) => item.productId === productId)?.quantity || 0,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [items, loaded, addItem, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>.');
  return context;
}
