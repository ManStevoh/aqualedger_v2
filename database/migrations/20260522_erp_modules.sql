-- AquaERP Phase 1b: Independent module tables (tenant-scoped)
USE aqualedger32;

-- Procurement
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(150) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  country_code CHAR(2) DEFAULT 'KE',
  rating DECIMAL(3,2) DEFAULT 0,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  notes TEXT NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_supplier_code (tenant_id, code),
  INDEX idx_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  supplier_id VARCHAR(36) NOT NULL,
  po_number VARCHAR(50) NOT NULL,
  status ENUM('draft', 'sent', 'partial', 'received', 'cancelled') DEFAULT 'draft',
  currency CHAR(3) DEFAULT 'KES',
  subtotal DECIMAL(14,2) DEFAULT 0,
  tax_amount DECIMAL(14,2) DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  expected_date DATE NULL,
  notes TEXT NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_po (tenant_id, po_number),
  INDEX idx_supplier (supplier_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id VARCHAR(36) PRIMARY KEY,
  purchase_order_id VARCHAR(36) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  unit_price DECIMAL(14,2) NOT NULL,
  line_total DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory batches
CREATE TABLE IF NOT EXISTS inventory_batches (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  species_id VARCHAR(36) NULL,
  batch_code VARCHAR(80) NOT NULL,
  quantity_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
  reserved_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
  storage_type ENUM('fresh', 'frozen', 'dried') DEFAULT 'fresh',
  expiry_date DATE NULL,
  source_type ENUM('catch', 'purchase', 'transfer', 'adjustment') DEFAULT 'catch',
  source_id VARCHAR(36) NULL,
  status ENUM('available', 'reserved', 'depleted', 'spoiled') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_batch (tenant_id, batch_code),
  INDEX idx_tenant_sku (tenant_id, sku),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CRM
CREATE TABLE IF NOT EXISTS crm_customers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  segment ENUM('retail', 'wholesale', 'export', 'restaurant', 'cooperative') DEFAULT 'retail',
  lifetime_value DECIMAL(14,2) DEFAULT 0,
  status ENUM('active', 'inactive', 'prospect') DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_segment (tenant_id, segment),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_leads (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  source VARCHAR(80) NULL,
  stage ENUM('new', 'contacted', 'qualified', 'won', 'lost') DEFAULT 'new',
  estimated_value DECIMAL(14,2) DEFAULT 0,
  assigned_to VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_stage (tenant_id, stage),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Accounting (double-entry foundation)
CREATE TABLE IF NOT EXISTS gl_accounts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
  currency CHAR(3) DEFAULT 'KES',
  is_system TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_code (tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_entries (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  entry_number VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(36) NULL,
  status ENUM('draft', 'posted', 'void') DEFAULT 'posted',
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_entry (tenant_id, entry_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_lines (
  id VARCHAR(36) PRIMARY KEY,
  journal_entry_id VARCHAR(36) NOT NULL,
  account_id VARCHAR(36) NOT NULL,
  debit DECIMAL(14,2) DEFAULT 0,
  credit DECIMAL(14,2) DEFAULT 0,
  memo VARCHAR(255) NULL,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES gl_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logistics
CREATE TABLE IF NOT EXISTS deliveries (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NULL,
  tracking_code VARCHAR(50) NOT NULL,
  status ENUM('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',
  driver_user_id VARCHAR(36) NULL,
  pickup_address TEXT NULL,
  delivery_address TEXT NOT NULL,
  scheduled_at DATETIME NULL,
  delivered_at DATETIME NULL,
  proof_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_tracking (tenant_id, tracking_code),
  INDEX idx_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HR
CREATE TABLE IF NOT EXISTS hr_employees (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NULL,
  employee_number VARCHAR(50) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  department VARCHAR(100) NULL,
  job_title VARCHAR(100) NULL,
  hire_date DATE NULL,
  salary DECIMAL(14,2) NULL,
  status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_emp_no (tenant_id, employee_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_payroll_runs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status ENUM('draft', 'approved', 'paid') DEFAULT 'draft',
  total_gross DECIMAL(14,2) DEFAULT 0,
  total_net DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Integrations registry
CREATE TABLE IF NOT EXISTS integration_connections (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  provider ENUM('mpesa', 'stripe', 'sms', 'whatsapp', 'iot_coldchain', 'custom') NOT NULL,
  name VARCHAR(150) NOT NULL,
  config JSON NULL,
  status ENUM('active', 'inactive', 'error') DEFAULT 'inactive',
  last_sync_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_provider (tenant_id, provider),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cold chain alerts
CREATE TABLE IF NOT EXISTS coldchain_alerts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  facility_id VARCHAR(36) NULL,
  alert_type ENUM('temperature', 'humidity', 'door', 'power') DEFAULT 'temperature',
  severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
  message VARCHAR(500) NOT NULL,
  reading_value DECIMAL(8,2) NULL,
  resolved TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_open (tenant_id, resolved),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default GL accounts for default tenant
INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system) VALUES
('gl-cash-01', 'tenant-default-0001', '1000', 'Cash', 'asset', 1),
('gl-ar-01', 'tenant-default-0001', '1100', 'Accounts Receivable', 'asset', 1),
('gl-inv-01', 'tenant-default-0001', '1200', 'Inventory', 'asset', 1),
('gl-ap-01', 'tenant-default-0001', '2000', 'Accounts Payable', 'liability', 1),
('gl-rev-01', 'tenant-default-0001', '4000', 'Sales Revenue', 'revenue', 1),
('gl-exp-01', 'tenant-default-0001', '5000', 'Operating Expenses', 'expense', 1);
