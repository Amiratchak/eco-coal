'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'Our story' },
  { href: '/help', label: 'Delivery & FAQ' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, loaded } = useCart();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const count = loaded ? itemCount : 0;

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Small pulse on the cart button when something is added.
  useEffect(() => {
    if (!loaded || count === 0) return undefined;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(timer);
  }, [count, loaded]);

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/') || (href === '/shop' && pathname.startsWith('/products'));

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="wordmark" aria-label="Eco Coal home">
          <span className="wordmark__leaf" aria-hidden="true" />
          Eco<span>Coal</span>
        </Link>

        <div className="site-header__right">
          <nav id="primary-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
            <ul>
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`site-nav__link${isActive(link.href) ? ' is-active' : ''}`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/checkout"
            className={`cart-link${pathname.startsWith('/checkout') ? ' is-active' : ''}${bump ? ' is-bumped' : ''}`}
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <svg className="cart-link__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            <span className="cart-link__label">Cart</span>
            <span className={`cart-link__count${count > 0 ? ' has-items' : ''}`}>{count}</span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav-toggle__bar" />
            <span className="nav-toggle__bar" />
            <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
