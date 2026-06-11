-- Sync existing marketplace vendors to suppliers table
INSERT INTO suppliers (id, tenant_id, code, name, contact_name, email, phone, country_code, rating, status, notes, created_by)
SELECT 
  mv.id,
  mv.tenant_id,
  CONCAT('VND-', LEFT(mv.id, 8)),
  mv.shop_name,
  CONCAT(u.first_name, ' ', u.last_name),
  u.email,
  u.phone,
  'KE',
  5.00,
  CASE WHEN mv.status = 'active' THEN 'active' ELSE 'inactive' END,
  'Auto-synced from marketplace vendor',
  NULL
FROM marketplace_vendors mv
JOIN users u ON mv.user_id = u.id
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  status = VALUES(status);

-- Create triggers to automatically sync future changes
DROP TRIGGER IF EXISTS after_vendor_insert;
CREATE TRIGGER after_vendor_insert
AFTER INSERT ON marketplace_vendors
FOR EACH ROW
BEGIN
  INSERT INTO suppliers (id, tenant_id, code, name, contact_name, email, phone, country_code, rating, status, notes, created_by)
  SELECT 
    NEW.id,
    NEW.tenant_id,
    CONCAT('VND-', LEFT(NEW.id, 8)),
    NEW.shop_name,
    CONCAT(u.first_name, ' ', u.last_name),
    u.email,
    u.phone,
    'KE',
    5.00,
    CASE WHEN NEW.status = 'active' THEN 'active' ELSE 'inactive' END,
    'Auto-synced from marketplace vendor',
    NULL
  FROM users u
  WHERE u.id = NEW.user_id
  ON DUPLICATE KEY UPDATE
    name = NEW.shop_name,
    status = CASE WHEN NEW.status = 'active' THEN 'active' ELSE 'inactive' END;
END;

DROP TRIGGER IF EXISTS after_vendor_update;

