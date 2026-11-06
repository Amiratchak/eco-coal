/*
 * Business details shown across the website.
 * Change these in one place and every page updates.
 */

export const SITE = {
  name: 'Eco Coal',
  city: 'Kampala',
  tagline: 'Cleaner cooking energy, made from waste.',

  // WhatsApp number in international format, digits only. Set it in .env.local
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256700000000').replace(/\D/g, ''),

  deliveryAreas: ['Mengo', 'Owino', 'Kalerwe', 'Nakawa'],

  payment: 'Pay on delivery with cash or Mobile Money.',
  hours: 'Orders are delivered Monday to Saturday.',
};

export function whatsappDisplay() {
  const n = SITE.whatsappNumber;
  return n.length === 12 ? `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : `+${n}`;
}

export function whatsappLink(message = 'Hello Eco Coal, I have a question.') {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
