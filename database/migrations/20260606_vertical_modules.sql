-- Catch quotas, forward sales contracts, insurance & claims

CREATE TABLE IF NOT EXISTS catch_quotas (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  species_id VARCHAR(36) NULL,
  fishing_zone VARCHAR(120) NULL,
  period_type ENUM('monthly', 'annual') NOT NULL DEFAULT 'annual',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  quota_kg DECIMAL(14,2) NOT NULL,
  issuing_authority VARCHAR(120) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cq_tenant_period (tenant_id, period_start, period_end),
  INDEX idx_cq_species (species_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales_contracts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  contract_number VARCHAR(40) NOT NULL,
  buyer_name VARCHAR(200) NOT NULL,
  buyer_email VARCHAR(255) NULL,
  buyer_phone VARCHAR(30) NULL,
  customer_id VARCHAR(36) NULL,
  species_id VARCHAR(36) NULL,
  price_per_kg DECIMAL(12,2) NOT NULL,
  contracted_kg DECIMAL(14,2) NOT NULL,
  delivered_kg DECIMAL(14,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  status ENUM('draft', 'active', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_terms VARCHAR(120) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contract_number (tenant_id, contract_number),
  INDEX idx_sc_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales_contract_fulfillments (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  contract_id VARCHAR(36) NOT NULL,
  quantity_kg DECIMAL(14,2) NOT NULL,
  fulfilled_at DATETIME NOT NULL,
  trip_id VARCHAR(36) NULL,
  order_id VARCHAR(36) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scf_contract (contract_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES sales_contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurance_policies (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  boat_id VARCHAR(36) NULL,
  policy_number VARCHAR(80) NOT NULL,
  insurer_name VARCHAR(200) NOT NULL,
  policy_type ENUM('hull', 'liability', 'cargo', 'crew', 'comprehensive') NOT NULL DEFAULT 'hull',
  premium_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  coverage_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_policy_number (tenant_id, policy_number),
  INDEX idx_ip_tenant_boat (tenant_id, boat_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurance_claims (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  policy_id VARCHAR(36) NOT NULL,
  boat_id VARCHAR(36) NULL,
  claim_number VARCHAR(40) NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  claimed_amount DECIMAL(14,2) NOT NULL,
  approved_amount DECIMAL(14,2) NULL,
  status ENUM('submitted', 'reviewing', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'submitted',
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_claim_number (tenant_id, claim_number),
  INDEX idx_ic_policy (policy_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (policy_id) REFERENCES insurance_policies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
