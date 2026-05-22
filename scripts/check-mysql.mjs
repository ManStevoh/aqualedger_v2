#!/usr/bin/env node
/**
 * Quick MySQL connectivity check using .env credentials.
 * Usage: node scripts/check-mysql.mjs
 */
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aquaerp_operating',
}

console.log(`MySQL check — ${config.user}@${config.host}:${config.port}/${config.database}\n`)

try {
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  })
  await conn.ping()
  const [rows] = await conn.query('SELECT VERSION() AS v')
  console.log('OK   Connected —', rows[0]?.v)
  try {
    await conn.changeUser({ database: config.database })
    const [tables] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ?`,
      [config.database],
    )
    console.log(`OK   Database "${config.database}" — ${tables[0]?.c ?? 0} tables`)
  } catch {
    console.log(`WARN Database "${config.database}" not found — run: npm run db:setup`)
  }
  await conn.end()
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.log('FAIL', msg)
  console.log('\nNext steps:')
  console.log('  • Install Docker Desktop, then: npm run db:docker:up')
  console.log('  • Or start XAMPP/Laragon/MySQL service on port 3306')
  console.log('  • Set DB_PASSWORD in .env (docker default: root)')
  console.log('  • See docs/LOCAL_DEV_QUICKSTART.md')
  process.exit(1)
}
