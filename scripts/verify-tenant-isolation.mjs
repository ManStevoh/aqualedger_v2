/**
 * Audit tenant_id columns and orphan rows on legacy operational tables.
 * Usage: node scripts/verify-tenant-isolation.mjs
 */
import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const TABLES = [
  'boats',
  'fishing_trips',
  'catches',
  'fish_listings',
  'orders',
  'expenses',
  'wallets',
  'storage_facilities',
  'bmu',
  'licenses',
]

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

async function main() {
  const dbName = process.env.DB_NAME || 'aquaerp_operating'
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  })

  console.log('Tenant isolation audit:', dbName)
  let failed = false

  for (const table of TABLES) {
    const [exists] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
      [dbName, table],
    )
    if (!exists[0]?.c) {
      console.warn(`  SKIP ${table} (table missing)`)
      continue
    }

    const [col] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ? AND column_name = 'tenant_id'`,
      [dbName, table],
    )
    if (!col[0]?.c) {
      console.error(`  FAIL ${table}: no tenant_id column`)
      failed = true
      continue
    }

    const [nulls] = await conn.query(
      `SELECT COUNT(*) AS c FROM \`${table}\` WHERE tenant_id IS NULL OR TRIM(tenant_id) = ''`,
    )
    const nullCount = Number(nulls[0]?.c ?? 0)
    if (nullCount > 0) {
      console.error(`  FAIL ${table}: ${nullCount} row(s) without tenant_id`)
      failed = true
    } else {
      const [total] = await conn.query(`SELECT COUNT(*) AS c FROM \`${table}\``)
      console.log(`  OK   ${table}: ${total[0]?.c ?? 0} rows, all scoped`)
    }
  }

  const [orphanTrips] = await conn.query(
    `SELECT COUNT(*) AS c FROM fishing_trips t
     LEFT JOIN boats b ON b.id = t.boat_id
     WHERE t.tenant_id IS NOT NULL AND b.id IS NOT NULL AND t.tenant_id != b.tenant_id`,
  )
  if (Number(orphanTrips[0]?.c) > 0) {
    console.error(`  FAIL fishing_trips: ${orphanTrips[0].c} trip(s) tenant mismatch vs boat`)
    failed = true
  }

  const [orphanCatches] = await conn.query(
    `SELECT COUNT(*) AS c FROM catches c
     LEFT JOIN fishing_trips t ON t.id = c.trip_id
     WHERE c.tenant_id IS NOT NULL AND t.id IS NOT NULL AND c.tenant_id != t.tenant_id`,
  )
  if (Number(orphanCatches[0]?.c) > 0) {
    console.error(`  FAIL catches: ${orphanCatches[0].c} catch(es) tenant mismatch vs trip`)
    failed = true
  }

  await conn.end()
  if (failed) {
    console.error('\nRun: node scripts/run-migrations.mjs (through 20260524 + 20260610_boats_tenant_fixup)')
    process.exit(1)
  }
  console.log('\nTenant isolation audit passed.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
