-- Link catalog products to marketplace vendors for multi-vendor checkout

ALTER TABLE product_catalog
  ADD COLUMN IF NOT EXISTS vendor_id VARCHAR(36) NULL AFTER tenant_id;

CREATE INDEX IF NOT EXISTS idx_product_catalog_vendor ON product_catalog (vendor_id);
