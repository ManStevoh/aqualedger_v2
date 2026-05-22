-- Phase 1b: tenant_id on legacy operational tables
USE aqualedger32;

SET @default_tenant = 'tenant-default-0001';

-- Boats
ALTER TABLE boats ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE boats SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE boats MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE boats ADD INDEX IF NOT EXISTS idx_boats_tenant (tenant_id);
-- Per-tenant registration uniqueness (drop global unique — index name varies by MySQL version)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'boats' AND index_name = 'registration_number' AND non_unique = 0);
SET @sql = IF(@idx_exists > 0, 'ALTER TABLE boats DROP INDEX registration_number', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @idx2 = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'boats' AND index_name = 'idx_registration_number');
SET @sql = IF(@idx2 > 0, 'ALTER TABLE boats DROP INDEX idx_registration_number', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @uk = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'boats' AND index_name = 'uk_tenant_registration');
SET @sql = IF(@uk = 0, 'ALTER TABLE boats ADD UNIQUE KEY uk_tenant_registration (tenant_id, registration_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fishing trips
ALTER TABLE fishing_trips ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE fishing_trips t SET tenant_id = (SELECT b.tenant_id FROM boats b WHERE b.id = t.boat_id LIMIT 1) WHERE tenant_id IS NULL;
UPDATE fishing_trips SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE fishing_trips MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE fishing_trips ADD INDEX IF NOT EXISTS idx_trips_tenant (tenant_id);

-- Catches
ALTER TABLE catches ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE catches c SET tenant_id = (SELECT t.tenant_id FROM fishing_trips t WHERE t.id = c.trip_id LIMIT 1) WHERE tenant_id IS NULL;
UPDATE catches SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE catches MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE catches ADD INDEX IF NOT EXISTS idx_catches_tenant (tenant_id);

-- Marketplace
ALTER TABLE fish_listings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE fish_listings SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE fish_listings MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE fish_listings ADD INDEX IF NOT EXISTS idx_listings_tenant (tenant_id);

-- Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE orders SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE orders MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE orders ADD INDEX IF NOT EXISTS idx_orders_tenant (tenant_id);

-- Expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE expenses SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE expenses MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE expenses ADD INDEX IF NOT EXISTS idx_expenses_tenant (tenant_id);

-- Cold storage
ALTER TABLE storage_facilities ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE storage_facilities SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE storage_facilities MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE storage_facilities ADD INDEX IF NOT EXISTS idx_storage_fac_tenant (tenant_id);

ALTER TABLE storage_records ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE storage_records sr SET tenant_id = (SELECT sf.tenant_id FROM storage_facilities sf WHERE sf.id = sr.facility_id LIMIT 1) WHERE tenant_id IS NULL;
UPDATE storage_records SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE storage_records MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE storage_records ADD INDEX IF NOT EXISTS idx_storage_rec_tenant (tenant_id);

-- BMU & compliance
ALTER TABLE bmu ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE bmu SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE bmu MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE bmu ADD INDEX IF NOT EXISTS idx_bmu_tenant (tenant_id);

ALTER TABLE licenses ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE licenses SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE licenses MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE licenses ADD INDEX IF NOT EXISTS idx_licenses_tenant (tenant_id);

ALTER TABLE landing_sites ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE landing_sites SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE landing_sites MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE landing_sites ADD INDEX IF NOT EXISTS idx_landing_tenant (tenant_id);

ALTER TABLE boat_maintenance ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE boat_maintenance bm SET tenant_id = (SELECT b.tenant_id FROM boats b WHERE b.id = bm.boat_id LIMIT 1) WHERE tenant_id IS NULL;
UPDATE boat_maintenance SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE boat_maintenance MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE boat_maintenance ADD INDEX IF NOT EXISTS idx_maint_tenant (tenant_id);

-- Notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE notifications SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE notifications MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE notifications ADD INDEX IF NOT EXISTS idx_notif_tenant (tenant_id);

-- Wallets (via tenant membership)
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE wallets w SET tenant_id = (
  SELECT tm.tenant_id FROM tenant_members tm WHERE tm.user_id = w.user_id LIMIT 1
) WHERE tenant_id IS NULL;
UPDATE wallets SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
ALTER TABLE wallets MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE wallets ADD INDEX IF NOT EXISTS idx_wallets_tenant (tenant_id);

-- Fish species per-tenant catalog (nullable for shared seeds)
ALTER TABLE fish_species ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;
UPDATE fish_species SET tenant_id = @default_tenant WHERE tenant_id IS NULL;
