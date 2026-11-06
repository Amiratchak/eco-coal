import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '@/lib/products';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Shop',
  description: 'Buy Eco Coal charcoal briquettes online: Trial Pack, Home Bag, Business Sack or any weight by the kilo.',
};

export default function ShopPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head__inner">
          <p className="eyebrow">Shop</p>
          <h1 className="display display--medium">
            Clean fuel, <em>sized for your kitchen.</em>
          </h1>
          <p className="lede">
            Every bag holds the same Eco Coal briquettes. Choose the size that suits you, add it to your cart, and we’ll
            deliver.
          </p>
        </div>
      </section>

      <section className="section section--flush">
        <div className="wrap">
          <div className="product-grid">
            {PRODUCTS.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap info-row">
          <div>
            <h2 className="info-row__title">Delivery</h2>
            <p>To your door in {SITE.deliveryAreas.join(', ')}. Other parts of Kampala on request.</p>
          </div>
          <div>
            <h2 className="info-row__title">Payment</h2>
            <p>{SITE.payment} We confirm your order on WhatsApp first.</p>
          </div>
          <div>
            <h2 className="info-row__title">Questions?</h2>
            <p>
              See <Link href="/help">Delivery &amp; FAQ</Link> for how to light, store and use briquettes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
