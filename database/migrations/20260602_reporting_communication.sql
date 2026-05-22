-- Reporting & communication: templates, tenant settings, outbound message log
USE aqualedger32;

CREATE TABLE IF NOT EXISTS tenant_communication_settings (
  tenant_id VARCHAR(36) PRIMARY KEY,
  brand_name VARCHAR(150) NULL,
  reply_to_email VARCHAR(255) NULL,
  default_report_emails JSON NULL,
  default_report_phones JSON NULL,
  default_bcc_emails JSON NULL,
  email_footer_html TEXT NULL,
  logo_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communication_templates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  template_key VARCHAR(80) NOT NULL,
  channel ENUM('email', 'sms', 'whatsapp') NOT NULL DEFAULT 'email',
  name VARCHAR(150) NOT NULL,
  subject VARCHAR(255) NULL,
  body_html MEDIUMTEXT NULL,
  body_text TEXT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_key_channel (tenant_id, template_key, channel),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communication_messages (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  channel ENUM('email', 'sms', 'whatsapp', 'webhook', 'push', 'in_app') NOT NULL,
  message_type VARCHAR(80) NOT NULL DEFAULT 'transactional',
  recipient VARCHAR(500) NOT NULL,
  subject VARCHAR(255) NULL,
  body_preview VARCHAR(500) NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  external_ref VARCHAR(255) NULL,
  error_message VARCHAR(500) NULL,
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(36) NULL,
  metadata JSON NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_created (tenant_id, created_at),
  INDEX idx_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE scheduled_reports
  ADD COLUMN IF NOT EXISTS subject_override VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS bcc_recipients JSON NULL;
