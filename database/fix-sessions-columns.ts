/**
 * One-off DB fix: ensure sessions.ip_address + sessions.user_agent exist.
 *
 * Run with: npx ts-node database/fix-sessions-columns.ts
 */
import 'dotenv/config'
import mysql from 'mysql2/promise'

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aqualedger32',
}

async function main() {
  const connection = await mysql.createConnection(config)
  try {
    const [rows] = (await connection.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'sessions'
         AND COLUMN_NAME IN ('ip_address', 'user_agent')`,
      [config.database],
    )) as [{ COLUMN_NAME: string }[], unknown]

    const existing = new Set(rows.map((r) => r.COLUMN_NAME))

    if (!existing.has('ip_address')) {
      await connection.execute(`ALTER TABLE sessions ADD COLUMN ip_address VARCHAR(45) NULL`)
      console.log('✅ Added sessions.ip_address')
    } else {
      console.log('ℹ️ sessions.ip_address already exists')
    }

    if (!existing.has('user_agent')) {
      await connection.execute(`ALTER TABLE sessions ADD COLUMN user_agent TEXT NULL`)
      console.log('✅ Added sessions.user_agent')
    } else {
      console.log('ℹ️ sessions.user_agent already exists')
    }
  } finally {
    await connection.end()
  }
}

main().catch((e) => {
  console.error('❌ fix-sessions-columns failed:', e)
  process.exitCode = 1
})

