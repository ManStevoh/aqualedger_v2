-- Paystack provider, payment reconcile audit, webhook delivery log

ALTER TABLE payment_intents
  MODIFY COLUMN provider ENUM('mpesa', 'stripe', 'paystack', 'cash', 'bank') NOT NULL;

CREATE TABLE IF NOT EXISTS platform_payment_reconcile_runs (
  id VARCHAR(36) PRIMARY KEY,
  trigger_source VARCHAR(32) NOT NULL DEFAULT 'manual',
  reconciled INT NOT NULL DEFAULT 0,
  failed INT NOT NULL DEFAULT 0,
  matched INT NOT NULL DEFAULT 0,
  pending_stale INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_webhook_events (
  id VARCHAR(36) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  external_id VARCHAR(120) NULL,
  status ENUM('received', 'processed', 'failed') NOT NULL DEFAULT 'received',
  payload JSON NULL,
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_provider_time (provider, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
