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
const B2B_BUYER_EMAIL = 'buyer-b2b@demo.aquaerp.local'
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

async function ensureB2BBuyer(passwordHash: string): Promise<string> {
  const id = await ensureUser(B2B_BUYER_EMAIL, 'B2B', 'Buyer', 'user', passwordHash)
  const wallet = await queryOne<{ id: string }>(`SELECT id FROM wallets WHERE user_id = ? LIMIT 1`, [id])
  if (!wallet) {
    await execute(
      `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
       VALUES (?, 'tenant-default-0001', ?, 100000, 'KES', 'active')`,
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
    `DELETE FROM users WHERE email LIKE '%@demo.aquaerp.local' AND email != ? AND email != ? AND email != ?`,
    [BUYER_EMAIL, B2B_BUYER_EMAIL, VENDOR_EMAIL],
  )
}

async function provisionTenant(
  def: (typeof DEMO_TENANTS)[0],
  index: number,
  passwordHash: string,
  buyerId: string,
  b2bBuyerId: string,
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

  // Add B2B buyer to tenant_members
  await execute(
    `INSERT IGNORE INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
     VALUES (?, ?, ?, ?, 'customer', 'active')`,
    [generateId(), tenantId, b2bBuyerId, branchId],
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
    buyerId: b2bBuyerId,
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

  await seedFishing(ctx, def, b2bBuyerId)
  await seedCommerce(ctx, b2bBuyerId)
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
    [generateId(), tenantId, b2bBuyerId],
  )

  await execute(
    `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
     VALUES (?, ?, ?, 0, 'KES', 'active')
     ON DUPLICATE KEY UPDATE balance = 0`,
    [generateId(), tenantId, vendorUserId],
  )

  if (def.slug === 'aquaerp-demo') {
    await seedShowcaseLarge(ctx, def, passwordHash)
  }

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
     VALUES (?, ?, ?, ?, 'cold_room', 12000, 5200, ?, 'operational', -45, 5, -20, 5)`,
    [
      facilityId,
      ctx.tenantId,
      `${ctx.name} Cold Store`,
      `${ctx.slug}-cold`,
      ctx.county,
    ],
  )

  const zones = [
    { code: 'FZ-1', name: 'Freezer Room', target: -20, min: -25, max: -18, cap: 6000, temp: -20.5, hum: 65 },
    { code: 'CZ-1', name: 'Fresh Fish Chiller', target: 2, min: 0, max: 4, cap: 3000, temp: 1.8, hum: 85 },
    { code: 'SFZ-1', name: 'Ultra-low Tuna Vault', target: -40, min: -45, max: -35, cap: 3000, temp: -41.2, hum: 55 }
  ]

  for (const z of zones) {
    const zoneId = generateId()
    if (z.code === 'FZ-1') {
      ctx.zoneId = zoneId // Keep reference to first zone for device registration compatibility
    }
    await execute(
      `INSERT INTO storage_zones (id, facility_id, tenant_id, code, name, target_temp_c, min_temp_c, max_temp_c, capacity_kg, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [zoneId, facilityId, ctx.tenantId, z.code, z.name, z.target, z.min, z.max, z.cap],
    )

    // Seed 5 temperature readings for each zone with realistic timeframe distribution
    for (let i = 0; i < 5; i++) {
      const variation = (i - 2) * 0.2
      await execute(
        `INSERT INTO temperature_readings (id, tenant_id, zone_id, facility_id, reading_c, humidity_pct, recorded_at, source)
         VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR), 'iot')`,
        [generateId(), ctx.tenantId, zoneId, facilityId, z.temp + variation, z.hum, i * 4],
      )
    }
  }

  // Seed unresolved critical alert for Tuna Vault and resolved alert for Freezer Room
  await execute(
    `INSERT INTO coldchain_alerts (id, tenant_id, facility_id, alert_type, severity, message, reading_value, resolved)
     VALUES (?, ?, ?, 'temperature', 'warning', 'Freezer Room temperature briefly above target', -17.5, 1),
            (?, ?, ?, 'temperature', 'critical', 'Ultra-low Tuna Vault exceeded critical limit of -35°C', -32.8, 0)`,
    [generateId(), ctx.tenantId, facilityId, generateId(), ctx.tenantId, facilityId],
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

async function seedShowcaseLarge(
  ctx: TenantSeedCtx,
  def: (typeof DEMO_TENANTS)[0],
  passwordHash: string,
): Promise<void> {
  console.log(`  🚀 Generating large showcase dataset for ${ctx.name}...`)

  // 1. Create extra users (crew and captains)
  const crewUsers = [
    { email: 'captain-nyali@demo.aquaerp.local', first: 'Said', last: 'Bakari', role: 'user' },
    { email: 'crew-juma@demo.aquaerp.local', first: 'Juma', last: 'Ali', role: 'user' },
    { email: 'crew-mwangi@demo.aquaerp.local', first: 'Peter', last: 'Mwangi', role: 'user' },
    { email: 'crew-otieno@demo.aquaerp.local', first: 'Kevin', last: 'Otieno', role: 'user' },
  ]
  const crewIds: string[] = []
  for (const c of crewUsers) {
    const id = await ensureUser(c.email, c.first, c.last, c.role, passwordHash)
    crewIds.push(id)
    // Add to tenant_members
    await execute(
      `INSERT IGNORE INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
       VALUES (?, ?, ?, ?, 'staff', 'active')`,
      [generateId(), ctx.tenantId, id, ctx.branchId],
    )
  }

  // 2. Create extra boats
  const extraBoats = [
    { name: 'Mombasa Wave', reg: 'KEN-MB-002', type: 'fiber', cap: 600 },
    { name: 'Nyali Explorer', reg: 'KEN-MB-003', type: 'fiber', cap: 800 },
    { name: 'Likoni Express', reg: 'KEN-MB-004', type: 'wooden', cap: 450 },
  ]
  const boatIds = [ctx.boatId]
  for (const b of extraBoats) {
    const id = generateId()
    boatIds.push(id)
    await execute(
      `INSERT INTO boats (id, tenant_id, owner_id, registration_number, name, type, capacity_kg, status, gps_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', TRUE)`,
      [id, ctx.tenantId, ctx.ownerId, b.reg, b.name, b.type, b.cap],
    )

    // Add crew to boat
    for (const crewId of crewIds) {
      await execute(
        `INSERT IGNORE INTO boat_crew (id, boat_id, crew_member_id, role, status, joined_date)
         VALUES (?, ?, ?, 'deckhand', 'active', CURDATE())`,
        [generateId(), id, crewId],
      )
    }
  }

  // 3. Generate fishing trips and catches over the last 12 months
  // We want ~60 trips spread over 365 days.
  const speciesList = ctx.speciesIds // Nile Perch, Tilapia, Tuna
  const now = new Date()
  let tripCount = 0

  // To make financial charts look rich and continuous, we distribute trips evenly
  for (let dayOffset = 360; dayOffset >= 5; dayOffset -= 6) {
    const departureTime = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    departureTime.setHours(4 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0)
    const returnTime = new Date(departureTime.getTime() + (6 + Math.floor(Math.random() * 5)) * 60 * 60 * 1000)

    const boatId = boatIds[tripCount % boatIds.length]
    const captainId = tripCount % 2 === 0 ? ctx.ownerId : crewIds[0]
    const tripId = generateId()
    tripCount++

    const zones = ['Zone A', 'Zone B', 'Deep Sea', 'Inshore']
    const weatherList = ['Clear', 'Partly Cloudy', 'Light Rain', 'Sunny']
    const seaStates = ['calm', 'moderate', 'rough']

    await execute(
      `INSERT INTO fishing_trips (id, tenant_id, boat_id, captain_id, landing_site_id, departure_time, return_time, status, fishing_zone, weather_conditions, sea_state, fuel_used_liters, fuel_cost, total_catch_kg, total_revenue)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, 0, 0)`,
      [
        tripId,
        ctx.tenantId,
        boatId,
        captainId,
        ctx.landingSiteId,
        departureTime,
        returnTime,
        zones[tripCount % zones.length],
        weatherList[tripCount % weatherList.length],
        seaStates[tripCount % seaStates.length],
        50 + Math.floor(Math.random() * 100),
        7000 + Math.floor(Math.random() * 8000),
      ],
    )

    // Add 1-3 catches for this trip
    const numCatches = 1 + (tripCount % 3)
    let totalTripCatch = 0
    let totalTripRevenue = 0

    for (let c = 0; c < numCatches; c++) {
      const speciesId = speciesList[(tripCount + c) % speciesList.length]
      const weight = 80 + Math.floor(Math.random() * 150)
      const grade = ['A', 'B', 'C'][c % 3] as 'A' | 'B' | 'C'
      const unitPrice = grade === 'A' ? 450 + (tripCount % 100) : grade === 'B' ? 350 + (tripCount % 50) : 250
      const catchValue = weight * unitPrice

      await execute(
        `INSERT INTO catches (id, tenant_id, trip_id, species_id, quantity_kg, grade, unit_price, storage_method, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'iced', ?, ?)`,
        [generateId(), ctx.tenantId, tripId, speciesId, weight, grade, unitPrice, captainId, departureTime],
      )

      totalTripCatch += weight
      totalTripRevenue += catchValue

      // Create traceability lot for Grade A
      if (grade === 'A' && tripCount % 3 === 0) {
        await execute(
          `INSERT INTO traceability_lots (id, tenant_id, lot_code, catch_id, species_name, vessel_name, landing_site, catch_date, grading, msc_certified, fao_area, storage_temp_c, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'FAO-51', -18.5, 'active')`,
          [
            generateId(),
            ctx.tenantId,
            `LOT-${ctx.slug.toUpperCase()}-${tripCount}-${c}`,
            generateId(), // mock catch link
            c === 0 ? 'Nile Perch' : 'Tuna',
            `Showcase Vessel ${tripCount % boatIds.length}`,
            `${def.county} Landing`,
            departureTime,
            grade,
          ],
        )
      }
    }

    // Update trip totals
    await execute(
      `UPDATE fishing_trips SET total_catch_kg = ?, total_revenue = ? WHERE id = ?`,
      [totalTripCatch, totalTripRevenue, tripId],
    )
  }

  // 3.5 Seed ongoing (in-progress) fishing trips that depart weeks ago and will take weeks to complete
  console.log('  Seeding ongoing trips for catch logging...')
  const ongoingTripsData = [
    {
      id: generateId(),
      boatId: boatIds[0],
      captainId: ctx.ownerId,
      departureTime: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      zone: 'Deep Sea',
    },
    {
      id: generateId(),
      boatId: boatIds[1 % boatIds.length],
      captainId: crewIds[0] ?? ctx.ownerId,
      departureTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      zone: 'Zone B',
    }
  ]

  for (const ot of ongoingTripsData) {
    await execute(
      `INSERT INTO fishing_trips (id, tenant_id, boat_id, captain_id, landing_site_id, departure_time, return_time, status, fishing_zone, weather_conditions, sea_state, fuel_used_liters, fuel_cost, total_catch_kg, total_revenue)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'ongoing', ?, 'Partly Cloudy', 'moderate', 0, 0, 0, 0)`,
      [
        ot.id,
        ctx.tenantId,
        ot.boatId,
        ot.captainId,
        ctx.landingSiteId,
        ot.departureTime,
        ot.zone,
      ],
    )
  }

  // 4. Generate orders & wallet transactions over the last 12 months
  // ~45 orders.
  const buyerWallet = await queryOne<{ id: string }>(
    `SELECT id FROM wallets WHERE user_id = ?`,
    [ctx.buyerId],
  )
  const ownerWallet = await queryOne<{ id: string }>(
    `SELECT id FROM wallets WHERE user_id = ?`,
    [ctx.ownerId],
  )

  let orderCount = 0
  for (let dayOffset = 340; dayOffset >= 10; dayOffset -= 8) {
    const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    orderDate.setHours(10 + (orderCount % 6), (orderCount * 13) % 60, 0, 0)

    const orderId = generateId()
    orderCount++
    const orderNum = `ORD-SHOWCASE-${ctx.slug.toUpperCase().slice(0, 8)}-${orderCount}`
    
    // Choose status
    const status = orderCount % 12 === 0 ? 'cancelled' : orderCount % 8 === 0 ? 'processing' : 'delivered'
    const paymentStatus = status === 'cancelled' ? 'refunded' : 'paid'

    const subtotal = 20000 + Math.floor(Math.random() * 30000)
    const deliveryFee = 500
    const tax = Math.round(subtotal * 0.16 * 100) / 100
    const total = subtotal + deliveryFee + tax

    await execute(
      `INSERT INTO orders (id, tenant_id, order_number, buyer_id, seller_id, status, subtotal, delivery_fee, tax, total, payment_status, delivery_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        ctx.tenantId,
        orderNum,
        ctx.buyerId,
        ctx.ownerId,
        status,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentStatus,
        `Depot Station ${orderCount % 4}, Mombasa`,
        orderDate,
      ],
    )

    // Insert order items
    await execute(
      `INSERT INTO order_items (id, order_id, listing_id, species_id, quantity_kg, unit_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        orderId,
        ctx.listingId,
        speciesList[orderCount % speciesList.length],
        50 + (orderCount % 10) * 10,
        350 + (orderCount % 5) * 20,
      ],
    )

    // Insert transactions
    if (ownerWallet && buyerWallet && paymentStatus === 'paid') {
      // Buyer pays
      await execute(
        `INSERT INTO transactions (id, wallet_id, type, amount, currency, balance_before, balance_after, description, status, payment_method, created_at)
         VALUES (?, ?, 'purchase', ?, 'KES', 100000, 100000 - ?, ?, 'completed', 'mpesa', ?)`,
        [generateId(), buyerWallet.id, -total, total, `Purchase order ${orderNum}`, orderDate],
      )
      // Owner receives
      await execute(
        `INSERT INTO transactions (id, wallet_id, type, amount, currency, balance_before, balance_after, description, status, payment_method, created_at)
         VALUES (?, ?, 'deposit', ?, 'KES', 50000, 50000 + ?, ?, 'completed', 'mpesa', ?)`,
        [generateId(), ownerWallet.id, total, total, `Sales payout for ${orderNum}`, orderDate],
      )
    }

    // Insert logistics delivery record
    await execute(
      `INSERT INTO deliveries (id, tenant_id, order_id, tracking_code, status, driver_user_id, pickup_address, delivery_address, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        ctx.tenantId,
        orderId,
        `TRK-SC-${orderCount}`,
        status === 'delivered' ? 'delivered' : 'in_transit',
        ctx.ownerId,
        `${ctx.county} Landing Site`,
        `Depot Station ${orderCount % 4}, Mombasa`,
        orderDate,
      ],
    )
  }

  // 5. Seed realistic expenses
  // ~30 expenses spread over 12 months
  const expenseCategories = ['fuel', 'ice', 'maintenance', 'salary', 'misc', 'licenses']
  const expenseDescs = {
    fuel: 'Marine fuel refill for boat trip',
    ice: 'Crushed ice block purchase for catch preservation',
    maintenance: 'Engine repair and oil change',
    salary: 'Crew day-payout wage share',
    licenses: 'BMU licensing and safety inspection',
    misc: 'Harbor berthing and logistics fees',
  }
  let expCount = 0
  for (let dayOffset = 350; dayOffset >= 12; dayOffset -= 11) {
    const expDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const category = expenseCategories[expCount % expenseCategories.length]
    const amount = 3000 + Math.floor(Math.random() * 15000)
    expCount++

    await execute(
      `INSERT INTO expenses (id, tenant_id, user_id, boat_id, category, description, amount, status, expense_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)`,
      [
        generateId(),
        ctx.tenantId,
        ctx.ownerId,
        boatIds[expCount % boatIds.length],
        category,
        expenseDescs[category as keyof typeof expenseDescs] || 'Operations expense',
        amount,
        expDate,
      ],
    )
  }

  // 6. Seed license compliance issues (expired, expiring, valid)
  const lTypes = ['fishing', 'trading', 'transportation'] as const
  for (let i = 0; i < crewIds.length; i++) {
    const cId = crewIds[i]
    // 1 expired, 1 expiring in 10 days, others valid
    const daysToExpire = i === 0 ? -15 : i === 1 ? 10 : 180
    const expires = new Date(now.getTime() + daysToExpire * 24 * 60 * 60 * 1000)
    const issued = new Date(expires.getTime() - 365 * 24 * 60 * 60 * 1000)

    await execute(
      `INSERT INTO licenses (id, tenant_id, user_id, license_type, license_number, issued_date, expires_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        ctx.tenantId,
        cId,
        lTypes[i % lTypes.length],
        `LIC-SC-${i + 1}`,
        issued,
        expires,
        daysToExpire < 0 ? 'expired' : 'active',
      ],
    )
  }

  // 7. Seed comprehensive cold chain storage logs and temperature logs
  // Temperature readings: 120 readings (hourly over last 5 days) per zone
  const zones = await query<{ id: string; target_temp_c: number }>(
    `SELECT id, target_temp_c FROM storage_zones WHERE tenant_id = ?`,
    [ctx.tenantId],
  )
  for (const z of zones) {
    for (let h = 120; h >= 0; h--) {
      const readDate = new Date(now.getTime() - h * 60 * 60 * 1000)
      const target = Number(z.target_temp_c)
      // fluctuate slightly around target
      const reading = target + (Math.sin(h / 6) * 1.5) + (Math.random() * 0.5)
      const humidity = 70 + Math.floor(Math.random() * 20)

      await execute(
        `INSERT INTO temperature_readings (id, tenant_id, zone_id, facility_id, reading_c, humidity_pct, recorded_at, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'iot')`,
        [generateId(), ctx.tenantId, z.id, ctx.facilityId, reading, humidity, readDate],
      )
    }
  }

  // 8. Monthly P&L accounting entries matching the revenue/expenses
  // For each of the last 12 months, we summarize total revenue and expenses, and write journal entries
  const cashAcc = await queryOne<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE tenant_id = ? AND code = '1000'`,
    [ctx.tenantId],
  )
  const revAcc = await queryOne<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE tenant_id = ? AND code = '4000'`,
    [ctx.tenantId],
  )
  const expAcc = await queryOne<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE tenant_id = ? AND code = '5100'`,
    [ctx.tenantId],
  )

  if (cashAcc?.id && revAcc?.id && expAcc?.id) {
    for (let m = 11; m >= 0; m--) {
      const entryDate = new Date(now.getFullYear(), now.getMonth() - m, 28)
      const monthlyRev = 180000 + (Math.sin(m) * 50000) + Math.floor(Math.random() * 30000)
      const monthlyExp = 90000 + (Math.cos(m) * 20000) + Math.floor(Math.random() * 15000)

      // Revenue entry
      const rEntryId = generateId()
      await execute(
        `INSERT INTO journal_entries (id, tenant_id, entry_number, entry_date, description, reference_type, status, created_by)
         VALUES (?, ?, ?, ?, 'Monthly Sales Summary', 'manual', 'posted', ?)`,
        [rEntryId, ctx.tenantId, `JE-REV-2025-${12 - m}`, entryDate, ctx.ownerId],
      )
      await execute(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
         VALUES (?, ?, ?, ?, 0, 'Sales cash receipts')`,
        [generateId(), rEntryId, cashAcc.id, monthlyRev],
      )
      await execute(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
         VALUES (?, ?, ?, 0, ?, 'Monthly revenue recognition')`,
        [generateId(), rEntryId, revAcc.id, monthlyRev],
      )

      // Expense entry
      const eEntryId = generateId()
      await execute(
        `INSERT INTO journal_entries (id, tenant_id, entry_number, entry_date, description, reference_type, status, created_by)
         VALUES (?, ?, ?, ?, 'Monthly Operations Expense', 'manual', 'posted', ?)`,
        [eEntryId, ctx.tenantId, `JE-EXP-2025-${12 - m}`, entryDate, ctx.ownerId],
      )
      await execute(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
         VALUES (?, ?, ?, ?, 0, 'Operating expense recognition')`,
        [generateId(), eEntryId, expAcc.id, monthlyExp],
      )
      await execute(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
         VALUES (?, ?, ?, 0, ?, 'Cash disbursement')`,
        [generateId(), eEntryId, cashAcc.id, monthlyExp],
      )
    }
  }

  // 9. Seed storage records
  for (let i = 0; i < 25; i++) {
    const entryDate = new Date(now.getTime() - (30 - i) * 24 * 60 * 60 * 1000)
    const exitDate = i % 2 === 0 ? new Date(entryDate.getTime() + (2 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000) : null
    const status = exitDate ? 'removed' : i % 5 === 0 ? 'expired' : 'stored'

    await execute(
      `INSERT INTO storage_records (id, tenant_id, facility_id, species_id, quantity_kg, grade, storage_method, entry_date, exit_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        ctx.tenantId,
        ctx.facilityId,
        speciesList[i % speciesList.length],
        50 + Math.floor(Math.random() * 100),
        ['A', 'B', 'C'][i % 3],
        'iced',
        entryDate,
        exitDate,
        status,
      ],
    )
  }

  // 10. Seed beautiful storefront products with high quality Unsplash photos
  console.log('  Adding storefront showcase products with photos...')
  // Clear any existing simple products first
  await execute(`DELETE FROM product_catalog WHERE tenant_id = ?`, [ctx.tenantId])
  await execute(`DELETE FROM fish_listings WHERE tenant_id = ?`, [ctx.tenantId])

  const vendorRow = await queryOne<{ id: string }>(
    `SELECT id FROM marketplace_vendors WHERE tenant_id = ? AND user_id = ? LIMIT 1`,
    [ctx.tenantId, ctx.ownerId],
  )
  const vId = vendorRow?.id ?? generateId()

  const showcaseProducts = [
    {
      sku: 'SKU-SHOWCASE-PERCH',
      name: 'Premium Nile Perch Fillet',
      speciesId: speciesList[0],
      price: 480,
      image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
      category: 'fresh',
      unit: 'kg'
    },
    {
      sku: 'SKU-SHOWCASE-TILAPIA',
      name: 'Fresh Lake Victoria Tilapia',
      speciesId: speciesList[1],
      price: 360,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      category: 'fresh',
      unit: 'kg'
    },
    {
      sku: 'SKU-SHOWCASE-TUNA',
      name: 'Yellowfin Tuna Steaks',
      speciesId: speciesList[2],
      price: 680,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      category: 'frozen',
      unit: 'kg'
    },
    {
      sku: 'SKU-SHOWCASE-SNAPPER',
      name: 'Whole Red Snapper',
      speciesId: speciesList[1],
      price: 520,
      image: 'https://images.unsplash.com/photo-1559737607-3578909a3636?auto=format&fit=crop&w=600&q=80',
      category: 'fresh',
      unit: 'kg'
    },
    {
      sku: 'SKU-SHOWCASE-LOBSTER',
      name: 'Mombasa Rock Lobster',
      speciesId: speciesList[2],
      price: 1400,
      image: 'https://images.unsplash.com/photo-1553618551-fba689030290?auto=format&fit=crop&w=600&q=80',
      category: 'live',
      unit: 'kg'
    },
    {
      sku: 'SKU-SHOWCASE-PRAWNS',
      name: 'Jumbo Tiger Prawns',
      speciesId: speciesList[1],
      price: 950,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
      category: 'frozen',
      unit: 'kg'
    }
  ]

  for (const p of showcaseProducts) {
    const pId = generateId()
    // Insert into product catalog
    await execute(
      `INSERT INTO product_catalog (
        id, tenant_id, vendor_id, sku, name, species_id, category, unit,
        base_price, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [pId, ctx.tenantId, vId, p.sku, p.name, p.speciesId, p.category, p.unit, p.price, p.image],
    )

    // Insert into marketplace listings
    await execute(
      `INSERT INTO fish_listings (
        id, tenant_id, seller_id, species_id, fish_type, quantity_kg,
        available_quantity_kg, grade, price_per_kg, landing_site_id,
        storage_method, status, expires_at
      ) VALUES (?, ?, ?, ?, ?, 200, 200, 'A', ?, ?, 'iced', 'available', DATE_ADD(NOW(), INTERVAL 14 DAY))`,
      [generateId(), ctx.tenantId, ctx.ownerId, p.speciesId, p.name, p.price, ctx.landingSiteId],
    )
  }

  // Update storefront settings hero image
  await execute(
    `UPDATE tenant_storefront_settings 
     SET hero_image_url = 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=80'
     WHERE tenant_id = ?`,
    [ctx.tenantId],
  )

  console.log(`  ✓ Successfully seeded large showcase dataset!`)
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
  const b2bBuyerId = await ensureB2BBuyer(passwordHash)
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
      await provisionTenant(def, i, passwordHash, buyerId, b2bBuyerId, vendorUserId)
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
  console.log(`Password (all owners + buyers): ${DEMO_PASSWORD}`)
  console.log(`Shared Storefront buyer: ${BUYER_EMAIL}`)
  console.log(`Shared B2B buyer: ${B2B_BUYER_EMAIL}`)
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
