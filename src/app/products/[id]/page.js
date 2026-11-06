import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCart from '../../components/AddToCart';
import ProductCard from '../../components/ProductCard';
import { PRODUCTS, getProduct, formatUGX, sizeText, PRICE_PER_KG } from '@/lib/products';
import { SITE } from '@/lib/site';

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: 'Product not found' };
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const others = PRODUCTS.filter((item) => item.id !== product.id);
  const perKg = product.price / product.kgPerUnit;

  return (
    <>
      <section className="product">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product__grid">
            <div className="product__media" style={{ backgroundColor: product.imageBg }}>
              <Image
                src={product.image}
                alt={`${product.name}: Eco Coal charcoal briquettes`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
                className="product__img"
              />
              {product.badge && <span className="badge">{product.badge}</span>}
            </div>

            <div className="product__info">
              <p className="eyebrow">{product.tagline}</p>
              <h1 className="display display--medium">{product.name}</h1>

              <p className="product__price">
                {formatUGX(product.price)}
                <span>{product.unitLabel === 'kg' ? ' per kg' : ` · ${sizeText(product)}`}</span>
              </p>
              {product.unitLabel !== 'kg' && (
                <p className="product__perkg">
                  {formatUGX(perKg)} per kg
                  {perKg < PRICE_PER_KG && ` (usually ${formatUGX(PRICE_PER_KG)})`}
                </p>
              )}

              <p className="product__desc">{product.description}</p>

              <AddToCart productId={product.id} />

              <ul className="product__facts">
                <li>
                  <strong>Made from</strong> carbonized farm and organic waste, bound with cassava starch
                </li>
                <li>
                  <strong>Delivery</strong> to {SITE.deliveryAreas.join(', ')} and other parts of Kampala on request
                </li>
                <li>
                  <strong>Payment</strong> {(SITE.payment.charAt(0).toLowerCase() + SITE.payment.slice(1)).replace(/\.$/, '')}
                </li>
                <li>
                  <strong>Safety</strong> like all charcoal, burn in a well-ventilated space
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <header className="section-head">
            <h2 className="heading heading--small">You might also like</h2>
            <Link href="/shop" className="text-link">
              All products
            </Link>
          </header>
          <div className="product-grid product-grid--three">
            {others.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
