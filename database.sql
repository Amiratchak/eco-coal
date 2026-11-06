-- =============================================================
-- Eco Coal online store
-- Database schema for XAMPP (MySQL / MariaDB) via phpMyAdmin
--
-- How to use:
--   1. Start Apache and MySQL in the XAMPP Control Panel.
--   2. Open http://localhost/phpmyadmin
--   3. Click the "Import" tab, choose this file, then click "Go".
--
-- Note: importing this file again resets the orders tables.
-- Price checks are kept.
-- =============================================================

CREATE DATABASE IF NOT EXISTS eco_coal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE eco_coal;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- -------------------------------------------------------------
-- One row per customer order placed at checkout.
-- total_kg and total_ugx are calculated on the server.
-- -------------------------------------------------------------
CREATE TABLE orders (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name     VARCHAR(120) NOT NULL,
  phone             VARCHAR(15)  NOT NULL,
  delivery_location VARCHAR(40)  NOT NULL,
  delivery_notes    VARCHAR(255) NULL,
  item_count        SMALLINT UNSIGNED NOT NULL,
  total_kg          DECIMAL(7,2) UNSIGNED NOT NULL,
  total_ugx         INT UNSIGNED NOT NULL,
  status            ENUM('pending', 'confirmed', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_created (created_at),
  KEY idx_orders_status (status),
  KEY idx_orders_location (delivery_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- The products inside each order (Trial Pack, Home Bag, etc.).
-- Name and price are copied in so old orders stay correct even
-- if prices change later.
-- -------------------------------------------------------------
CREATE TABLE order_items (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id       INT UNSIGNED NOT NULL,
  product_id     VARCHAR(40)  NOT NULL,
  product_name   VARCHAR(80)  NOT NULL,
  unit_label     VARCHAR(10)  NOT NULL,
  kg_per_unit    DECIMAL(6,2) UNSIGNED NOT NULL,
  unit_price_ugx INT UNSIGNED NOT NULL,
  quantity       SMALLINT UNSIGNED NOT NULL,
  line_kg        DECIMAL(7,2) UNSIGNED NOT NULL,
  line_total_ugx INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_items_order (order_id),
  KEY idx_items_product (product_id),
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Staff log of local charcoal prices (Owino, Kalerwe, Nakawa),
-- recorded from seller interviews and used for pricing decisions.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_checks (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  market           VARCHAR(40)  NOT NULL,
  seller_name      VARCHAR(120) NOT NULL,
  charcoal_quality VARCHAR(80)  NOT NULL,
  bag_weight_kg    DECIMAL(6,2) UNSIGNED NOT NULL,
  price_ugx        INT UNSIGNED NOT NULL,
  check_date       DATE NOT NULL,
  notes            VARCHAR(255) NULL,
  recorded_by      VARCHAR(80)  NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_price_market (market),
  KEY idx_price_date (check_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
