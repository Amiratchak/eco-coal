import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './components/CartProvider';

export const metadata = {
  title: {
    default: 'Eco Coal — Cleaner cooking energy, made from waste',
    template: '%s · Eco Coal',
  },
  description:
    'Eco Coal charcoal briquettes are made in Kampala from organic waste. Order online and we deliver to Mengo, Owino, Kalerwe and Nakawa.',
};

export const viewport = {
  themeColor: '#1f3b2c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <CartProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
