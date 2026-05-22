-- Per-tenant portal role permission maps (vendor, customer) — editable by tenant admins

CREATE TABLE IF NOT EXISTS tenant_role_permissions (
  tenant_id VARCHAR(36) NOT NULL,
  role VARCHAR(32) NOT NULL COMMENT 'vendor | customer',
  permissions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, role),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
