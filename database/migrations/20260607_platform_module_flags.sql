-- Super-admin toggles for ERP module visibility and API access (all tenants)

CREATE TABLE IF NOT EXISTS platform_module_flags (
  module_id VARCHAR(32) PRIMARY KEY,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO platform_module_flags (module_id, enabled) VALUES
  ('platform', 1),
  ('tenant', 1),
  ('fishing', 1),
  ('commerce', 1),
  ('inventory', 1),
  ('coldchain', 1),
  ('procurement', 1),
  ('crm', 1),
  ('accounting', 1),
  ('logistics', 1),
  ('hr', 1),
  ('analytics', 1),
  ('notifications', 1),
  ('integrations', 1),
  ('ai', 1);
