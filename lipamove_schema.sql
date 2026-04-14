-- LipaMove commuter tracking — prototype relational model (MySQL 8+ / MariaDB compatible)
-- Supports: fleet registry, routes as ordered waypoints, live positions, and commuter-facing queries.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS operators (
  id            SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(32) NOT NULL UNIQUE,
  display_name  VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS routes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(64) NOT NULL UNIQUE,
  label         VARCHAR(200) NOT NULL
);

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
);

CREATE TABLE IF NOT EXISTS route_waypoints (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  route_id    INT UNSIGNED NOT NULL,
  seq         SMALLINT UNSIGNED NOT NULL,
  latitude    DECIMAL(9,6) NOT NULL,
  longitude   DECIMAL(9,6) NOT NULL,
  stop_label  VARCHAR(160) NULL,
  UNIQUE KEY uq_route_seq (route_id, seq),
  CONSTRAINT fk_wp_route FOREIGN KEY (route_id) REFERENCES routes (id)
);

CREATE TABLE IF NOT EXISTS vehicle_positions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vehicle_id   INT UNSIGNED NOT NULL,
  recorded_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  latitude     DECIMAL(9,6) NOT NULL,
  longitude    DECIMAL(9,6) NOT NULL,
  occupancy    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_vehicle_time (vehicle_id, recorded_at),
  CONSTRAINT fk_pos_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
);

-- --- Example seed (matches XML-style demo units; adjust IDs after insert) ---
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

-- Sample vehicles (public_id aligns with data.xml unit @id)
INSERT INTO vehicles (public_id, operator_id, route_id, vehicle_type, typical_speed_kph) VALUES
  ('LM-BTR-01', 1, 1, 'batrasco', 27.00),
  ('LM-JP-01', 2, 3, 'jeepney', 22.50)
ON DUPLICATE KEY UPDATE vehicle_type = VALUES(vehicle_type), typical_speed_kph = VALUES(typical_speed_kph);

-- --- Queries useful for the commuter app ---

-- 1) Active fleet with last known position (for map tiles / list UI)
/*
SELECT v.public_id,
       v.vehicle_type,
       v.typical_speed_kph,
       r.label AS route_label,
       p.latitude,
       p.longitude,
       p.occupancy,
       p.recorded_at
FROM vehicles v
JOIN routes r ON r.id = v.route_id
JOIN vehicle_positions p ON p.id = (
  SELECT p2.id
  FROM vehicle_positions p2
  WHERE p2.vehicle_id = v.id
  ORDER BY p2.recorded_at DESC
  LIMIT 1
)
WHERE v.active = 1;
*/

-- 2) Nearest vehicle to a commuter standing at (@comm_lat, @comm_lng) — haversine in km
/*
SET @comm_lat := 13.94169;
SET @comm_lng := 121.16332;

SELECT v.public_id,
       v.vehicle_type,
       r.label AS route,
       p.latitude,
       p.longitude,
       p.occupancy,
       (6371 * ACOS(
         LEAST(1, GREATEST(-1,
           COS(RADIANS(@comm_lat)) * COS(RADIANS(p.latitude))
           * COS(RADIANS(p.longitude) - RADIANS(@comm_lng))
           + SIN(RADIANS(@comm_lat)) * SIN(RADIANS(p.latitude))
         ))
       )) AS distance_km
FROM vehicles v
JOIN routes r ON r.id = v.route_id
JOIN vehicle_positions p ON p.id = (
  SELECT p2.id FROM vehicle_positions p2
  WHERE p2.vehicle_id = v.id
  ORDER BY p2.recorded_at DESC LIMIT 1
)
WHERE v.active = 1
ORDER BY distance_km ASC
LIMIT 1;
*/

-- 3) Rough ETA (minutes) from distance + typical speed + simple congestion factor on occupancy
/*
SET @comm_lat := 13.94169;
SET @comm_lng := 121.16332;
SET @rush := 1.25;

SELECT v.public_id,
       dist.distance_km,
       CEIL((dist.distance_km / NULLIF(v.typical_speed_kph, 0)) * 60 * @rush
            + (p.occupancy * 0.08)) AS eta_minutes
FROM vehicles v
JOIN (
  SELECT vp.vehicle_id,
         (6371 * ACOS(LEAST(1, GREATEST(-1,
           COS(RADIANS(@comm_lat)) * COS(RADIANS(vp.latitude))
           * COS(RADIANS(vp.longitude) - RADIANS(@comm_lng))
           + SIN(RADIANS(@comm_lat)) * SIN(RADIANS(vp.latitude))
         )))) AS distance_km
  FROM vehicle_positions vp
  JOIN (
    SELECT vehicle_id, MAX(recorded_at) AS mx
    FROM vehicle_positions
    GROUP BY vehicle_id
  ) last ON last.vehicle_id = vp.vehicle_id AND last.mx = vp.recorded_at
) dist ON dist.vehicle_id = v.id
JOIN vehicle_positions p ON p.vehicle_id = v.id
JOIN (
  SELECT vehicle_id, MAX(recorded_at) AS mx
  FROM vehicle_positions
  GROUP BY vehicle_id
) last2 ON last2.vehicle_id = p.vehicle_id AND last2.mx = p.recorded_at
WHERE v.active = 1
ORDER BY eta_minutes ASC
LIMIT 5;
*/
