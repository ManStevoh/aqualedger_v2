/**
 * Run SQL migrations using mysql2 + .env DB settings (DB_NAME).
 * Usage: node scripts/run-migrations.mjs
 */
import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

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

loadEnv()

const LEGACY_DB_NAMES = ['aqualedger32', 'aqualedger']

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
]

async function main() {
  const dbName = process.env.DB_NAME || 'aquaerp_operating'
  const host = process.env.DB_HOST || 'localhost'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''

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
  await admin.end()

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: dbName,
    multipleStatements: true,
  })

  console.log('Using database:', dbName)

  for (const rel of migrations) {
    const file = path.join(root, rel)
    if (!fs.existsSync(file)) {
      console.warn('Skip missing:', rel)
      continue
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
        msg.includes('Duplicate key')
      ) {
        console.warn('Skip/warn:', rel, '-', msg.slice(0, 160))
      } else {
        throw e
      }
    }
  }

  await conn.end()
  console.log('Migrations complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
