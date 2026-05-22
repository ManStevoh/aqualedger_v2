-- Custom domain DNS verification, per-tenant feature flags, GDPR data export jobs

ALTER TABLE tenant_custom_domains
  ADD COLUMN IF NOT EXISTS verify_token VARCHAR(64) NULL;

CREATE TABLE IF NOT EXISTS tenant_feature_flags (
  tenant_id VARCHAR(36) NOT NULL,
  flag_key VARCHAR(64) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, flag_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_data_exports (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  requested_by VARCHAR(36) NULL,
  export_type VARCHAR(32) NOT NULL DEFAULT 'gdpr',
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  file_path VARCHAR(500) NULL,
  error_message TEXT NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
