-- Accounting & HR enterprise: payroll lines, fiscal periods, benefits, recruitment, org, tax, assets
USE aqualedger32;

CREATE TABLE IF NOT EXISTS hr_payroll_lines (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  payroll_run_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  gross_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax_deduction DECIMAL(14,2) NOT NULL DEFAULT 0,
  other_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_run (payroll_run_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE hr_payroll_runs
  ADD COLUMN IF NOT EXISTS gl_journal_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS fiscal_periods (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status ENUM('open', 'closed') DEFAULT 'open',
  closed_at TIMESTAMP NULL,
  closed_by VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_period (tenant_id, period_start, period_end),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_leave_balances (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  leave_type ENUM('annual', 'sick', 'maternity', 'unpaid', 'other') NOT NULL,
  balance_days DECIMAL(6,2) NOT NULL DEFAULT 0,
  accrued_days DECIMAL(6,2) NOT NULL DEFAULT 0,
  year INT NOT NULL,
  UNIQUE KEY uk_emp_type_year (tenant_id, employee_id, leave_type, year),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_benefit_plans (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  plan_type ENUM('health', 'pension', 'life', 'housing', 'other') DEFAULT 'health',
  employer_contribution_pct DECIMAL(6,2) DEFAULT 0,
  employee_contribution_pct DECIMAL(6,2) DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_employee_benefits (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  enrolled_at DATE NOT NULL,
  status ENUM('active', 'ended') DEFAULT 'active',
  UNIQUE KEY uk_emp_plan (tenant_id, employee_id, plan_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_org_units (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  parent_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE hr_employees
  ADD COLUMN IF NOT EXISTS manager_employee_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS org_unit_id VARCHAR(36) NULL;

CREATE TABLE IF NOT EXISTS hr_job_postings (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100) NULL,
  description TEXT NULL,
  status ENUM('open', 'closed', 'filled') DEFAULT 'open',
  posted_at DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_applicants (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  job_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  stage ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected') DEFAULT 'applied',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_job (tenant_id, job_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tax_returns (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  return_type ENUM('vat', 'paye', 'withholding', 'corporate') NOT NULL,
  period_label VARCHAR(50) NOT NULL,
  taxable_amount DECIMAL(14,2) DEFAULT 0,
  tax_amount DECIMAL(14,2) DEFAULT 0,
  status ENUM('draft', 'filed', 'paid') DEFAULT 'draft',
  filed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fixed_assets (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  asset_code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  category ENUM('vessel', 'vehicle', 'equipment', 'building', 'other') DEFAULT 'equipment',
  purchase_date DATE NOT NULL,
  purchase_cost DECIMAL(14,2) NOT NULL,
  salvage_value DECIMAL(14,2) DEFAULT 0,
  useful_life_months INT NOT NULL DEFAULT 60,
  accumulated_depreciation DECIMAL(14,2) DEFAULT 0,
  status ENUM('active', 'disposed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_asset_code (tenant_id, asset_code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE ap_invoices ADD COLUMN IF NOT EXISTS gl_journal_id VARCHAR(36) NULL;
ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS gl_journal_id VARCHAR(36) NULL;
