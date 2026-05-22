import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const file of ['.env.local', '.env']) {
  const p = path.join(root, file)
  if (!fs.existsSync(p)) continue
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  console.log('Env file:', file)
  break
}

const dbName = process.env.DB_NAME || 'aquaerp_operating'
const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
})

const [[{ tables }]] = await conn.query(
  'SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema = ?',
  [dbName],
)
console.log('Database:', dbName, 'tables:', tables)

for (const table of ['users', 'tenants', 'platform_module_flags']) {
  try {
    const [[row]] = await conn.query(`SELECT COUNT(*) AS c FROM \`${table}\``)
    console.log(`  ${table}:`, row.c, 'rows')
  } catch (e) {
    console.log(`  ${table}: MISSING -`, e.message)
  }
}

await conn.end()
