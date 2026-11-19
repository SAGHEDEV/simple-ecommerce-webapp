-- Furniro e-commerce schema (MySQL 8+ / MariaDB 10.5+)
-- Usage:  mysql -u <user> -p < database/schema.sql
-- Change the database name below if you don't want "furniro".

CREATE DATABASE IF NOT EXISTS furniro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE furniro;

-- Customers ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders ------------------------------------------------------------------
-- `total` is stored in the base currency (USD). `currency` and `exchange_rate`
-- record what the customer saw at checkout (display amount = total * exchange_rate).
CREATE TABLE IF NOT EXISTS orders (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            INT UNSIGNED NOT NULL,
  reference          VARCHAR(40)  NOT NULL,
  status             ENUM('pending','paid','delivered') NOT NULL DEFAULT 'pending',
  total              DECIMAL(12,2) NOT NULL,
  currency           CHAR(3)       NOT NULL DEFAULT 'USD',
  exchange_rate      DECIMAL(18,6) NOT NULL DEFAULT 1,
  shipping_full_name VARCHAR(150) NOT NULL,
  shipping_phone     VARCHAR(40)  NOT NULL,
  shipping_address   VARCHAR(255) NOT NULL,
  shipping_city      VARCHAR(100) NOT NULL,
  shipping_state     VARCHAR(100) NOT NULL,
  shipping_postal    VARCHAR(20)  NOT NULL DEFAULT '',
  shipping_country   VARCHAR(100) NOT NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at            DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_reference (reference),
  KEY idx_orders_user_created (user_id, created_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order line items (product data is snapshotted at purchase time) ---------
CREATE TABLE IF NOT EXISTS order_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id   INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  title      VARCHAR(255) NOT NULL,
  thumbnail  VARCHAR(500) NOT NULL,
  price      DECIMAL(12,2) NOT NULL,
  quantity   INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
