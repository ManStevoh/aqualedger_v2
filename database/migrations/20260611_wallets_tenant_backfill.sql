-- Backfill wallets.tenant_id from tenant_members (idempotent)
SET @default_tenant = 'tenant-default-0001';

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NULL AFTER id;

UPDATE wallets w
SET tenant_id = (
  SELECT tm.tenant_id FROM tenant_members tm
  WHERE tm.user_id = w.user_id AND tm.status = 'active'
  ORDER BY FIELD(tm.role, 'tenant_owner') DESC, tm.joined_at ASC
  LIMIT 1
)
WHERE w.tenant_id IS NULL;

UPDATE wallets SET tenant_id = @default_tenant WHERE tenant_id IS NULL OR tenant_id = '';

ALTER TABLE wallets MODIFY tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE wallets ADD INDEX IF NOT EXISTS idx_wallets_tenant (tenant_id);
