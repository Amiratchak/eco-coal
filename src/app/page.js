import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './components/ProductCard';
import AddToCart from './components/AddToCart';
import { PRODUCTS, getProduct } from '@/lib/products';
import { SITE } from '@/lib/site';

const REASONS = [
  {
    title: 'Waste put to use',
    text: 'Farm residues and organic waste that would rot in drains and dumps become fuel for your stove.',
  },
  {
    title: 'Less pressure on forests',
    text: 'Every bag of briquettes is charcoal that did not have to come from a freshly cut tree.',
  },
  {
    title: 'Made close to home',
    text: 'Produced in small batches here in Kampala and delivered straight to your door.',
  },
];

const STEPS = [
  { title: 'Choose your bag', text: 'Pick a Trial Pack, a Home Bag, a Business Sack or any weight by the kilo.' },
  { title: 'Check out in a minute', text: 'Just your name, phone number and area. No account, no card.' },
  { title: 'We bring it to you', text: 'We confirm a time on WhatsApp and you pay when it arrives.' },
];

export default function HomePage() {
  const trial = getProduct('trial-pack');

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__text reveal">
            <p className="eyebrow">Eco-friendly cooking fuel &middot; {SITE.city}</p>
            <h1 className="display">
              Cleaner energy for your kitchen, <em>made from waste.</em>
            </h1>
            <p className="lede">
              Eco Coal briquettes are made from farm and organic waste instead of freshly cut trees. Light them in your
              usual charcoal stove, and let us bring them to your door.
            </p>
            <div className="button-row">
              <Link href="/shop" className="btn btn--primary">
                Shop briquettes
              </Link>
              <Link href="/products/trial-pack" className="btn btn--ghost">
                Try 5 kg for UGX 5,000
              </Link>
            </div>
          </div>

          <div className="hero__media reveal reveal--late">
            <Image
              src="/images/hero.jpg"
              alt="A pile of Eco Coal charcoal briquettes"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
              className="hero__img"
            />
          </div>
        </div>

        <div className="wrap">
          <ul className="trust">
            <li>From UGX 2,000 per kg</li>
            <li>Delivery in {SITE.deliveryAreas.slice(0, -1).join(', ')} &amp; {SITE.deliveryAreas.at(-1)}</li>
            <li>{SITE.payment.replace('.', '')}</li>
          </ul>
        </div>
      </section>

      {/* ---------- Products ---------- */}
      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Shop by size</p>
              <h2 className="heading">One clean fuel, four ways to buy it.</h2>
            </div>
            <Link href="/shop" className="text-link">
              View all products
            </Link>
          </header>

          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why it matters ---------- */}
      <section className="section section--forest">
        <div className="wrap mission">
          <div className="mission__intro">
            <p className="eyebrow eyebrow--light">Why it matters</p>
            <h2 className="heading heading--light">Every bag is a small switch to greener energy.</h2>
            <p className="mission__lede">
              Most kitchens in Kampala cook with charcoal made from trees. Eco Coal gives you the same kind of fuel from
              a better source: waste that would otherwise go nowhere.
            </p>
            <Link href="/about" className="text-link text-link--light">
              Read our story
            </Link>
          </div>

          <ul className="mission__points">
            {REASONS.map((reason, index) => (
              <li key={reason.title}>
                <span className="mission__no">0{index + 1}</span>
                <div>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Trial offer ---------- */}
      <section className="section">
        <div className="wrap feature">
          <div className="feature__media" style={{ backgroundColor: trial.imageBg }}>
            <Image
              src={trial.image}
              alt="Eco Coal Trial Pack briquettes"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className="feature__img"
            />
            <span className="badge">{trial.badge}</span>
          </div>
          <div className="feature__text">
            <p className="eyebrow">New to briquettes?</p>
            <h2 className="heading">
              Try 5 kg for <em>UGX 5,000.</em>
            </h2>
            <p className="feature__lede">
              Not sure yet? The Trial Pack is our standard 5 kg bag at half price. Cook with it for a few days and decide
              for yourself.
            </p>
            <AddToCart productId={trial.id} />
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section--tint">
        <div className="wrap">
          <header className="section-head section-head--center">
            <p className="eyebrow">How ordering works</p>
            <h2 className="heading">Three steps to a full kitchen.</h2>
          </header>

          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title} className="steps__item">
                <span className="steps__no">{index + 1}</span>
                <h3 className="steps__title">{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Closing ---------- */}
      <section className="closing">
        <div className="wrap closing__inner">
          <h2 className="display display--small">
            Ready to cook greener? <em>Your first bag is a click away.</em>
          </h2>
          <Link href="/shop" className="btn btn--amber">
            Start shopping
          </Link>
        </div>
      </section>
    </>
  );
}
