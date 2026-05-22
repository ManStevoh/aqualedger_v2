/**
 * Drop aqualedger32, recreate, and load database/schema.sql
 * Usage: node scripts/reset-and-load-schema.mjs
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
const dbName = process.env.DB_NAME || 'aquaerp_operating'

function rewriteSqlForDb(sql, targetDb) {
  let out = sql
  for (const legacy of LEGACY_DB_NAMES) {
    out = out.replace(new RegExp(`USE\\s+${legacy}\\s*;`, 'gi'), `USE ${targetDb};`)
  }
  if (!/^\s*USE\s+/im.test(out)) {
    out = `USE ${targetDb};\n\n${out}`
  }
  return out
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  console.log(`Resetting database ${dbName}...`)
  try {
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``)
    await conn.query(`CREATE DATABASE \`${dbName}\``)
    console.log('Database dropped and recreated.')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!msg.includes('ER_DB_DROP_RMDIR') && !msg.includes('Directory not empty')) throw e
    console.warn('DROP DATABASE failed; dropping all tables instead...')
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    await conn.query(`USE \`${dbName}\``)
    const [rows] = await conn.query(
      `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?`,
      [dbName],
    )
    const tables = rows.map((r) => r.name).filter(Boolean)
    if (tables.length) {
      await conn.query('SET FOREIGN_KEY_CHECKS = 0')
      await conn.query(`DROP TABLE IF EXISTS ${tables.map((t) => `\`${t}\``).join(', ')}`)
      await conn.query('SET FOREIGN_KEY_CHECKS = 1')
      console.log(`Dropped ${tables.length} tables.`)
    }
    const [[{ datadir }]] = await conn.query('SELECT @@datadir AS datadir')
    const dbDir = path.join(String(datadir).replace(/\//g, path.sep), dbName)
    if (fs.existsSync(dbDir)) {
      console.log('Removing orphan data directory:', dbDir)
      fs.rmSync(dbDir, { recursive: true, force: true })
    }
    await conn.query(`CREATE DATABASE \`${dbName}\``)
    console.log('Database recreated after filesystem cleanup.')
  }

  const schemaPath = path.join(root, 'database', 'schema.sql')
  const schemaSQL = rewriteSqlForDb(fs.readFileSync(schemaPath, 'utf8'), dbName)
  console.log('Loading database/schema.sql into', dbName, '...')
  await conn.query(schemaSQL)
  console.log('Schema loaded.')

  await conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
