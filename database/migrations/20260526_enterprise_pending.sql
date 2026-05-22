-- AquaERP: Remaining enterprise tables (cart, payouts, export, FX, HR, workflows)
USE aqualedger32;

-- Commerce cart & wishlist
CREATE TABLE IF NOT EXISTS commerce_carts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('active', 'converted', 'abandoned') DEFAULT 'active',
  currency CHAR(3) DEFAULT 'KES',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_cart (tenant_id, user_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commerce_cart_items (
  id VARCHAR(36) PRIMARY KEY,
  cart_id VARCHAR(36) NOT NULL,
  listing_id VARCHAR(36) NULL,
  product_id VARCHAR(36) NULL,
  quantity_kg DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  line_total DECIMAL(14,2) NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES commerce_carts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlists (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  listing_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wish (tenant_id, user_id, listing_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vendor commissions & payouts
CREATE TABLE IF NOT EXISTS vendor_commissions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  vendor_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  order_amount DECIMAL(14,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(14,2) NOT NULL,
  status ENUM('pending', 'payable', 'paid', 'void') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vendor (tenant_id, vendor_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendor_payouts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  vendor_id VARCHAR(36) NOT NULL,
  payout_number VARCHAR(50) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  currency CHAR(3) DEFAULT 'KES',
  status ENUM('draft', 'processing', 'paid', 'failed') DEFAULT 'draft',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_payout (tenant_id, payout_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Export documentation (EU / international seafood)
CREATE TABLE IF NOT EXISTS export_documents (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NULL,
  lot_code VARCHAR(80) NULL,
  doc_type ENUM('certificate_of_origin', 'health_certificate', 'catch_certificate', 'customs_declaration', 'invoice') NOT NULL,
  doc_number VARCHAR(80) NOT NULL,
  issuing_authority VARCHAR(200) NULL,
  destination_country CHAR(2) NULL,
  hs_code VARCHAR(20) NULL,
  status ENUM('draft', 'issued', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
  payload JSON NULL,
  issued_at DATE NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_doc (tenant_id, doc_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Multi-currency
CREATE TABLE IF NOT EXISTS currency_rates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NULL,
  base_currency CHAR(3) DEFAULT 'KES',
  quote_currency CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  effective_date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rate (tenant_id, base_currency, quote_currency, effective_date),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO currency_rates (id, tenant_id, base_currency, quote_currency, rate, effective_date) VALUES
('fx-usd-01', 'tenant-default-0001', 'KES', 'USD', 0.0077, CURDATE()),
('fx-eur-01', 'tenant-default-0001', 'KES', 'EUR', 0.0071, CURDATE()),
('fx-tzs-01', 'tenant-default-0001', 'KES', 'TZS', 19.5000, CURDATE());

-- Auction live bidding
CREATE TABLE IF NOT EXISTS auction_bids (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  auction_id VARCHAR(36) NOT NULL,
  bidder_name VARCHAR(200) NOT NULL,
  bidder_phone VARCHAR(30) NULL,
  bid_amount DECIMAL(14,2) NOT NULL,
  is_winning TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auction (auction_id, created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HR performance & training
CREATE TABLE IF NOT EXISTS hr_performance_reviews (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  review_period VARCHAR(50) NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  goals TEXT NULL,
  feedback TEXT NULL,
  status ENUM('draft', 'submitted', 'acknowledged') DEFAULT 'draft',
  reviewed_at DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_training_records (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  training_type ENUM('safety', 'haccp', 'equipment', 'compliance', 'other') DEFAULT 'safety',
  completed_at DATE NULL,
  expiry_at DATE NULL,
  certificate_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard widget layout per user
CREATE TABLE IF NOT EXISTS user_dashboard_layout (
  user_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  widgets JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tenant_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification outbox (email/SMS/WhatsApp queue)
CREATE TABLE IF NOT EXISTS notification_outbox (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  channel ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NULL,
  body TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  last_error VARCHAR(500) NULL,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pending (status, scheduled_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workflow automation rules
CREATE TABLE IF NOT EXISTS workflow_rules (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  conditions JSON NULL,
  actions JSON NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login alerts
CREATE TABLE IF NOT EXISTS login_alerts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  location_hint VARCHAR(100) NULL,
  is_new_device TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IoT webhook ingest log
CREATE TABLE IF NOT EXISTS iot_sensor_events (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  facility_id VARCHAR(36) NULL,
  zone_id VARCHAR(36) NULL,
  sensor_id VARCHAR(100) NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSON NOT NULL,
  processed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_time (tenant_id, created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI chat sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) DEFAULT 'AquaERP Assistant',
  messages JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO workflow_rules (id, tenant_id, name, trigger_event, actions, active) VALUES
('wf-cold-01', 'tenant-default-0001', 'Cold chain critical alert', 'coldchain.temperature.critical', '[{"type":"notification","channel":"in_app"},{"type":"notification","channel":"sms"}]', 1),
('wf-order-01', 'tenant-default-0001', 'Order confirmed notify buyer', 'commerce.order.confirmed', '[{"type":"notification","channel":"email"}]', 1);
