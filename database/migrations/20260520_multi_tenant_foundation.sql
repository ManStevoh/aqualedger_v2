-- AquaERP Phase 1: Multi-tenant foundation
-- Run after schema.sql on aqualedger32
USE aqualedger32;

-- ===========================================
-- Tenants (companies / organizations)
-- ===========================================

CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(255) NULL,
  country_code CHAR(2) DEFAULT 'KE',
  default_currency CHAR(3) DEFAULT 'KES',
  timezone VARCHAR(64) DEFAULT 'Africa/Nairobi',
  logo_url VARCHAR(500) NULL,
  primary_color VARCHAR(20) DEFAULT '#0ea5e9',
  plan ENUM('trial', 'starter', 'professional', 'enterprise') DEFAULT 'trial',
  status ENUM('active', 'suspended', 'pending', 'cancelled') DEFAULT 'active',
  settings JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Branches (landing sites, plants, stores)
-- ===========================================

CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  type ENUM('headquarters', 'landing_site', 'cold_storage', 'market', 'office', 'warehouse') DEFAULT 'office',
  county VARCHAR(100) NULL,
  address TEXT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY uk_tenant_branch_code (tenant_id, code),
  INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Tenant membership (user ↔ tenant ↔ role)
-- ===========================================

CREATE TABLE IF NOT EXISTS tenant_members (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NULL,
  role ENUM(
    'tenant_owner',
    'branch_manager',
    'accountant',
    'procurement_officer',
    'warehouse_staff',
    'fisherman',
    'vendor',
    'delivery_staff',
    'customer',
    'hr_officer',
    'bmu_official'
  ) NOT NULL DEFAULT 'fisherman',
  status ENUM('active', 'invited', 'suspended') DEFAULT 'active',
  invited_at TIMESTAMP NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  UNIQUE KEY uk_tenant_user (tenant_id, user_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Domain events (workflow / async foundation)
-- ===========================================

CREATE TABLE IF NOT EXISTS domain_events (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(36) NOT NULL,
  payload JSON NULL,
  status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_event_type (event_type),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Default tenant for existing single-tenant data
-- ===========================================

INSERT IGNORE INTO tenants (
  id, slug, name, legal_name, plan, status
) VALUES (
  'tenant-default-0001',
  'default',
  'Default Organization',
  'AquaERP Default Tenant',
  'enterprise',
  'active'
);

-- Link all existing users to default tenant (map legacy roles)
INSERT IGNORE INTO tenant_members (id, tenant_id, user_id, role, status)
SELECT
  CONCAT('tm-', u.id),
  'tenant-default-0001',
  u.id,
  CASE u.role
    WHEN 'super_admin' THEN 'tenant_owner'
    WHEN 'investor' THEN 'tenant_owner'
    WHEN 'boat_owner' THEN 'branch_manager'
    WHEN 'bmu_official' THEN 'bmu_official'
    WHEN 'fish_buyer' THEN 'customer'
    ELSE 'fisherman'
  END,
  'active'
FROM users u;

INSERT IGNORE INTO branches (id, tenant_id, code, name, type, status)
VALUES (
  'branch-hq-0001',
  'tenant-default-0001',
  'HQ',
  'Headquarters',
  'headquarters',
  'active'
);
