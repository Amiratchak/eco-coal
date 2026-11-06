# Eco Coal

Online store for Eco Coal charcoal briquettes, made in Kampala from organic waste.
Built with Next.js (App Router), plain CSS, JavaScript and MySQL running in XAMPP.

## Pages

- `/` Home
- `/shop` All products
- `/products/[id]` One product (trial-pack, home-bag, business-sack, by-the-kilo)
- `/checkout` Cart, delivery details and order placement
- `/about` Our story
- `/help` Delivery & FAQ
- `/admin` Staff page: orders, daily sales against the 100 kg target, market price checks

## Run it locally

1. Install Node.js 20.9 or newer from https://nodejs.org
2. Start Apache and MySQL in the XAMPP Control Panel.
3. Open http://localhost/phpmyadmin, click Import, choose `database.sql`, click Import/Go.
4. In `.env.local`, set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the business number and change `ADMIN_KEY`.
5. In the VS Code terminal run `npm install`, then `npm run dev`.
6. Open http://localhost:3000

## Changing things

- Prices and products: `src/lib/products.js`
- Delivery areas, payment text: `src/lib/site.js`
- Photos: replace the files in `public/images/` with your own photos using the same file names
  (hero.jpg, detail.jpg, trial-pack.jpg, home-bag.jpg, business-sack.jpg, by-the-kilo.jpg).
