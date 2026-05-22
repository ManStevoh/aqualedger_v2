-- Repair boats table for multi-tenant (run after schema.sql; safe to re-run)
-- Fixes: wrong index name vs 20260524, non-InnoDB engine, missing tenant_id

SET @db = DATABASE();

-- Ensure InnoDB (FKs on boat_crew, fishing_trips require it)
SET @boats_tbl = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = @db AND table_name = 'boats'
);
SET @sql = IF(@boats_tbl > 0, 'ALTER TABLE boats ENGINE=InnoDB', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tenant_id column
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'boats' AND column_name = 'tenant_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE boats ADD COLUMN tenant_id VARCHAR(36) NULL AFTER id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @default_tenant = 'tenant-default-0001';
UPDATE boats SET tenant_id = @default_tenant WHERE tenant_id IS NULL;

SET @col_nn = (
  SELECT IS_NULLABLE FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'boats' AND column_name = 'tenant_id'
  LIMIT 1
);
SET @sql = IF(@col_nn = 'YES', 'ALTER TABLE boats MODIFY tenant_id VARCHAR(36) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop legacy global unique on registration_number (index name may vary)
SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'boats' AND index_name = 'registration_number' AND non_unique = 0
);
SET @sql = IF(@idx > 0, 'ALTER TABLE boats DROP INDEX registration_number', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx2 = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'boats' AND index_name = 'idx_registration_number'
);
SET @sql = IF(@idx2 > 0, 'ALTER TABLE boats DROP INDEX idx_registration_number', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Per-tenant registration uniqueness
SET @uk = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'boats' AND index_name = 'uk_tenant_registration'
);
SET @sql = IF(@uk = 0, 'ALTER TABLE boats ADD UNIQUE KEY uk_tenant_registration (tenant_id, registration_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_t = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'boats' AND index_name = 'idx_boats_tenant'
);
SET @sql = IF(@idx_t = 0, 'ALTER TABLE boats ADD INDEX idx_boats_tenant (tenant_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
