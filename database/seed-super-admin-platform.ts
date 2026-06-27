/**
 * Platform-level seed data for super-admin dashboards:
 * settings, module flags, payment intents, audit trail, plan/status mix, staff users.
 *
 * Requires demo tenants (run db:seed:demo first, or use db:seed:super-admin).
 *
 *   npm run db:seed:platform
 *   npm run db:seed:platform -- --fresh
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { execute, generateId, getPool, query, queryOne } from '@/lib/db'
import type { AuditAction } from '@/lib/audit'
import { ERP_MODULES, type ModuleId } from '@/lib/platform/modules'

const SEED_TAG = 'super-admin-platform'
const SUPER_ADMIN_EMAIL = 'admin@aqualedger.co.ke'
const SUPER_ADMIN_PASSWORD = 'Admin@123'

const DEMO_SLUGS = [
  'coastfish',
  'lamusea',
  'aquaerp-demo',
] as const

const PLAN_ASSIGNMENTS: Record<string, { plan: string; status: string }> = {
  coastfish: { plan: 'enterprise', status: 'active' },
  lamusea: { plan: 'trial', status: 'pending' },
  'aquaerp-demo': { plan: 'enterprise', status: 'active' },
}

// Platform staff removed to keep exactly 5 clean users.

async function ensureSuperAdmin(passwordHash: string): Promise<string> {
  const existing = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email = ?`, [SUPER_ADMIN_EMAIL])
  const id = existing?.id ?? generateId()

  await execute(
    `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
     VALUES (?, ?, ?, 'Platform', 'Admin', 'super_admin', 'active', TRUE)`,
    [id, SUPER_ADMIN_EMAIL, passwordHash],
  )

  const wallet = await queryOne<{ id: string }>(`SELECT id FROM wallets WHERE user_id = ? LIMIT 1`, [id])
  if (!wallet) {
    await execute(
      `INSERT IGNORE INTO wallets (id, tenant_id, user_id, balance, currency, status) VALUES (?, 'tenant-default-0001', ?, 0, 'KES', 'active')`,
      [generateId(), id],
    )
  }

  const credit = await queryOne<{ id: string }>(`SELECT id FROM credit_scores WHERE user_id = ? LIMIT 1`, [id])
  if (!credit) {
    await execute(
      `INSERT INTO credit_scores (id, user_id, score, grade) VALUES (?, ?, 700, 'A')`,
      [generateId(), id],
    )
  }

  return id
}

async function ensureDemoSuperUser(passwordHash: string): Promise<void> {
  const email = 'demo@aqualedger.co.ke'
  const existing = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email = ?`, [email])
  const id = existing?.id ?? generateId()

  await execute(
    `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
     VALUES (?, ?, ?, 'Demo', 'SuperUser', 'super_admin', 'active', TRUE)`,
    [id, email, passwordHash],
  )

  const tenant = await queryOne<{ id: string }>(`SELECT id FROM tenants WHERE slug = 'aquaerp-demo'`)
  const tenantId = tenant?.id || 'tenant-default-0001'

  const wallet = await queryOne<{ id: string }>(`SELECT id FROM wallets WHERE user_id = ? LIMIT 1`, [id])
  if (!wallet) {
    await execute(
      `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status) VALUES (?, ?, ?, 100000, 'KES', 'active')`,
      [generateId(), tenantId, id],
    )
  }

  const credit = await queryOne<{ id: string }>(`SELECT id FROM credit_scores WHERE user_id = ? LIMIT 1`, [id])
  if (!credit) {
    await execute(
      `INSERT INTO credit_scores (id, user_id, score, grade) VALUES (?, ?, 800, 'A')`,
      [generateId(), id],
    )
  }

  // Link to 'aquaerp-demo' tenant as tenant_owner
  if (tenant) {
    await execute(
      `INSERT IGNORE INTO tenant_members (id, tenant_id, user_id, role, status)
       VALUES (?, ?, ?, 'tenant_owner', 'active')`,
      [generateId(), tenant.id, id]
    )
  }
}

async function ensurePlatformSettings(adminId: string): Promise<void> {
  const settings: Array<{ key: string; value: Record<string, unknown> }> = [
    {
      key: 'maintenance',
      value: { enabled: false, message: 'Scheduled maintenance completed. All systems operational.' },
    },
    { key: 'signup', value: { locked: false } },
    {
      key: 'announcement',
      value: {
        enabled: false,
        title: 'AquaERP platform demo',
        body: '20 demo tenants are loaded with full module data. Super admins can manage tenants, payments, and branding from Admin Hub.',
      },
    },
    {
      key: 'branding',
      value: {
        logo_url: '',
        primary_color: '#0d9488',
        app_name: 'AquaERP Fisheries OS',
      },
    },
  ]

  for (const s of settings) {
    await execute(
      `INSERT INTO platform_settings (setting_key, setting_value, updated_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()`,
      [s.key, JSON.stringify(s.value), adminId],
    )
  }
}

async function syncModuleFlags(adminId: string): Promise<void> {
  for (const mod of ERP_MODULES) {
    await execute(
      `INSERT INTO platform_module_flags (module_id, enabled, updated_by)
       VALUES (?, 1, ?)
       ON DUPLICATE KEY UPDATE enabled = 1, updated_by = VALUES(updated_by)`,
      [mod.id as ModuleId, adminId],
    )
  }
}

// ensurePlatformStaff removed

async function assignTenantPlanMix(): Promise<number> {
  let updated = 0
  for (const slug of DEMO_SLUGS) {
    const cfg = PLAN_ASSIGNMENTS[slug]
    if (!cfg) continue
    const res = await execute(
      `UPDATE tenants SET plan = ?, status = ? WHERE slug = ?`,
      [cfg.plan, cfg.status, slug],
    )
    if (res.affectedRows) updated += Number(res.affectedRows)
  }
  return updated
}

async function clearSeededPlatformRows(): Promise<void> {
  await execute(
    `DELETE FROM payment_intents WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.seed')) = ?`,
    [SEED_TAG],
  )
  await execute(
    `DELETE FROM audit_logs WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.seed')) = ?`,
    [SEED_TAG],
  )
}

async function seedPaymentIntents(): Promise<number> {
  const tenants = await query<{ id: string; slug: string }>(
    `SELECT id, slug FROM tenants WHERE slug IN (${DEMO_SLUGS.map(() => '?').join(',')})`,
    [...DEMO_SLUGS],
  )

  let count = 0
  const statuses = ['succeeded', 'pending', 'failed', 'processing'] as const
  const providers = ['mpesa', 'mpesa', 'stripe', 'bank'] as const

  for (const tenant of tenants) {
    const orders = await query<{ id: string; total: number }>(
      `SELECT id, total FROM orders WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 4`,
      [tenant.id],
    )

    for (let i = 0; i < 4; i++) {
      const externalRef = `SEED-SA-${tenant.slug}-${i + 1}`
      const existing = await queryOne<{ id: string }>(
        `SELECT id FROM payment_intents WHERE external_ref = ?`,
        [externalRef],
      )
      if (existing) continue

      const order = orders[i]
      const amount = order ? Number(order.total) : 5000 + i * 1200
      await execute(
        `INSERT INTO payment_intents
         (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
         VALUES (?, ?, ?, ?, ?, 'KES', ?, ?, ?)`,
        [
          generateId(),
          tenant.id,
          order?.id ?? null,
          providers[i],
          amount,
          statuses[i],
          externalRef,
          JSON.stringify({ seed: SEED_TAG, slug: tenant.slug, scenario: i + 1 }),
        ],
      )
      count++
    }
  }
  return count
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(9 + (days % 8), (days * 7) % 60, 0, 0)
  return d
}

async function seedAuditTrail(adminId: string): Promise<number> {
  const tenants = await query<{ id: string; slug: string; name: string }>(
    `SELECT id, slug, name FROM tenants WHERE slug IN (${DEMO_SLUGS.map(() => '?').join(',')}) ORDER BY slug`,
    [...DEMO_SLUGS],
  )
  const owners = await query<{ id: string; email: string; tenant_id: string }>(
    `SELECT u.id, u.email, tm.tenant_id
     FROM users u
     INNER JOIN tenant_members tm ON tm.user_id = u.id
     INNER JOIN tenants t ON t.id = tm.tenant_id
     WHERE u.email LIKE 'owner-%@demo.aquaerp.local' AND t.slug IN (${DEMO_SLUGS.map(() => '?').join(',')})
     LIMIT 30`,
    [...DEMO_SLUGS],
  )

  const hasTenantCol = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'tenant_id'`,
  )
  const withTenant = Number(hasTenantCol?.cnt ?? 0) > 0

  const platformActions: Array<{
    action: AuditAction
    resourceType: string
    resourceId?: string
    tenantId?: string
    metadata: Record<string, unknown>
    daysBack: number
  }> = [
    {
      action: 'platform.tenant.provision',
      resourceType: 'tenant',
      metadata: { seed: SEED_TAG, note: 'Demo tenant batch provision' },
      daysBack: 28,
    },
    {
      action: 'platform.broadcast',
      resourceType: 'announcement',
      metadata: { seed: SEED_TAG, title: 'Platform demo loaded' },
      daysBack: 14,
    },
    {
      action: 'admin.action',
      resourceType: 'platform_settings',
      metadata: { seed: SEED_TAG, setting: 'branding' },
      daysBack: 7,
    },
    {
      action: 'admin.action',
      resourceType: 'platform_module_flags',
      metadata: { seed: SEED_TAG, enabled: 'all' },
      daysBack: 6,
    },
  ]

  let count = 0

  async function insertLog(opts: {
    userId: string | null
    tenantId?: string | null
    action: AuditAction
    resourceType: string
    resourceId?: string | null
    metadata: Record<string, unknown>
    createdAt: Date
  }): Promise<void> {
    const id = generateId()
    const meta = JSON.stringify(opts.metadata)
    if (withTenant && opts.tenantId) {
      await execute(
        `INSERT INTO audit_logs (id, user_id, tenant_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '127.0.0.1', 'seed-script', ?)`,
        [
          id,
          opts.userId,
          opts.tenantId,
          opts.action,
          opts.resourceType,
          opts.resourceId ?? null,
          meta,
          opts.createdAt,
        ],
      )
    } else if (withTenant) {
      await execute(
        `INSERT INTO audit_logs (id, user_id, tenant_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
         VALUES (?, ?, NULL, ?, ?, ?, ?, '127.0.0.1', 'seed-script', ?)`,
        [
          id,
          opts.userId,
          opts.action,
          opts.resourceType,
          opts.resourceId ?? null,
          meta,
          opts.createdAt,
        ],
      )
    } else {
      await execute(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, '127.0.0.1', 'seed-script', ?)`,
        [
          id,
          opts.userId,
          opts.action,
          opts.resourceType,
          opts.resourceId ?? null,
          meta,
          opts.createdAt,
        ],
      )
    }
    count++
  }

  for (const pa of platformActions) {
    const tenant = tenants[0]
    await insertLog({
      userId: adminId,
      tenantId: pa.tenantId ?? tenant?.id ?? null,
      action: pa.action,
      resourceType: pa.resourceType,
      resourceId: tenant?.id,
      metadata: pa.metadata,
      createdAt: daysAgo(pa.daysBack),
    })
  }

  for (let i = 0; i < Math.min(6, tenants.length); i++) {
    const t = tenants[i]
    await insertLog({
      userId: adminId,
      tenantId: t.id,
      action: 'platform.impersonate.start',
      resourceType: 'tenant',
      resourceId: t.id,
      metadata: { seed: SEED_TAG, slug: t.slug, impersonatedAs: 'owner' },
      createdAt: daysAgo(20 - i),
    })
    await insertLog({
      userId: adminId,
      tenantId: t.id,
      action: 'platform.impersonate.end',
      resourceType: 'tenant',
      resourceId: t.id,
      metadata: { seed: SEED_TAG, slug: t.slug },
      createdAt: daysAgo(20 - i),
    })
  }

  for (let i = 0; i < owners.length; i++) {
    const o = owners[i]
    await insertLog({
      userId: o.id,
      tenantId: o.tenant_id,
      action: 'auth.login',
      resourceType: 'session',
      metadata: { seed: SEED_TAG, email: o.email },
      createdAt: daysAgo(12 - (i % 12)),
    })
  }

  for (let i = 0; i < Math.min(15, tenants.length); i++) {
    const t = tenants[i]
    const owner = owners.find((o) => o.tenant_id === t.id)
    await insertLog({
      userId: owner?.id ?? adminId,
      tenantId: t.id,
      action: 'user.update',
      resourceType: 'tenant_settings',
      resourceId: t.id,
      metadata: { seed: SEED_TAG, field: 'storefront' },
      createdAt: daysAgo(5 - (i % 5)),
    })
  }

  await insertLog({
    userId: adminId,
    action: 'auth.login',
    resourceType: 'session',
    metadata: { seed: SEED_TAG, email: SUPER_ADMIN_EMAIL },
    createdAt: daysAgo(1),
  })

  return count
}

async function backfillSignupActivity(): Promise<void> {
  const demoOwners = await query<{ id: string }>(
    `SELECT id FROM users WHERE email LIKE 'owner-%@demo.aquaerp.local' ORDER BY email LIMIT 20`,
  )
  for (let i = 0; i < demoOwners.length; i++) {
    await execute(`UPDATE users SET created_at = ? WHERE id = ?`, [daysAgo(13 - (i % 14)), demoOwners[i].id])
  }
}

async function main(): Promise<void> {
  const fresh = process.argv.includes('--fresh')
  console.log('🛡️  Super-admin platform seed')
  console.log(`   Mode: ${fresh ? 'fresh (clear prior platform seed rows)' : 'incremental'}`)
  console.log('')

  const tenantCount = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM tenants WHERE slug IN (${DEMO_SLUGS.map(() => '?').join(',')})`,
    [...DEMO_SLUGS],
  )
  if (Number(tenantCount?.cnt ?? 0) < DEMO_SLUGS.length) {
    console.error(`❌ Fewer than ${DEMO_SLUGS.length} demo tenants found. Run: npm run db:seed:demo  (or db:seed:super-admin)`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12)
  const adminId = await ensureSuperAdmin(passwordHash)

  if (fresh) {
    console.log('Clearing prior platform seed rows…')
    await clearSeededPlatformRows()
  }

  await ensurePlatformSettings(adminId)
  await syncModuleFlags(adminId)
  const plansUpdated = await assignTenantPlanMix()
  const payments = await seedPaymentIntents()
  const audits = await seedAuditTrail(adminId)
  await backfillSignupActivity()

  // Structurally purge Default Organization from the database
  console.log('Purging Default Organization structurally from the database…')
  await execute(`SET FOREIGN_KEY_CHECKS = 0`)
  await execute(`DELETE FROM tenants WHERE id = 'tenant-default-0001' OR slug = 'default'`)
  await execute(`SET FOREIGN_KEY_CHECKS = 1`)

  await ensureDemoSuperUser(await bcrypt.hash('Demo@123', 12))

  console.log('')
  console.log('✅ Platform seed complete')
  console.log('')
  console.log('Super Admin Logins:')
  console.log(`  1. Standard: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`)
  console.log(`  2. Demo User: demo@aqualedger.co.ke / Demo@123 (Linked to fully-loaded 'aquaerp-demo' tenant)`)
  console.log('')
  console.log(`Tenants plan/status updated: ${plansUpdated}`)
  console.log(`Payment intents seeded: ${payments}`)
  console.log(`Audit log entries seeded: ${audits}`)
  console.log('')
  console.log('Admin hub: /dashboard/admin')

  const pool = getPool()
  await pool.end()
}

main().catch((err) => {
  console.error('❌ Platform seed failed:', err)
  process.exit(1)
})
