-- AquaERP Phase 2: Production enhancements (international standards)
USE aqualedger32;

-- Auth: API tokens
CREATE TABLE IF NOT EXISTS api_tokens (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  scopes JSON NULL,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  revoked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Commerce: catalog, coupons, vendors
CREATE TABLE IF NOT EXISTS product_catalog (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  name VARCHAR(200) NOT NULL,
  species_id VARCHAR(36) NULL,
  category VARCHAR(80) NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  base_price DECIMAL(14,2) DEFAULT 0,
  tax_code VARCHAR(20) NULL,
  hs_code VARCHAR(20) NULL COMMENT 'Harmonized System for exports',
  status ENUM('active', 'draft', 'archived') DEFAULT 'active',
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_sku (tenant_id, sku),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(14,2) NOT NULL,
  min_order_amount DECIMAL(14,2) DEFAULT 0,
  max_uses INT NULL,
  uses_count INT DEFAULT 0,
  valid_from DATE NULL,
  valid_to DATE NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_coupon (tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marketplace_vendors (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  shop_name VARCHAR(200) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  status ENUM('active', 'pending', 'suspended') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_user (tenant_id, user_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory movements (immutable trail)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  batch_id VARCHAR(36) NULL,
  movement_type ENUM('in', 'out', 'transfer', 'adjustment', 'spoilage') NOT NULL,
  quantity_kg DECIMAL(12,3) NOT NULL,
  from_location VARCHAR(100) NULL,
  to_location VARCHAR(100) NULL,
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(36) NULL,
  lot_code VARCHAR(80) NULL,
  notes TEXT NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_batch (tenant_id, batch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Traceability (EU fisheries / GS1 lot)
CREATE TABLE IF NOT EXISTS traceability_lots (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  lot_code VARCHAR(80) NOT NULL,
  catch_id VARCHAR(36) NULL,
  species_name VARCHAR(150) NULL,
  vessel_name VARCHAR(150) NULL,
  landing_site VARCHAR(150) NULL,
  catch_date DATE NULL,
  grading ENUM('A', 'B', 'C', 'reject') NULL,
  msc_certified TINYINT(1) DEFAULT 0,
  fao_area VARCHAR(20) NULL,
  storage_temp_c DECIMAL(5,2) NULL,
  status ENUM('active', 'recalled', 'consumed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_lot (tenant_id, lot_code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cold chain
CREATE TABLE IF NOT EXISTS storage_zones (
  id VARCHAR(36) PRIMARY KEY,
  facility_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  target_temp_c DECIMAL(5,2) NOT NULL,
  min_temp_c DECIMAL(5,2) NULL,
  max_temp_c DECIMAL(5,2) NULL,
  capacity_kg DECIMAL(12,2) NULL,
  status ENUM('active', 'maintenance', 'offline') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS temperature_readings (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  zone_id VARCHAR(36) NULL,
  facility_id VARCHAR(36) NULL,
  reading_c DECIMAL(5,2) NOT NULL,
  humidity_pct DECIMAL(5,2) NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source ENUM('manual', 'iot', 'import') DEFAULT 'manual',
  INDEX idx_zone_time (zone_id, recorded_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS haccp_checklists (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  facility_id VARCHAR(36) NULL,
  checklist_date DATE NOT NULL,
  inspector_name VARCHAR(150) NULL,
  items JSON NOT NULL,
  overall_pass TINYINT(1) DEFAULT 0,
  corrective_actions TEXT NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Procurement: PR, RFQ, GRN
CREATE TABLE IF NOT EXISTS purchase_requests (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  pr_number VARCHAR(50) NOT NULL,
  requested_by VARCHAR(36) NULL,
  department VARCHAR(100) NULL,
  status ENUM('draft', 'submitted', 'approved', 'rejected', 'ordered') DEFAULT 'draft',
  needed_by DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_pr (tenant_id, pr_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rfqs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  rfq_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('open', 'closed', 'awarded', 'cancelled') DEFAULT 'open',
  closing_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_rfq (tenant_id, rfq_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS goods_receipts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  purchase_order_id VARCHAR(36) NOT NULL,
  grn_number VARCHAR(50) NOT NULL,
  received_date DATE NOT NULL,
  received_by VARCHAR(36) NULL,
  status ENUM('draft', 'posted', 'void') DEFAULT 'posted',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_grn (tenant_id, grn_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CRM activities
CREATE TABLE IF NOT EXISTS crm_activities (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NULL,
  lead_id VARCHAR(36) NULL,
  activity_type ENUM('call', 'email', 'meeting', 'note', 'whatsapp') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NULL,
  scheduled_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Accounting: tax, AP, AR
CREATE TABLE IF NOT EXISTS tax_codes (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  rate_pct DECIMAL(6,3) NOT NULL,
  type ENUM('vat', 'withholding', 'excise', 'other') DEFAULT 'vat',
  country_code CHAR(2) DEFAULT 'KE',
  active TINYINT(1) DEFAULT 1,
  UNIQUE KEY uk_tenant_tax (tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ap_invoices (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  supplier_id VARCHAR(36) NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NULL,
  currency CHAR(3) DEFAULT 'KES',
  subtotal DECIMAL(14,2) NOT NULL,
  tax_amount DECIMAL(14,2) DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL,
  status ENUM('draft', 'approved', 'paid', 'void') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_ap_inv (tenant_id, invoice_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ar_invoices (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NULL,
  order_id VARCHAR(36) NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NULL,
  currency CHAR(3) DEFAULT 'KES',
  subtotal DECIMAL(14,2) NOT NULL,
  tax_amount DECIMAL(14,2) DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL,
  status ENUM('draft', 'sent', 'paid', 'overdue', 'void') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_ar_inv (tenant_id, invoice_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logistics history
CREATE TABLE IF NOT EXISTS delivery_events (
  id VARCHAR(36) PRIMARY KEY,
  delivery_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_delivery (delivery_id),
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HR attendance & leave
CREATE TABLE IF NOT EXISTS hr_attendance (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  work_date DATE NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  hours_worked DECIMAL(5,2) NULL,
  status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
  UNIQUE KEY uk_emp_date (employee_id, work_date),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  leave_type ENUM('annual', 'sick', 'maternity', 'unpaid', 'other') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(5,1) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  channel ENUM('email', 'sms', 'push', 'whatsapp', 'in_app') NOT NULL,
  subject VARCHAR(255) NULL,
  body_template TEXT NOT NULL,
  active TINYINT(1) DEFAULT 1,
  UNIQUE KEY uk_tenant_tpl (tenant_id, code, channel),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Webhooks
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events JSON NOT NULL,
  secret_hash VARCHAR(64) NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI forecasts
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  species_or_sku VARCHAR(150) NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_kg DECIMAL(12,3) NOT NULL,
  confidence_pct DECIMAL(5,2) DEFAULT 70,
  model_version VARCHAR(20) DEFAULT 'moving_avg_v1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_date (tenant_id, forecast_date),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fishing: auctions
CREATE TABLE IF NOT EXISTS fish_auctions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  landing_site_id VARCHAR(36) NULL,
  lot_code VARCHAR(80) NULL,
  species_name VARCHAR(150) NOT NULL,
  quantity_kg DECIMAL(12,3) NOT NULL,
  starting_price DECIMAL(14,2) NOT NULL,
  winning_price DECIMAL(14,2) NULL,
  buyer_name VARCHAR(200) NULL,
  status ENUM('scheduled', 'live', 'closed', 'cancelled') DEFAULT 'scheduled',
  auction_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Kenya VAT
INSERT IGNORE INTO tax_codes (id, tenant_id, code, name, rate_pct, type, country_code) VALUES
('tax-vat-16', 'tenant-default-0001', 'VAT16', 'Kenya VAT 16%', 16.000, 'vat', 'KE');

-- Default notification templates
INSERT IGNORE INTO notification_templates (id, tenant_id, code, channel, subject, body_template) VALUES
('tpl-order-01', 'tenant-default-0001', 'order_confirmed', 'in_app', 'Order confirmed', 'Your order {{order_id}} has been confirmed.'),
('tpl-cold-01', 'tenant-default-0001', 'temp_alert', 'in_app', 'Temperature alert', 'Zone {{zone}} exceeded threshold: {{temp}}°C');
