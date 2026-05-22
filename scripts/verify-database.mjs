/**
 * Verify boats table and tenant_id for multi-tenant ops.
 * Usage: node scripts/verify-database.mjs
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

async function main() {
  const dbName = process.env.DB_NAME || 'aquaerp_operating'
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  })

  console.log('Database:', dbName)

  const [tables] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = 'boats'`,
    [dbName],
  )
  if (!tables[0]?.c) {
    console.error('FAIL: boats table missing — run schema.sql + migrations')
    process.exit(1)
  }

  const [engine] = await conn.query(
    `SELECT ENGINE FROM information_schema.tables WHERE table_schema = ? AND table_name = 'boats'`,
    [dbName],
  )
  console.log('boats ENGINE:', engine[0]?.ENGINE)
  if (engine[0]?.ENGINE !== 'InnoDB') {
    console.error('FAIL: boats must be InnoDB — run 20260610_boats_tenant_fixup.sql')
    process.exit(1)
  }

  const [cols] = await conn.query(
    `SELECT COLUMN_NAME, IS_NULLABLE FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'boats' AND column_name = 'tenant_id'`,
    [dbName],
  )
  if (!cols.length) {
    console.error('FAIL: boats.tenant_id missing')
    process.exit(1)
  }
  console.log('boats.tenant_id:', cols[0].IS_NULLABLE === 'NO' ? 'NOT NULL OK' : 'NULL (run fixup migration)')

  const [uk] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = 'boats' AND index_name = 'uk_tenant_registration'`,
    [dbName],
  )
  console.log('uk_tenant_registration:', uk[0]?.c ? 'OK' : 'MISSING')

  const [tenants] = await conn.query(`SELECT COUNT(*) AS c FROM tenants`)
  console.log('tenants:', tenants[0]?.c)

  await conn.end()
  console.log('Verify complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
