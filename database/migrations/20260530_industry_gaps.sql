-- Industry-specific gaps: delivery slots, returns, B2B pricing, quality, cooperative, offline sync
USE aqualedger32;

CREATE TABLE IF NOT EXISTS delivery_slots (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INT DEFAULT 20,
  booked_count INT DEFAULT 0,
  cold_chain TINYINT(1) DEFAULT 1,
  zone_label VARCHAR(100) NULL,
  status ENUM('open', 'full', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slot (tenant_id, slot_date, start_time),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_slot_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS delivery_notes VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS order_returns (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  return_number VARCHAR(50) NOT NULL,
  reason ENUM('spoiled', 'wrong_item', 'quality', 'late_delivery', 'other') NOT NULL,
  reason_detail TEXT NULL,
  status ENUM('requested', 'approved', 'rejected', 'refunded', 'closed') DEFAULT 'requested',
  refund_amount DECIMAL(14,2) DEFAULT 0,
  requested_by VARCHAR(36) NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_return_number (return_number),
  INDEX idx_tenant_order (tenant_id, order_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wholesale_price_tiers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  customer_segment ENUM('retail', 'wholesale', 'export', 'restaurant', 'cooperative') NOT NULL,
  min_quantity_kg DECIMAL(12,3) DEFAULT 0,
  unit_price DECIMAL(14,2) NOT NULL,
  currency CHAR(3) DEFAULT 'KES',
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tier (tenant_id, product_id, customer_segment, min_quantity_kg),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS unit_conversions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  from_unit VARCHAR(20) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  factor DECIMAL(18,8) NOT NULL,
  species_category VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_conv (tenant_id, from_unit, to_unit, species_category),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO unit_conversions (id, tenant_id, from_unit, to_unit, factor) VALUES
('uc-kg-lb-default', 'tenant-default-0001', 'kg', 'lb', 2.20462),
('uc-lb-kg-default', 'tenant-default-0001', 'lb', 'kg', 0.453592),
('uc-kg-g-default', 'tenant-default-0001', 'kg', 'g', 1000),
('uc-ton-kg-default', 'tenant-default-0001', 'ton', 'kg', 1000);

CREATE TABLE IF NOT EXISTS catch_quality_inspections (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  catch_id VARCHAR(36) NULL,
  trip_id VARCHAR(36) NULL,
  landing_site_id VARCHAR(36) NULL,
  inspector_id VARCHAR(36) NULL,
  grade_assigned ENUM('A', 'B', 'C', 'reject') NOT NULL,
  freshness_score TINYINT NULL,
  parasite_check TINYINT(1) DEFAULT 0,
  temperature_c DECIMAL(5,2) NULL,
  notes TEXT NULL,
  photo_url VARCHAR(500) NULL,
  inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_trip (tenant_id, trip_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cooperative_revenue_shares (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  period_month CHAR(7) NOT NULL,
  member_user_id VARCHAR(36) NOT NULL,
  catch_kg DECIMAL(12,3) DEFAULT 0,
  revenue_share DECIMAL(14,2) DEFAULT 0,
  share_pct DECIMAL(5,2) DEFAULT 0,
  status ENUM('draft', 'approved', 'paid') DEFAULT 'draft',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_member_period (tenant_id, period_month, member_user_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  action_type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
  client_timestamp VARCHAR(30) NULL,
  error_message VARCHAR(500) NULL,
  synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pending (tenant_id, user_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS traceability_certificates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  lot_code VARCHAR(80) NOT NULL,
  verification_hash VARCHAR(64) NOT NULL,
  chain_summary JSON NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_lot (tenant_id, lot_code),
  UNIQUE KEY uk_hash (verification_hash),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL,
  ADD INDEX IF NOT EXISTS idx_audit_tenant (tenant_id);
