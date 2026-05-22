-- Backfill standard chart-of-accounts codes for all tenants (missing codes only)

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '1010', 'Petty Cash', 'asset', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '1010' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '1210', 'Inventory — Frozen & Processed', 'asset', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '1210' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '1300', 'Prepaid Expenses', 'asset', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '1300' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '1400', 'M-Pesa / Mobile Money Clearing', 'asset', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '1400' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '1500', 'Fixed Assets', 'asset', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '1500' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '1510', 'Accumulated Depreciation', 'asset', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '1510' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '2100', 'Salaries Payable', 'liability', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '2100' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '2110', 'PAYE Payable', 'liability', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '2110' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '2120', 'NHIF Payable', 'liability', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '2120' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '2200', 'VAT Payable', 'liability', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '2200' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '2300', 'Accrued Expenses', 'liability', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '2300' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '3000', 'Owner''s Equity', 'equity', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '3000' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '3100', 'Retained Earnings', 'equity', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '3100' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '4010', 'Sales Revenue — Processed Products', 'revenue', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '4010' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '4020', 'Marketplace Commission Income', 'revenue', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '4020' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '4100', 'Other Operating Income', 'revenue', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '4100' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5100', 'Payroll Expense', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5100' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5200', 'Fuel & Vessel Operations', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5200' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5300', 'Cold Chain & Storage', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5300' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5400', 'Logistics & Delivery', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5400' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5500', 'Marketing & Sales', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5500' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5600', 'Repairs & Maintenance', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5600' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '5700', 'Licenses & Compliance', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '5700' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '6100', 'Depreciation Expense', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '6100' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '6200', 'Bank & Payment Fees', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '6200' WHERE g.id IS NULL;

INSERT IGNORE INTO gl_accounts (id, tenant_id, code, name, type, is_system)
SELECT UUID(), t.id, '6900', 'Miscellaneous Expense', 'expense', 1 FROM tenants t
LEFT JOIN gl_accounts g ON g.tenant_id = t.id AND g.code = '6900' WHERE g.id IS NULL;

-- Rename legacy short names where only old seed exists
UPDATE gl_accounts SET name = 'Cash on Hand' WHERE code = '1000' AND name = 'Cash';
UPDATE gl_accounts SET name = 'Inventory — Fresh Fish' WHERE code = '1200' AND name = 'Inventory';
UPDATE gl_accounts SET name = 'Sales Revenue — Seafood' WHERE code = '4000' AND name = 'Sales Revenue';
UPDATE gl_accounts SET name = 'Cost of Goods Sold' WHERE code = '5000' AND name = 'Operating Expenses';
