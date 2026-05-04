-- =============================================================================
-- LipaMove — full MySQL setup for MySQL Workbench (MySQL 8+)
-- Run: File → Open SQL Script → select this file → lightning bolt (Execute)
-- Or paste into a new query tab while connected to your MySQL instance.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS lipamove
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lipamove;

-- ---------------------------------------------------------------------------
-- Fleet / routes (from lipamove_schema.sql)
-- ---------------------------------------------------------------------------

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS operators (
  id            SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(32) NOT NULL UNIQUE,
  display_name  VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS routes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(64) NOT NULL UNIQUE,
  label         VARCHAR(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id         VARCHAR(32) NOT NULL UNIQUE,
  operator_id       SMALLINT UNSIGNED NOT NULL,
  route_id          INT UNSIGNED NOT NULL,
  vehicle_type      ENUM('jeepney', 'batrasco') NOT NULL DEFAULT 'jeepney',
  typical_speed_kph DECIMAL(5,2) NOT NULL DEFAULT 24.00,
  active            TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_vehicles_operator FOREIGN KEY (operator_id) REFERENCES operators (id),
  CONSTRAINT fk_vehicles_route FOREIGN KEY (route_id) REFERENCES routes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_waypoints (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  route_id    INT UNSIGNED NOT NULL,
  seq         SMALLINT UNSIGNED NOT NULL,
  latitude    DECIMAL(9,6) NOT NULL,
  longitude   DECIMAL(9,6) NOT NULL,
  stop_label  VARCHAR(160) NULL,
  UNIQUE KEY uq_route_seq (route_id, seq),
  CONSTRAINT fk_wp_route FOREIGN KEY (route_id) REFERENCES routes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_positions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vehicle_id   INT UNSIGNED NOT NULL,
  recorded_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  latitude     DECIMAL(9,6) NOT NULL,
  longitude    DECIMAL(9,6) NOT NULL,
  occupancy    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_vehicle_time (vehicle_id, recorded_at),
  CONSTRAINT fk_pos_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO operators (code, display_name) VALUES
  ('BATRASCO', 'Batangas Radio Control Service Cooperative'),
  ('TRAD', 'Traditional PUJ operators')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO routes (code, label) VALUES
  ('AYALA_SM_LOOP', 'Ayala Hwy - SM Lipa Loop'),
  ('TAMBO_POB', 'Tambo Exit - Lipa Poblacion'),
  ('MARKET_SM', 'Public Market - SM Lipa (Jeepney)'),
  ('PLAZA_AYALA', 'Plaza M. Luna - Ayala Highway (Jeepney)')
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO vehicles (public_id, operator_id, route_id, vehicle_type, typical_speed_kph) VALUES
  ('LM-BTR-01', 1, 1, 'batrasco', 27.00),
  ('LM-JP-01', 2, 3, 'jeepney', 22.50)
ON DUPLICATE KEY UPDATE vehicle_type = VALUES(vehicle_type), typical_speed_kph = VALUES(typical_speed_kph);

-- ---------------------------------------------------------------------------
-- Auth (from server/schema_auth.sql)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_sessions_token (token),
  KEY idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Done. Verify: SHOW TABLES IN lipamove;
