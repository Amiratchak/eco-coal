/*
 * Store catalogue and shared helpers.
 * Used by the shop, product, cart and checkout pages (browser) and by
 * the orders API (server), so prices are always calculated the same way.
 *
 * To change a price, edit it here. To use your own photo, replace the
 * file in public/images/ with one of the same name.
 */

import { SITE } from './site';

export const PRODUCTS = [
  {
    id: 'trial-pack',
    name: 'Trial Pack',
    tagline: 'Try it at home',
    summary: 'A 5 kg bag at half price, so you can cook with Eco Coal for a few days before you switch.',
    description:
      'New to briquettes? Start here. The Trial Pack is our standard 5 kg bag at a special price, so your household can light it, cook with it and decide for yourself. Limited to two bags per order.',
    image: '/images/trial-pack.jpg',
    imageBg: '#f2e4c9',
    kgPerUnit: 5,
    unitLabel: 'bag',
    price: 5000,
    maxQty: 2,
    badge: 'Half price',
  },
  {
    id: 'home-bag',
    name: 'Home Bag',
    tagline: 'For everyday family cooking',
    summary: 'A 5 kg bag of briquettes, the right size for a household kitchen.',
    description:
      'Our everyday bag. Five kilograms of briquettes made from organic waste, easy to carry home and simple to store in a dry corner of the kitchen.',
    image: '/images/home-bag.jpg',
    imageBg: '#f5ede0',
    kgPerUnit: 5,
    unitLabel: 'bag',
    price: 10000,
    maxQty: 20,
    badge: null,
  },
  {
    id: 'business-sack',
    name: 'Business Sack',
    tagline: 'For restaurants and food vendors',
    summary: 'A 25 kg sack for kitchens that cook all day.',
    description:
      'Built for busy kitchens. One 25 kg sack keeps a restaurant, food stall or school kitchen going, and we can deliver several sacks together.',
    image: '/images/business-sack.jpg',
    imageBg: '#dfe7da',
    kgPerUnit: 25,
    unitLabel: 'sack',
    price: 50000,
    maxQty: 4,
    badge: null,
  },
  {
    id: 'by-the-kilo',
    name: 'By the Kilo',
    tagline: 'Exactly the amount you need',
    summary: 'Any weight from 1 kg, at UGX 2,000 per kilogram.',
    description:
      'Need a little, or an amount that does not fit a bag? Choose any weight from 1 kg up to 100 kg and pay our standard price per kilogram.',
    image: '/images/by-the-kilo.jpg',
    imageBg: '#ece3d1',
    kgPerUnit: 1,
    unitLabel: 'kg',
    price: 2000,
    maxQty: 100,
    badge: null,
  },
];

export const PRICE_PER_KG = 2000;
export const MAX_ORDER_KG = 100;

export const LOCATIONS = [...SITE.deliveryAreas, 'Other area in Kampala'];
export const PRICE_CHECK_MARKETS = ['Owino', 'Kalerwe', 'Nakawa', 'Other'];

export const DAILY_TARGET_KG = 100;
export const DAILY_COST_MIN = 91000;
export const DAILY_COST_MAX = 106000;

export const WHATSAPP_NUMBER = SITE.whatsappNumber;

export function getProduct(id) {
  return PRODUCTS.find((product) => product.id === id) || null;
}

export function formatUGX(amount) {
  const value = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;
  const sign = value < 0 ? '−' : '';
  return sign + 'UGX ' + Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function unitText(quantity, unitLabel) {
  if (unitLabel === 'kg') return `${quantity} kg`;
  return `${quantity} ${unitLabel}${quantity === 1 ? '' : 's'}`;
}

export function sizeText(product) {
  return product.unitLabel === 'kg' ? 'Price per kg' : `${product.kgPerUnit} kg ${product.unitLabel}`;
}

/**
 * Turns [{ productId, quantity }] into priced lines and totals.
 * Unknown products are dropped, quantities are capped at each product's
 * maximum, and duplicate lines are merged.
 */
export function priceCart(items) {
  const merged = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const product = getProduct(item?.productId);
    const qty = Math.floor(Number(item?.quantity));
    if (!product || !Number.isFinite(qty) || qty < 1) return;
    merged.set(product.id, (merged.get(product.id) || 0) + qty);
  });

  const lines = [];
  merged.forEach((qty, id) => {
    const product = getProduct(id);
    const quantity = Math.min(qty, product.maxQty);
    lines.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      imageBg: product.imageBg,
      unitLabel: product.unitLabel,
      kgPerUnit: product.kgPerUnit,
      unitPrice: product.price,
      quantity,
      lineKg: quantity * product.kgPerUnit,
      lineTotal: quantity * product.price,
    });
  });

  const totalKg = lines.reduce((sum, line) => sum + line.lineKg, 0);
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  return { lines, totalKg, total, itemCount };
}

/**
 * Accepts Ugandan mobile numbers such as 0772 123456, +256 772 123456
 * or 256772123456 and returns them as 256XXXXXXXXX. Returns null if invalid.
 */
export function normalisePhone(raw) {
  const digits = String(raw || '').replace(/[\s\-()]/g, '').replace(/^\+/, '');
  let local;
  if (/^2567\d{8}$/.test(digits)) local = digits.slice(3);
  else if (/^07\d{8}$/.test(digits)) local = digits.slice(1);
  else if (/^7\d{8}$/.test(digits)) local = digits;
  else return null;
  return '256' + local;
}

export function orderReference(id) {
  return 'EC-' + String(id).padStart(4, '0');
}

export function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
