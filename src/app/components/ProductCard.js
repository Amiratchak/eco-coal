import Image from 'next/image';
import Link from 'next/link';
import AddToCart from './AddToCart';
import { formatUGX, sizeText } from '@/lib/products';

export default function ProductCard({ product, priority = false }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`} className="product-card__media" style={{ backgroundColor: product.imageBg }}>
        <Image
          src={product.image}
          alt={`${product.name}: Eco Coal charcoal briquettes`}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw"
          className="product-card__img"
          priority={priority}
        />
        {product.badge && <span className="badge">{product.badge}</span>}
      </Link>

      <div className="product-card__body">
        <p className="product-card__size">{sizeText(product)}</p>
        <h3 className="product-card__name">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__tagline">{product.tagline}</p>
        <div className="product-card__foot">
          <p className="product-card__price">
            {formatUGX(product.price)}
            {product.unitLabel === 'kg' && <span> / kg</span>}
          </p>
          <AddToCart productId={product.id} variant="compact" />
        </div>
      </div>
    </article>
  );
}
