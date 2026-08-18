-- Migration: Create tenant_payment_requests table for manual bank/M-Pesa approval flow
CREATE TABLE IF NOT EXISTS tenant_payment_requests (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  requested_plan VARCHAR(32) NOT NULL,
  billing_cycle VARCHAR(16) NOT NULL DEFAULT 'monthly',
  amount_ksh DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL DEFAULT 'manual_bank',
  reference_number VARCHAR(128) NOT NULL,
  notes TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  reviewed_by VARCHAR(64),
  reviewed_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_tpr_tenant (tenant_id),
  KEY idx_tpr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
