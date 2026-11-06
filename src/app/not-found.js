import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-head">
      <div className="wrap page-head__inner">
        <p className="eyebrow">Page not found</p>
        <h1 className="display display--medium">
          This page has gone <em>up in smoke.</em>
        </h1>
        <p className="lede">The link may be old or mistyped. Let’s get you back to the briquettes.</p>
        <div className="button-row">
          <Link href="/shop" className="btn btn--primary">
            Go to the shop
          </Link>
          <Link href="/" className="btn btn--ghost">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
