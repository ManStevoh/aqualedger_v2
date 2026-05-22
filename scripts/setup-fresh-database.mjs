/**
 * Create a fresh MySQL database and apply schema + all migrations.
 * Uses DB_NAME from .env.local / .env (default: aquaerp_operating).
 *
 * Usage:
 *   node scripts/setup-fresh-database.mjs
 *   node scripts/setup-fresh-database.mjs --name=my_custom_db
 */
import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const DEFAULT_DB = 'aquaerp_operating'
const LEGACY_DB_NAMES = ['aqualedger32', 'aqualedger']

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(root, file)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
    break
  }
}

function rewriteSqlForDb(sql, dbName) {
  let out = sql
  for (const legacy of LEGACY_DB_NAMES) {
    out = out.replace(new RegExp(`USE\\s+${legacy}\\s*;`, 'gi'), `USE ${dbName};`)
  }
  if (!/^\s*USE\s+/im.test(out)) {
    out = `USE ${dbName};\n\n${out}`
  }
  return out
}

const migrations = [
  'database/migrations/20260516_audit_logs.sql',
  'database/migrations/20260520_multi_tenant_foundation.sql',
  'database/migrations/20260522_erp_modules.sql',
  'database/migrations/20260523_production_enhancements.sql',
  'database/migrations/20260524_tenant_id_legacy.sql',
  'database/migrations/20260525_enterprise_complete.sql',
  'database/migrations/20260526_enterprise_pending.sql',
  'database/migrations/20260527_ecommerce_storefront_themes.sql',
  'database/migrations/20260528_enterprise_final.sql',
  'database/migrations/20260529_reporting_delivery.sql',
  'database/migrations/20260530_industry_gaps.sql',
  'database/migrations/20260531_enterprise_enhancements.sql',
  'database/migrations/20260601_accounting_hr_enterprise.sql',
  'database/migrations/20260602_reporting_communication.sql',
  'database/migrations/20260603_hardware_iot.sql',
  'database/migrations/20260604_default_chart_of_accounts.sql',
  'database/migrations/20260605_ai_enablement.sql',
  'database/migrations/20260606_vertical_modules.sql',
  'database/migrations/20260607_platform_module_flags.sql',
  'database/migrations/20260608_platform_settings.sql',
  'database/migrations/20260609_platform_recaptcha.sql',
  'database/migrations/20260610_boats_tenant_fixup.sql',
  'database/migrations/20260611_wallets_tenant_backfill.sql',
  'database/migrations/20260612_suggested_features.sql',
  'database/migrations/20260613_platform_branding.sql',
  'database/migrations/20260614_product_catalog_vendor.sql',
  'database/migrations/20260615_tenant_role_permissions.sql',
  'database/migrations/20260616_tenant_module_flags.sql',
  'database/migrations/20260617_platform_payments_pass.sql',
]

async function runSqlFile(conn, rel, dbName) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    console.warn('Skip missing:', rel)
    return
  }
  console.log('Running', rel, '...')
  const sql = rewriteSqlForDb(fs.readFileSync(file, 'utf8'), dbName)
  try {
    await conn.query(sql)
    console.log('OK', rel)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (
      msg.includes('Duplicate column') ||
      msg.includes('already exists') ||
      msg.includes('errno: 150') ||
      msg.includes('Duplicate key') ||
      msg.includes('Duplicate entry')
    ) {
      console.warn('Skip/warn:', rel, '-', msg.slice(0, 200))
    } else {
      throw e
    }
  }
}

async function main() {
  loadEnv()

  const nameArg = process.argv.find((a) => a.startsWith('--name='))
  const dbName = nameArg ? nameArg.split('=')[1] : process.env.DB_NAME || DEFAULT_DB

  const host = process.env.DB_HOST || 'localhost'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''

  console.log(`Creating database: ${dbName}`)
  const admin = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  })

  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  console.log('Database ready:', dbName)

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: dbName,
    multipleStatements: true,
  })

  await runSqlFile(conn, 'database/schema.sql', dbName)

  for (const rel of migrations) {
    await runSqlFile(conn, rel, dbName)
  }

  await conn.end()
  await admin.end()

  console.log('')
  console.log('Setup complete.')
  console.log(`  Database: ${dbName}`)
  console.log(`  Set DB_NAME=${dbName} in .env and .env.local`)
  console.log('  Default admin (from schema): admin@aqualedger.co.ke / Admin@123')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
