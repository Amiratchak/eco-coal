import mysql from 'mysql2/promise';

/*
 * Promise-based MySQL connection pool for a local XAMPP install.
 * Defaults match a fresh XAMPP setup: 127.0.0.1, user "root", no password.
 * Values can be changed in .env.local without touching this file.
 *
 * The pool is stored on globalThis so that Next.js hot reloading in
 * development does not open a new pool on every file save.
 */

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eco_coal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
};

const globalForDb = globalThis;

export const pool = globalForDb.__ecoCoalPool || mysql.createPool(config);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__ecoCoalPool = pool;
}

/**
 * Run a parameterised query and return only the rows.
 * Always pass user input through `params`, never by joining strings.
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export default pool;
