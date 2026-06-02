/**
 * Seed 20 fully-configured demo tenants (all ERP modules).
 *
 *   npm run db:seed:demo
 *   npm run db:seed:demo -- --fresh
 *
 * Owner login: owner-{slug}@demo.aquaerp.local / Demo@123
 * Shared buyer: buyer@demo.aquaerp.local / Demo@123
 */

import 'dotenv/config'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { execute, generateId, getPool, query, queryOne } from '@/lib/db'
import {
  businessTypeToUserRole,
  createTenantWithOwner,
  updateOnboardingStep,
  type BusinessType,
} from '@/lib/modules/tenant/onboarding'
import {
  buildTenantSubdomainDashboardUrl,
  buildTenantSubdomainOrigin,
} from '@/lib/platform/tenant-url'

const DEMO_PASSWORD = 'Demo@123'
const BUYER_EMAIL = 'buyer@demo.aquaerp.local'
const VENDOR_EMAIL = 'vendor@demo.aquaerp.local'

const DEMO_TENANTS: Array<{
  slug: string
  name: string
  businessType: BusinessType
  county: string
  lat: number
  lng: number
}> = [
  { slug: 'coastfish', name: 'Coast Fish Cooperative', businessType: 'cooperative', county: 'Kwale', lat: -4.65, lng: 39.38 },
  { slug: 'lamusea', name: 'Lamu Sea Ventures', businessType: 'fisherman', county: 'Lamu', lat: -2.27, lng: 40.9 },
  { slug: 'aquaerp-demo', name: 'AquaERP Showcase Tenant', businessType: 'cooperative', county: 'Mombasa', lat: -4.04, lng: 39.67 },
]

interface TenantSeedCtx {
  tenantId: string
  slug: string
  name: string
  ownerId: string
  buyerId: string
  vendorUserId: string
  branchId: string
  county: string
  businessType: BusinessType
  index: number
  speciesIds: string[]
  landingSiteId: string
  boatId: string
  facilityId: string
  zoneId: string
  tripId: string
  listingId: string
  orderId: string
  supplierId: string
  customerId: string
}

function ownerEmail(slug: string): string {
  return `owner-${slug}@demo.aquaerp.local`
}

function hashDeviceKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

async function ensureUser(
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  passwordHash: string,
): Promise<string> {
  const existing = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email = ?`, [email])
  if (existing) return existing.id

  const id = generateId()
  await execute(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
     VALUES (?, ?, ?, ?, ?, ?, 'active', TRUE)`,
    [id, email, passwordHash, firstName, lastName, role],
  )
  return id
}

async function ensureBuyer(passwordHash: string): Promise<string> {
  const id = await ensureUser(BUYER_EMAIL, 'Demo', 'Buyer', 'user', passwordHash)
  const wallet = await queryOne<{ id: string }>(`SELECT id FROM wallets WHERE user_id = ? LIMIT 1`, [id])
  if (!wallet) {
    await execute(
      `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
       VALUES (?, 'tenant-default-0001', ?, 50000, 'KES', 'active')`,
      [generateId(), id],
    )
  }
  return id
}

async function ensureVendor(passwordHash: string): Promise<string> {
  const id = await ensureUser(VENDOR_EMAIL, 'Demo', 'Vendor', 'user', passwordHash)
  const wallet = await queryOne<{ id: string }>(`SELECT id FROM wallets WHERE user_id = ? LIMIT 1`, [id])
  if (!wallet) {
    await execute(
      `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
       VALUES (?, 'tenant-default-0001', ?, 0, 'KES', 'active')`,
      [generateId(), id],
    )
  }
  return id
}

async function clearDemoTenants(): Promise<void> {
  const slugs = DEMO_TENANTS.map((t) => t.slug)
  const placeholders = slugs.map(() => '?').join(',')
  const rows = await query<{ id: string }>(
    `SELECT id FROM tenants WHERE slug IN (${placeholders})`,
    slugs,
  )
  const ids = rows.map((r) => r.id)

  if (ids.length > 0) {
    const idPh = ids.map(() => '?').join(',')
    await execute(
      `DELETE jl FROM journal_lines jl
       INNER JOIN journal_entries je ON je.id = jl.journal_entry_id
       WHERE je.tenant_id IN (${idPh})`,
      ids,
    )
    await execute(
      `DELETE oi FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       WHERE o.tenant_id IN (${idPh})`,
      ids,
    )
    await execute(
      `DELETE pol FROM purchase_order_lines pol
       INNER JOIN purchase_orders po ON po.id = pol.purchase_order_id
       WHERE po.tenant_id IN (${idPh})`,
      ids,
    )

    const tables = await query<{ TABLE_NAME: string }>(
      `SELECT DISTINCT TABLE_NAME AS TABLE_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND COLUMN_NAME = 'tenant_id'
         AND TABLE_NAME NOT IN ('tenants')`,
    )

    await execute('SET FOREIGN_KEY_CHECKS = 0')
    for (const { TABLE_NAME } of tables) {
      try {
        await execute(`DELETE FROM \`${TABLE_NAME}\` WHERE tenant_id IN (${idPh})`, ids)
      } catch {
        /* table may not exist in this environment */
      }
    }
    await execute(`DELETE FROM tenants WHERE id IN (${idPh})`, ids)
    await execute('SET FOREIGN_KEY_CHECKS = 1')
    console.log(`  Removed ${rows.length} existing demo tenant(s).`)
  }

  const orphanCodes = [
    ...DEMO_TENANTS.map((t) => `${t.slug}-lnd`),
    ...DEMO_TENANTS.map((t) => `${t.slug.slice(0, 16)}-lnd`),
    ...DEMO_TENANTS.map((t) => `${t.slug.slice(0, 6).toUpperCase()}-LND`),
  ]
  const codePh = orphanCodes.map(() => '?').join(',')
  await execute(`DELETE FROM landing_sites WHERE code IN (${codePh})`, orphanCodes)

  const storageCodes = [
    ...DEMO_TENANTS.map((t) => `${t.slug}-cold`),
    ...DEMO_TENANTS.map((_, i) => `COLD-${i + 1}`),
  ]
  const storagePh = storageCodes.map(() => '?').join(',')
  await execute(`DELETE FROM storage_facilities WHERE code IN (${storagePh})`, storageCodes)

  for (const t of DEMO_TENANTS) {
    await execute(`DELETE FROM fish_species WHERE name LIKE ?`, [`${t.slug} %`])
  }

  await execute(
    `DELETE FROM users WHERE email LIKE '%@demo.aquaerp.local' AND email != ? AND email != ?`,
    [BUYER_EMAIL, VENDOR_EMAIL],
  )
}

async function provisionTenant(
  def: (typeof DEMO_TENANTS)[0],
  index: number,
  passwordHash: string,
  buyerId: string,
  vendorUserId: string,
): Promise<TenantSeedCtx> {
  const email = ownerEmail(def.slug)
  const ownerId = await ensureUser(
    email,
    'Demo',
    'Owner',
    'user',
    passwordHash,
  )

  const { tenantId, slug, branchId } = await createTenantWithOwner(
    ownerId,
    def.name,
    def.businessType,
    def.slug,
  )

  await updateOnboardingStep(tenantId, { finish: true, completeStep: 1 })
  await updateOnboardingStep(tenantId, { finish: true, completeStep: 2 })
  await updateOnboardingStep(tenantId, { finish: true, completeStep: 3 })

  await execute(
    `INSERT INTO tenant_storefront_settings
     (tenant_id, theme_id, store_name, tagline, hero_headline, published, show_traceability, show_reviews)
     VALUES (?, 'ocean-classic', ?, ?, ?, 1, 1, 1)
     ON DUPLICATE KEY UPDATE store_name = VALUES(store_name), published = 1`,
    [tenantId, def.name, `Fresh catch from ${def.county}`, `Welcome to ${def.name}`],
  )

  for (const flag of ['marketplace', 'ai', 'advanced_analytics'] as const) {
    await execute(
      `INSERT INTO tenant_feature_flags (tenant_id, flag_key, enabled)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE enabled = 1`,
      [tenantId, flag],
    )
  }

  // Add buyer to tenant_members
  await execute(
    `INSERT IGNORE INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
     VALUES (?, ?, ?, ?, 'customer', 'active')`,
    [generateId(), tenantId, buyerId, branchId],
  )

  // Add vendor to tenant_members
  await execute(
    `INSERT IGNORE INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
     VALUES (?, ?, ?, ?, 'vendor', 'active')`,
    [generateId(), tenantId, vendorUserId, branchId],
  )

  const ctx: TenantSeedCtx = {
    tenantId,
    slug,
    name: def.name,
    ownerId,
    buyerId,
    vendorUserId,
    branchId,
    county: def.county,
    businessType: def.businessType,
    index,
    speciesIds: [],
    landingSiteId: '',
    boatId: '',
    facilityId: '',
    zoneId: '',
    tripId: '',
    listingId: '',
    orderId: '',
    supplierId: '',
    customerId: '',
  }

  await seedFishing(ctx, def, buyerId)
  await seedCommerce(ctx, buyerId)
  await seedColdChain(ctx)
  await seedCRM(ctx)
  await seedHR(ctx)
  await seedAccounting(ctx)
  await seedProcurement(ctx)
  await seedLogistics(ctx)
  await seedVertical(ctx)
  await seedIntegrationsAndIoT(ctx)
  await seedAI(ctx)
  await seedMisc(ctx)

  // Seed wallets
  await execute(
    `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
     VALUES (?, ?, ?, ?, 'KES', 'active')
     ON DUPLICATE KEY UPDATE tenant_id = VALUES(tenant_id), balance = VALUES(balance)`,
    [generateId(), tenantId, ownerId, 25000 + index * 1500],
  )

  await execute(
    `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
     VALUES (?, ?, ?, 100000, 'KES', 'active')
     ON DUPLICATE KEY UPDATE balance = 100000`,
    [generateId(), tenantId, buyerId],
  )

  await execute(
    `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
     VALUES (?, ?, ?, 0, 'KES', 'active')
     ON DUPLICATE KEY UPDATE balance = 0`,
    [generateId(), tenantId, vendorUserId],
  )

  return ctx
}

async function seedFishing(
  ctx: TenantSeedCtx,
  def: (typeof DEMO_TENANTS)[0],
  _buyerId: string,
): Promise<void> {
  const siteId = generateId()
  ctx.landingSiteId = siteId
  await execute(
    `INSERT INTO landing_sites (id, tenant_id, name, code, county, latitude, longitude, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      siteId,
      ctx.tenantId,
      `${def.county} Landing`,
      `${def.slug.slice(0, 16)}-lnd`,
      def.county,
      def.lat,
      def.lng,
    ],
  )

  const species = [
    { label: 'Nile Perch', sci: 'Lates niloticus' },
    { label: 'Tilapia', sci: 'Oreochromis niloticus' },
    { label: 'Tuna', sci: 'Thunnus albacares' },
  ]
  for (const sp of species) {
    const spId = generateId()
    ctx.speciesIds.push(spId)
    const name = `${ctx.slug} ${sp.label}`
    await execute(
      `INSERT INTO fish_species (id, tenant_id, name, scientific_name, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [spId, ctx.tenantId, name, sp.sci],
    )
  }

  const boatId = generateId()
  ctx.boatId = boatId
  await execute(
    `INSERT INTO boats (id, tenant_id, owner_id, registration_number, name, type, capacity_kg, status, gps_enabled)
     VALUES (?, ?, ?, ?, ?, 'fiber', ?, 'active', TRUE)`,
    [
      boatId,
      ctx.tenantId,
      ctx.ownerId,
      `KEN-DEMO-${String(ctx.index + 1).padStart(3, '0')}`,
      `${ctx.name} Vessel`,
      400 + ctx.index * 25,
    ],
  )

  const tripId = generateId()
  ctx.tripId = tripId
  const departure = new Date(Date.now() - (ctx.index + 2) * 86400000)
  const returnTime = new Date(departure.getTime() + 8 * 3600000)
  const catchKg = 120 + ctx.index * 8
  const unitPrice = 320 + ctx.index * 5

  await execute(
    `INSERT INTO fishing_trips (id, tenant_id, boat_id, captain_id, landing_site_id, departure_time, return_time, status, fishing_zone, weather_conditions, sea_state, fuel_used_liters, fuel_cost, total_catch_kg, total_revenue)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', 'Zone A', 'Clear', 'calm', 80, 12000, ?, ?)`,
    [
      tripId,
      ctx.tenantId,
      boatId,
      ctx.ownerId,
      siteId,
      departure,
      returnTime,
      catchKg,
      catchKg * unitPrice,
    ],
  )

  const speciesId = ctx.speciesIds[ctx.index % ctx.speciesIds.length]
  const catchId = generateId()
  await execute(
    `INSERT INTO catches (id, tenant_id, trip_id, species_id, quantity_kg, grade, unit_price, storage_method, recorded_by)
     VALUES (?, ?, ?, ?, ?, 'A', ?, 'iced', ?)`,
    [
      catchId,
      ctx.tenantId,
      tripId,
      speciesId,
      catchKg,
      unitPrice,
      ctx.ownerId,
    ],
  )

  const lotCode = `LOT-${ctx.slug.toUpperCase()}-001`
  const spName = ctx.speciesIds[0] === speciesId ? `${ctx.slug} Nile Perch` : `${ctx.slug} Tilapia`
  await execute(
    `INSERT INTO traceability_lots (id, tenant_id, lot_code, catch_id, species_name, vessel_name, landing_site, catch_date, grading, msc_certified, fao_area, storage_temp_c, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'A', 1, 'FAO-51', -22.0, 'active')`,
    [
      generateId(),
      ctx.tenantId,
      lotCode,
      catchId,
      spName,
      `${ctx.name} Vessel`,
      `${def.county} Landing`,
      departure,
    ],
  )

  await execute(
    `INSERT INTO catch_quotas (id, tenant_id, name, species_id, fishing_zone, period_type, period_start, period_end, quota_kg, issuing_authority, status)
     VALUES (?, ?, ?, ?, 'Inshore', 'annual', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 335 DAY), ?, 'Kenya Fisheries', 'active')`,
    [generateId(), ctx.tenantId, `${ctx.name} Annual Quota`, speciesId, 50000 + ctx.index * 1000],
  )

  await execute(
    `INSERT INTO bmu (id, tenant_id, name, code, county, chairman_id, status, total_members, total_boats)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    [
      generateId(),
      ctx.tenantId,
      `${def.county} BMU`,
      `${def.slug}-bmu`,
      def.county,
      ctx.ownerId,
      40 + ctx.index * 2,
      5 + (ctx.index % 8),
    ],
  )
}

async function seedCommerce(ctx: TenantSeedCtx, buyerId: string): Promise<void> {
  const speciesId = ctx.speciesIds[0]
  const vendorId = generateId()
  await execute(
    `INSERT INTO marketplace_vendors (id, tenant_id, user_id, shop_name, commission_rate, status)
     VALUES (?, ?, ?, ?, 10, 'active')`,
    [vendorId, ctx.tenantId, ctx.ownerId, `${ctx.name} Seafood Shop`],
  )

  const sharedVendorId = generateId()
  await execute(
    `INSERT INTO marketplace_vendors (id, tenant_id, user_id, shop_name, commission_rate, status)
     VALUES (?, ?, ?, ?, 12, 'active')`,
    [sharedVendorId, ctx.tenantId, ctx.vendorUserId, `${ctx.name} Shared Vendor Shop`],
  )

  const sku = `SKU-${ctx.slug.toUpperCase().slice(0, 12)}`
  const catalogId = generateId()
  await execute(
    `INSERT INTO product_catalog (id, tenant_id, vendor_id, sku, name, species_id, category, unit, base_price, status)
     VALUES (?, ?, ?, ?, ?, ?, 'fresh', 'kg', ?, 'active')`,
    [catalogId, ctx.tenantId, vendorId, sku, `${ctx.name} Fresh Fillet`, speciesId, 450 + ctx.index * 10],
  )

  const listingId = generateId()
  ctx.listingId = listingId
  const qty = 80 + ctx.index * 3
  await execute(
    `INSERT INTO fish_listings (id, tenant_id, seller_id, species_id, fish_type, quantity_kg, available_quantity_kg, grade, price_per_kg, landing_site_id, storage_method, status, expires_at)
     VALUES (?, ?, ?, ?, 'Fresh', ?, ?, 'A', ?, ?, 'iced', 'available', DATE_ADD(NOW(), INTERVAL 14 DAY))`,
    [
      listingId,
      ctx.tenantId,
      ctx.ownerId,
      speciesId,
      qty,
      qty,
      420 + ctx.index * 5,
      ctx.landingSiteId,
    ],
  )

  const orderId = generateId()
  ctx.orderId = orderId
  const orderNum = `ORD-DEMO-${ctx.slug.toUpperCase().slice(0, 10)}-${ctx.index + 1}`
  const subtotal = 15000 + ctx.index * 500
  const deliveryFee = 500
  const tax = Math.round(subtotal * 0.16 * 100) / 100
  const total = subtotal + deliveryFee + tax

  await execute(
    `INSERT INTO orders (id, tenant_id, order_number, buyer_id, seller_id, status, subtotal, delivery_fee, tax, total, payment_status, delivery_address)
     VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'paid', ?)`,
    [
      orderId,
      ctx.tenantId,
      orderNum,
      buyerId,
      ctx.ownerId,
      subtotal,
      deliveryFee,
      tax,
      total,
      `${ctx.county} wholesale depot`,
    ],
  )

  await execute(
    `INSERT INTO order_items (id, order_id, listing_id, species_id, quantity_kg, unit_price)
     VALUES (?, ?, ?, ?, 25, ?)`,
    [generateId(), orderId, listingId, speciesId, 420 + ctx.index * 5],
  )

  await execute(
    `INSERT INTO coupons (id, tenant_id, code, discount_type, discount_value, min_order_amount, status, valid_from, valid_to)
     VALUES (?, ?, ?, 'percent', 5, 5000, 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY))`,
    [generateId(), ctx.tenantId, `WELCOME${ctx.index + 1}`],
  )

  await execute(
    `INSERT INTO inventory_batches (id, tenant_id, sku, product_name, species_id, batch_code, quantity_kg, storage_type, source_type, source_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'fresh', 'catch', ?, 'available')`,
    [
      generateId(),
      ctx.tenantId,
      sku,
      `${ctx.name} Batch`,
      speciesId,
      `${ctx.slug}-batch-1`,
      200 + ctx.index * 5,
      ctx.tripId,
    ],
  )
}

async function seedColdChain(ctx: TenantSeedCtx): Promise<void> {
  const facilityId = generateId()
  ctx.facilityId = facilityId
  await execute(
    `INSERT INTO storage_facilities (id, tenant_id, name, code, type, capacity_kg, current_stock_kg, county, status, temperature_min, temperature_max, current_temperature, daily_rate_per_kg)
     VALUES (?, ?, ?, ?, 'cold_room', 8000, 3200, ?, 'operational', -25, -18, -20, 5)`,
    [
      facilityId,
      ctx.tenantId,
      `${ctx.name} Cold Store`,
      `${ctx.slug}-cold`,
      ctx.county,
    ],
  )

  const zoneId = generateId()
  ctx.zoneId = zoneId
  await execute(
    `INSERT INTO storage_zones (id, facility_id, tenant_id, code, name, target_temp_c, min_temp_c, max_temp_c, capacity_kg, status)
     VALUES (?, ?, ?, 'ZONE-A', 'Main chill zone', -20, -22, -18, 4000, 'active')`,
    [zoneId, facilityId, ctx.tenantId],
  )

  for (let i = 0; i < 5; i++) {
    await execute(
      `INSERT INTO temperature_readings (id, tenant_id, zone_id, facility_id, reading_c, humidity_pct, recorded_at, source)
       VALUES (?, ?, ?, ?, ?, 65, DATE_SUB(NOW(), INTERVAL ? HOUR), 'iot')`,
      [generateId(), ctx.tenantId, zoneId, facilityId, -19.5 + i * 0.1, i * 4],
    )
  }

  await execute(
    `INSERT INTO coldchain_alerts (id, tenant_id, facility_id, alert_type, severity, message, reading_value, resolved)
     VALUES (?, ?, ?, 'temperature', 'warning', 'Zone A briefly above target', -17.5, 1)`,
    [generateId(), ctx.tenantId, facilityId],
  )
}

async function seedCRM(ctx: TenantSeedCtx): Promise<void> {
  const customerId = generateId()
  ctx.customerId = customerId
  await execute(
    `INSERT INTO crm_customers (id, tenant_id, user_id, name, email, phone, segment, lifetime_value, status)
     VALUES (?, ?, ?, ?, ?, ?, 'wholesale', ?, 'active')`,
    [
      customerId,
      ctx.tenantId,
      ctx.buyerId,
      `${ctx.county} Wholesale Ltd`,
      `wholesale-${ctx.slug}@example.com`,
      `+2547${String(10000000 + ctx.index).slice(0, 8)}`,
      120000 + ctx.index * 5000,
    ],
  )

  await execute(
    `INSERT INTO crm_leads (id, tenant_id, name, email, source, stage, estimated_value, assigned_to)
     VALUES (?, ?, ?, ?, 'referral', 'qualified', ?, ?)`,
    [
      generateId(),
      ctx.tenantId,
      'Nairobi Hotel Group',
      `leads-${ctx.slug}@example.com`,
      85000 + ctx.index * 2000,
      ctx.ownerId,
    ],
  )

  const speciesId = ctx.speciesIds[0]
  await execute(
    `INSERT INTO sales_contracts (id, tenant_id, contract_number, buyer_name, buyer_email, customer_id, species_id, price_per_kg, contracted_kg, delivered_kg, status, start_date, end_date, payment_terms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'Net 30')`,
    [
      generateId(),
      ctx.tenantId,
      `SC-${ctx.slug.toUpperCase().slice(0, 12)}`,
      `${ctx.county} Wholesale Ltd`,
      `wholesale-${ctx.slug}@example.com`,
      customerId,
      speciesId,
      400 + ctx.index * 3,
      5000,
      1200 + ctx.index * 50,
    ],
  )
}

async function seedHR(ctx: TenantSeedCtx): Promise<void> {
  await execute(
    `INSERT INTO hr_employees (id, tenant_id, user_id, employee_number, full_name, department, job_title, hire_date, salary, status)
     VALUES (?, ?, ?, ?, ?, 'Operations', 'Fleet Captain', DATE_SUB(CURDATE(), INTERVAL 400 DAY), 45000, 'active')`,
    [
      generateId(),
      ctx.tenantId,
      ctx.ownerId,
      `EMP-${ctx.index + 1}`,
      'Demo Captain',
    ],
  )
  await execute(
    `INSERT INTO hr_employees (id, tenant_id, employee_number, full_name, department, job_title, hire_date, salary, status)
     VALUES (?, ?, ?, ?, 'Cold Chain', 'Storekeeper', DATE_SUB(CURDATE(), INTERVAL 200 DAY), 32000, 'active')`,
    [generateId(), ctx.tenantId, `EMP-${ctx.index + 1}B`, 'Demo Storekeeper'],
  )
  await execute(
    `INSERT INTO hr_payroll_runs (id, tenant_id, period_start, period_end, status, total_gross, total_net)
     VALUES (?, ?, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), 'paid', 125000, 98000)`,
    [generateId(), ctx.tenantId],
  )
}

async function seedAccounting(ctx: TenantSeedCtx): Promise<void> {
  const cash = await queryOne<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE tenant_id = ? AND code = '1000'`,
    [ctx.tenantId],
  )
  const revenue = await queryOne<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE tenant_id = ? AND code = '4000'`,
    [ctx.tenantId],
  )
  if (!cash?.id || !revenue?.id) return

  const entryId = generateId()
  const amount = 25000 + ctx.index * 1000
  await execute(
    `INSERT INTO journal_entries (id, tenant_id, entry_number, entry_date, description, reference_type, status, created_by)
     VALUES (?, ?, ?, CURDATE(), ?, 'order', 'posted', ?)`,
    [entryId, ctx.tenantId, `JE-DEMO-${ctx.index + 1}`, 'Demo sales recognition', ctx.ownerId],
  )
  await execute(
    `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
     VALUES (?, ?, ?, ?, 0, 'Cash receipt')`,
    [generateId(), entryId, cash.id, amount],
  )
  await execute(
    `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
     VALUES (?, ?, ?, 0, ?, 'Sales revenue')`,
    [generateId(), entryId, revenue.id, amount],
  )
}

async function seedProcurement(ctx: TenantSeedCtx): Promise<void> {
  const supplierId = generateId()
  ctx.supplierId = supplierId
  await execute(
    `INSERT INTO suppliers (id, tenant_id, code, name, contact_name, email, phone, country_code, rating, status, created_by)
     VALUES (?, ?, ?, ?, 'Supply Desk', ?, ?, 'KE', 4.5, 'active', ?)`,
    [
      supplierId,
      ctx.tenantId,
      `SUP-${ctx.index + 1}`,
      'Coastal Ice & Fuel Supplies',
      `supplier-${ctx.slug}@example.com`,
      `+2547${String(20000000 + ctx.index).slice(0, 8)}`,
      ctx.ownerId,
    ],
  )

  await execute(
    `INSERT INTO purchase_requests (id, tenant_id, pr_number, requested_by, department, status, needed_by, notes)
     VALUES (?, ?, ?, ?, 'Operations', 'approved', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Fuel and ice for next trip')`,
    [generateId(), ctx.tenantId, `PR-${ctx.index + 1}`, ctx.ownerId],
  )

  const poId = generateId()
  await execute(
    `INSERT INTO purchase_orders (id, tenant_id, supplier_id, po_number, status, subtotal, tax_amount, total_amount, expected_date, created_by)
     VALUES (?, ?, ?, ?, 'sent', 45000, 7200, 52200, DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?)`,
    [poId, ctx.tenantId, supplierId, `PO-${ctx.index + 1}`, ctx.ownerId],
  )
  await execute(
    `INSERT INTO purchase_order_lines (id, purchase_order_id, description, quantity, unit, unit_price, line_total)
     VALUES (?, ?, 'Marine diesel', 500, 'L', 120, 60000)`,
    [generateId(), poId],
  )
}

async function seedLogistics(ctx: TenantSeedCtx): Promise<void> {
  await execute(
    `INSERT INTO deliveries (id, tenant_id, order_id, tracking_code, status, driver_user_id, pickup_address, delivery_address, scheduled_at)
     VALUES (?, ?, ?, ?, 'in_transit', ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
    [
      generateId(),
      ctx.tenantId,
      ctx.orderId,
      `TRK-${ctx.slug.toUpperCase().slice(0, 10)}`,
      ctx.ownerId,
      `${ctx.county} landing site`,
      'Nairobi City Market, Kenya',
    ],
  )
}

async function seedVertical(ctx: TenantSeedCtx): Promise<void> {
  const policyId = generateId()
  await execute(
    `INSERT INTO insurance_policies (id, tenant_id, boat_id, policy_number, insurer_name, policy_type, premium_amount, coverage_amount, start_date, end_date, status)
     VALUES (?, ?, ?, ?, 'Kenya Marine Insurance', 'hull', 85000, 2500000, DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_ADD(CURDATE(), INTERVAL 305 DAY), 'active')`,
    [policyId, ctx.tenantId, ctx.boatId, `POL-${ctx.index + 1}`],
  )
  await execute(
    `INSERT INTO insurance_claims (id, tenant_id, policy_id, boat_id, claim_number, incident_date, description, claimed_amount, status)
     VALUES (?, ?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Minor hull damage from docking', 45000, 'reviewing')`,
    [generateId(), ctx.tenantId, policyId, ctx.boatId, `CLM-${ctx.index + 1}`],
  )
}

async function seedIntegrationsAndIoT(ctx: TenantSeedCtx): Promise<void> {
  await execute(
    `INSERT INTO integration_connections (id, tenant_id, provider, name, config, status)
     VALUES (?, ?, 'mpesa', 'M-Pesa Sandbox', ?, 'inactive'),
            (?, ?, 'sms', 'SMS Gateway', '{}', 'inactive')`,
    [
      generateId(),
      ctx.tenantId,
      JSON.stringify({ mode: 'sandbox' }),
      generateId(),
      ctx.tenantId,
    ],
  )

  const ingestKey = `dev_${crypto.randomBytes(16).toString('hex')}`
  const deviceKey = ingestKey.slice(0, 12)
  await execute(
    `INSERT INTO iot_devices (id, tenant_id, device_key, device_key_hash, name, device_type, facility_id, zone_id, boat_id, status, last_seen_at)
     VALUES (?, ?, ?, ?, 'Chill probe 1', 'temperature_probe', ?, ?, NULL, 'active', NOW())`,
    [
      generateId(),
      ctx.tenantId,
      deviceKey,
      hashDeviceKey(ingestKey),
      ctx.facilityId,
      ctx.zoneId,
    ],
  )

  await execute(
    `INSERT INTO gps_telemetry (id, tenant_id, boat_id, latitude, longitude, speed_knots, recorded_at, source)
     VALUES (?, ?, ?, ?, ?, 8.5, NOW(), 'iot')`,
    [generateId(), ctx.tenantId, ctx.boatId, -4.04 + ctx.index * 0.001, 39.67 + ctx.index * 0.001],
  )
}

async function seedAI(ctx: TenantSeedCtx): Promise<void> {
  await execute(
    `INSERT INTO ai_insights (id, tenant_id, insight_type, title, summary, recommendations, metrics)
     VALUES (?, ?, 'business_brief', ?, ?, ?, ?)`,
    [
      generateId(),
      ctx.tenantId,
      'Weekly operations brief',
      `Demo insight for ${ctx.name}: catch and cold-chain metrics are within target.`,
      JSON.stringify(['Schedule next trip within 48h', 'Review zone A temperature logs']),
      JSON.stringify({ trips: 1, orders: 1, coldchain_alerts: 1 }),
    ],
  )
  await execute(
    `INSERT INTO ai_automation_runs (id, tenant_id, status, forecasts_computed)
     VALUES (?, ?, 'success', 3)`,
    [generateId(), ctx.tenantId],
  )
}

async function seedMisc(ctx: TenantSeedCtx): Promise<void> {
  await execute(
    `INSERT INTO expenses (id, tenant_id, user_id, category, description, amount, expense_date, status)
     VALUES (?, ?, ?, 'fuel', 'Trip fuel top-up', ?, CURDATE(), 'approved')`,
    [generateId(), ctx.tenantId, ctx.ownerId, 8500 + ctx.index * 100],
  )

  await execute(
    `INSERT INTO notifications (id, tenant_id, user_id, type, title, message, is_read)
     VALUES (?, ?, ?, 'success', 'Trip recorded', 'Your latest fishing trip was saved.', 0),
            (?, ?, ?, 'info', 'Order confirmed', 'A marketplace order was confirmed.', 0)`,
    [
      generateId(),
      ctx.tenantId,
      ctx.ownerId,
      generateId(),
      ctx.tenantId,
      ctx.ownerId,
    ],
  )
}

async function main(): Promise<void> {
  const fresh = process.argv.includes('--fresh')
  console.log('🌱 Demo tenant seed')
  console.log(`   Tenants: ${DEMO_TENANTS.length}`)
  console.log(`   Mode: ${fresh ? 'fresh (remove existing demo data first)' : 'incremental (skip existing slugs via createTenantWithOwner)'}`)
  console.log('')

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  if (fresh) {
    console.log('Clearing prior demo tenants and users…')
    await clearDemoTenants()
  }

  const buyerId = await ensureBuyer(passwordHash)
  const vendorUserId = await ensureVendor(passwordHash)

  const manifest: Array<{
    slug: string
    name: string
    ownerEmail: string
    subdomain: string
    dashboard: string
  }> = []

  for (let i = 0; i < DEMO_TENANTS.length; i++) {
    const def = DEMO_TENANTS[i]
    console.log(`[${i + 1}/${DEMO_TENANTS.length}] ${def.name} (${def.slug})…`)
    try {
      if (!fresh) {
        const taken = await queryOne<{ id: string }>(`SELECT id FROM tenants WHERE slug = ?`, [def.slug])
        if (taken) {
          console.log(`  ↷ Skipped — slug already exists. Use --fresh to recreate.`)
          manifest.push({
            slug: def.slug,
            name: def.name,
            ownerEmail: ownerEmail(def.slug),
            subdomain: buildTenantSubdomainOrigin(def.slug),
            dashboard: buildTenantSubdomainDashboardUrl(def.slug),
          })
          continue
        }
      }
      await provisionTenant(def, i, passwordHash, buyerId, vendorUserId)
      manifest.push({
        slug: def.slug,
        name: def.name,
        ownerEmail: ownerEmail(def.slug),
        subdomain: buildTenantSubdomainOrigin(def.slug),
        dashboard: buildTenantSubdomainDashboardUrl(def.slug),
      })
      console.log(`  ✓ Done`)
    } catch (err) {
      console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err)
      throw err
    }
  }

  console.log('')
  console.log('✅ Demo seed complete')
  console.log('')
  console.log(`Password (all owners + buyer): ${DEMO_PASSWORD}`)
  console.log(`Shared buyer: ${BUYER_EMAIL}`)
  console.log('')
  console.log('Tenant manifest:')
  console.table(manifest)

  const pool = getPool()
  await pool.end()
}

main().catch((err) => {
  console.error('❌ Demo seed failed:', err)
  process.exit(1)
})
