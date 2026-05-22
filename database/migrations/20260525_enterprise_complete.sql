-- AquaERP Enterprise: additional tables for full module coverage
USE aqualedger32;

-- Onboarding
CREATE TABLE IF NOT EXISTS tenant_onboarding (
  tenant_id VARCHAR(36) PRIMARY KEY,
  step INT DEFAULT 1,
  completed_steps JSON NULL,
  business_type ENUM('fisherman', 'cooperative', 'processor', 'market', 'exporter', 'restaurant', 'logistics') DEFAULT 'fisherman',
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Commerce extensions
CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  name VARCHAR(150) NOT NULL,
  grade ENUM('A', 'B', 'C') NULL,
  weight_kg DECIMAL(10,3) NULL,
  price DECIMAL(14,2) NOT NULL,
  stock_kg DECIMAL(12,3) DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_variant_sku (tenant_id, sku),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  listing_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_listing (listing_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  points INT DEFAULT 0,
  tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_customer (tenant_id, customer_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory extensions
CREATE TABLE IF NOT EXISTS stock_transfers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  transfer_number VARCHAR(50) NOT NULL,
  from_location VARCHAR(100) NOT NULL,
  to_location VARCHAR(100) NOT NULL,
  batch_id VARCHAR(36) NULL,
  quantity_kg DECIMAL(12,3) NOT NULL,
  status ENUM('draft', 'in_transit', 'received', 'cancelled') DEFAULT 'draft',
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_transfer (tenant_id, transfer_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fishing crew & fuel
CREATE TABLE IF NOT EXISTS boat_fuel_logs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  boat_id VARCHAR(36) NOT NULL,
  trip_id VARCHAR(36) NULL,
  liters DECIMAL(10,2) NOT NULL,
  cost DECIMAL(14,2) NOT NULL,
  logged_at DATETIME NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_boat (tenant_id, boat_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fishing_zones (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  fao_area VARCHAR(20) NULL,
  county VARCHAR(100) NULL,
  status ENUM('open', 'restricted', 'closed') DEFAULT 'open',
  UNIQUE KEY uk_zone (tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CRM campaigns
CREATE TABLE IF NOT EXISTS crm_campaigns (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  channel ENUM('email', 'sms', 'whatsapp', 'in_app') NOT NULL,
  status ENUM('draft', 'scheduled', 'sent', 'cancelled') DEFAULT 'draft',
  subject VARCHAR(255) NULL,
  body TEXT NULL,
  scheduled_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Accounting budgets & bank rec
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  fiscal_year YEAR NOT NULL,
  account_id VARCHAR(36) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  period ENUM('monthly', 'quarterly', 'annual') DEFAULT 'annual',
  UNIQUE KEY uk_budget (tenant_id, fiscal_year, account_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bank_reconciliation (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  statement_date DATE NOT NULL,
  opening_balance DECIMAL(14,2) NOT NULL,
  closing_balance DECIMAL(14,2) NOT NULL,
  status ENUM('draft', 'reconciled') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HR contracts & training
CREATE TABLE IF NOT EXISTS hr_contracts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  contract_type ENUM('permanent', 'contract', 'casual') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  salary DECIMAL(14,2) NULL,
  document_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  channel_email TINYINT(1) DEFAULT 1,
  channel_sms TINYINT(1) DEFAULT 0,
  channel_push TINYINT(1) DEFAULT 1,
  channel_whatsapp TINYINT(1) DEFAULT 0,
  digest ENUM('instant', 'daily', 'weekly') DEFAULT 'instant',
  UNIQUE KEY uk_user_tenant (user_id, tenant_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MFA (TOTP secret storage)
CREATE TABLE IF NOT EXISTS user_mfa (
  user_id VARCHAR(36) PRIMARY KEY,
  secret_encrypted VARCHAR(255) NOT NULL,
  enabled TINYINT(1) DEFAULT 0,
  backup_codes JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  report_type VARCHAR(80) NOT NULL,
  frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
  recipients JSON NOT NULL,
  last_run_at TIMESTAMP NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment intents (M-Pesa / Stripe stub)
CREATE TABLE IF NOT EXISTS payment_intents (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NULL,
  provider ENUM('mpesa', 'stripe', 'cash', 'bank') NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  currency CHAR(3) DEFAULT 'KES',
  status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled') DEFAULT 'pending',
  external_ref VARCHAR(100) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO fishing_zones (id, tenant_id, code, name, fao_area, county, status) VALUES
('zone-mombasa-01', 'tenant-default-0001', 'MBA-DEEP', 'Mombasa Deep Waters', '51', 'Mombasa', 'open'),
('zone-watamu-01', 'tenant-default-0001', 'WAT-REEF', 'Watamu Reef', '51', 'Kilifi', 'open'),
('zone-victoria-01', 'tenant-default-0001', 'LV-DUNGA', 'Lake Victoria Dunga', '34', 'Kisumu', 'open');
