-- Hardware & IoT: device registry, GPS telemetry, scale weigh-ins

CREATE TABLE IF NOT EXISTS iot_devices (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  device_key VARCHAR(32) NOT NULL,
  device_key_hash VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL,
  device_type ENUM(
    'temperature_probe',
    'humidity_sensor',
    'door_sensor',
    'scale',
    'gps_tracker',
    'gateway',
    'barcode_scanner',
    'other'
  ) NOT NULL DEFAULT 'temperature_probe',
  external_id VARCHAR(100) NULL,
  facility_id VARCHAR(36) NULL,
  zone_id VARCHAR(36) NULL,
  boat_id VARCHAR(36) NULL,
  metadata JSON NULL,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  last_seen_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_device_key (device_key),
  UNIQUE KEY uq_tenant_external (tenant_id, external_id),
  INDEX idx_tenant_type (tenant_id, device_type),
  INDEX idx_tenant_facility (tenant_id, facility_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gps_telemetry (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  boat_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(36) NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed_knots DECIMAL(6, 2) NULL,
  heading_deg SMALLINT NULL,
  accuracy_m DECIMAL(8, 2) NULL,
  recorded_at TIMESTAMP NOT NULL,
  source ENUM('iot', 'mobile', 'import') DEFAULT 'iot',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_boat_time (tenant_id, boat_id, recorded_at DESC),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scale_readings (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(36) NULL,
  weight_kg DECIMAL(12, 3) NOT NULL,
  unit ENUM('kg', 'lb') DEFAULT 'kg',
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(36) NULL,
  location_label VARCHAR(120) NULL,
  recorded_at TIMESTAMP NOT NULL,
  source ENUM('iot', 'manual', 'import') DEFAULT 'iot',
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_time (tenant_id, recorded_at DESC),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE iot_sensor_events
  ADD COLUMN device_id VARCHAR(36) NULL AFTER sensor_id;
