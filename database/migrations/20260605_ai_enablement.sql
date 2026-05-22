-- AI enablement: persisted insights, narratives, automation audit

CREATE TABLE IF NOT EXISTS ai_insights (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  insight_type ENUM(
    'business_brief',
    'coldchain_review',
    'inventory_review',
    'operations_review'
  ) NOT NULL,
  reference_key VARCHAR(120) NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  recommendations JSON NULL,
  metrics JSON NULL,
  model_version VARCHAR(50) DEFAULT 'rules_and_statistics_v1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_type_time (tenant_id, insight_type, created_at DESC),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_automation_runs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  status ENUM('success', 'partial', 'failed') DEFAULT 'success',
  forecasts_computed INT DEFAULT 0,
  brief_id VARCHAR(36) NULL,
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_time (tenant_id, created_at DESC),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
