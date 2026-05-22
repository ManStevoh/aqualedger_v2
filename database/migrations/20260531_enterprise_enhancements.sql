-- Enterprise enhancements: CRM segments, 3-way match, SSO, connectors, scorecards
USE aqualedger32;

ALTER TABLE ap_invoices
  ADD COLUMN IF NOT EXISTS purchase_order_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS grn_id VARCHAR(36) NULL;

CREATE TABLE IF NOT EXISTS procurement_match_records (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  purchase_order_id VARCHAR(36) NOT NULL,
  grn_id VARCHAR(36) NULL,
  ap_invoice_id VARCHAR(36) NULL,
  po_amount DECIMAL(14,2) DEFAULT 0,
  received_amount DECIMAL(14,2) DEFAULT 0,
  invoiced_amount DECIMAL(14,2) DEFAULT 0,
  variance_amount DECIMAL(14,2) DEFAULT 0,
  status ENUM('pending', 'matched', 'variance', 'blocked') DEFAULT 'pending',
  notes TEXT NULL,
  matched_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_po (tenant_id, purchase_order_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_segment_rules (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  segment_key VARCHAR(50) NOT NULL,
  rule_type ENUM('rfm', 'order_value', 'species', 'manual') DEFAULT 'rfm',
  criteria JSON NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_segment (tenant_id, segment_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supplier_scorecards (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  supplier_id VARCHAR(36) NOT NULL,
  period_month CHAR(7) NOT NULL,
  on_time_pct DECIMAL(5,2) DEFAULT 0,
  quality_score DECIMAL(4,2) DEFAULT 0,
  price_score DECIMAL(4,2) DEFAULT 0,
  overall_score DECIMAL(4,2) DEFAULT 0,
  grn_count INT DEFAULT 0,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_supplier_period (tenant_id, supplier_id, period_month),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_sso_config (
  tenant_id VARCHAR(36) PRIMARY KEY,
  provider ENUM('saml', 'oidc', 'keycloak') DEFAULT 'saml',
  entity_id VARCHAR(255) NULL,
  sso_url VARCHAR(500) NULL,
  certificate_pem TEXT NULL,
  metadata_url VARCHAR(500) NULL,
  enabled TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integration_connectors (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  connector_type ENUM('erp', 'shipping', 'whatsapp', 'accounting') NOT NULL,
  provider VARCHAR(50) NOT NULL,
  config JSON NULL,
  status ENUM('active', 'inactive', 'error') DEFAULT 'inactive',
  last_sync_at TIMESTAMP NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_type (tenant_id, connector_type),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shelf_life_alert_log (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  batch_id VARCHAR(36) NULL,
  lot_code VARCHAR(80) NULL,
  days_to_expiry INT NULL,
  channel VARCHAR(20) DEFAULT 'email',
  recipient VARCHAR(255) NULL,
  alerted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_batch (tenant_id, batch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE crm_customers
  ADD COLUMN IF NOT EXISTS rfm_segment VARCHAR(50) NULL;

CREATE TABLE IF NOT EXISTS guest_order_lookup (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  lookup_token VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_token (lookup_token),
  INDEX idx_guest (tenant_id, guest_email),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
