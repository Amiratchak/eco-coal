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

You need **Node.js 20.9 or newer** (https://nodejs.org) and **XAMPP** installed.

1. **Get the code.** In a terminal, run:
   ```
   git clone https://github.com/Amiratchak/eco-coal.git
   cd eco-coal
   ```
   Then open the `eco-coal` folder in VS Code.

2. **Create your settings file.** In the VS Code terminal, run:
   ```
   Copy-Item .env.example .env.local
   ```
   Without this file, the site runs but the staff login (`/admin`) will not work.

3. **Start XAMPP.** Open the XAMPP Control Panel and start **Apache** and **MySQL**.

4. **Create the database.** Go to http://localhost/phpmyadmin, click **Import**,
   choose `database.sql` from the project folder, then click **Import** (or **Go**).

5. **Install and run.** In the VS Code terminal, run:
   ```
   npm install
   npm run dev
   ```

6. **Open the site** at http://localhost:3000

**Staff login:** http://localhost:3000/admin, passcode `ecocoal-staff` (change it in `.env.local`).

## Changing things

- Prices and products: `src/lib/products.js`
- Delivery areas, payment text: `src/lib/site.js`
- Photos: replace the files in `public/images/` with your own photos using the same file names
  (hero.jpg, detail.jpg, trial-pack.jpg, home-bag.jpg, business-sack.jpg, by-the-kilo.jpg).
