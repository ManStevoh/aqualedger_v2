-- Per-organization ERP module toggles (on top of platform_module_flags defaults)

CREATE TABLE IF NOT EXISTS tenant_module_flags (
  tenant_id VARCHAR(36) NOT NULL,
  module_id VARCHAR(32) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) NULL,
  PRIMARY KEY (tenant_id, module_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
