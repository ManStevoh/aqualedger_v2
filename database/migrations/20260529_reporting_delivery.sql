-- Enterprise reporting: snapshots, delivery log, scheduled channels
USE aqualedger32;

CREATE TABLE IF NOT EXISTS report_snapshots (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  report_type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  format VARCHAR(20) NOT NULL DEFAULT 'json',
  period_start DATE NULL,
  period_end DATE NULL,
  payload JSON NOT NULL,
  file_csv MEDIUMTEXT NULL,
  file_html MEDIUMTEXT NULL,
  share_token VARCHAR(64) NULL,
  share_expires_at TIMESTAMP NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_share_token (share_token),
  INDEX idx_tenant_type (tenant_id, report_type),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_deliveries (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  snapshot_id VARCHAR(36) NULL,
  scheduled_report_id VARCHAR(36) NULL,
  channel ENUM('email', 'sms', 'whatsapp', 'webhook', 'in_app') NOT NULL,
  recipient VARCHAR(500) NOT NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  external_ref VARCHAR(255) NULL,
  error_message VARCHAR(500) NULL,
  metadata JSON NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (snapshot_id) REFERENCES report_snapshots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE scheduled_reports
  ADD COLUMN IF NOT EXISTS delivery_channels JSON NULL COMMENT '["email","sms","webhook"]',
  ADD COLUMN IF NOT EXISTS phone_recipients JSON NULL,
  ADD COLUMN IF NOT EXISTS export_format VARCHAR(20) DEFAULT 'csv',
  ADD COLUMN IF NOT EXISTS period_days INT DEFAULT 30;

CREATE TABLE IF NOT EXISTS webhook_delivery_log (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  webhook_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  response_status INT NULL,
  response_body VARCHAR(1000) NULL,
  success TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhook (webhook_id, created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
