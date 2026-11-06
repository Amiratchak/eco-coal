import Link from 'next/link';
import { SITE, whatsappDisplay, whatsappLink } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <p className="wordmark wordmark--light">
              <span className="wordmark__leaf" aria-hidden="true" />
              Eco<span>Coal</span>
            </p>
            <p className="site-footer__note">
              Charcoal briquettes made in {SITE.city} from organic waste. Cleaner energy for everyday cooking.
            </p>
          </div>

          <div className="site-footer__cols">
            <div>
              <p className="site-footer__heading">Shop</p>
              <Link href="/shop">All products</Link>
              <Link href="/products/trial-pack">Trial Pack</Link>
              <Link href="/checkout">Your cart</Link>
            </div>
            <div>
              <p className="site-footer__heading">Eco Coal</p>
              <Link href="/about">Our story</Link>
              <Link href="/help">Delivery &amp; FAQ</Link>
            </div>
            <div>
              <p className="site-footer__heading">Talk to us</p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp {whatsappDisplay()}
              </a>
              <span>{SITE.city}, Uganda</span>
            </div>
          </div>
        </div>

        <div className="site-footer__fine">
          <span>
            &copy; {year} {SITE.name}, {SITE.city}.
          </span>
          <Link href="/admin">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
