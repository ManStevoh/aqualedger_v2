#!/usr/bin/env node
/**
 * Wait until MySQL accepts connections (for docker compose startup).
 * Usage: node scripts/wait-for-mysql.mjs [--timeout=120]
 */
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const timeoutArg = process.argv.find((a) => a.startsWith('--timeout='))
const timeoutSec = parseInt(timeoutArg?.split('=')[1] || '120', 10)
const deadline = Date.now() + timeoutSec * 1000

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
}

async function ping() {
  const conn = await mysql.createConnection(config)
  await conn.ping()
  await conn.end()
}

console.log(`Waiting for MySQL at ${config.host}:${config.port} (max ${timeoutSec}s)…`)

while (Date.now() < deadline) {
  try {
    await ping()
    console.log('OK   MySQL is ready')
    process.exit(0)
  } catch {
    await new Promise((r) => setTimeout(r, 2000))
  }
}

console.error('FAIL MySQL did not become ready in time')
console.error('  Set DB_PASSWORD=root in .env if using docker-compose.yml')
process.exit(1)
