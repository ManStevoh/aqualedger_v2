-- AquaERP Phase 2: Tenant Subscription & Trial Expiry Fields

ALTER TABLE tenants
  ADD COLUMN trial_starts_at TIMESTAMP NULL AFTER status,
  ADD COLUMN trial_ends_at TIMESTAMP NULL AFTER trial_starts_at,
  ADD COLUMN current_period_start TIMESTAMP NULL AFTER trial_ends_at,
  ADD COLUMN current_period_end TIMESTAMP NULL AFTER current_period_start,
  ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE AFTER current_period_end,
  ADD COLUMN grace_period_ends_at TIMESTAMP NULL AFTER cancel_at_period_end;
