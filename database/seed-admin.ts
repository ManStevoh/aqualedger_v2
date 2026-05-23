/**
 * One-off: ensure a platform super admin exists.
 *
 * Run with: npx ts-node database/seed-admin.ts
 */
import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aqualedger32',
}

async function seedAdmin() {
  const connection = await mysql.createConnection(config)
  try {
    const email = 'admin@aqualedger.co.ke'
    const passwordHash = await bcrypt.hash('Admin@123', 12)

    const [[existing]] = (await connection.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [
      email,
    ])) as [{ id: string }[], unknown]

    const id = existing?.id || randomUUID()

    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
       VALUES (?, ?, ?, 'Platform', 'Admin', 'super_admin', 'active', TRUE)`,
      [id, email, passwordHash],
    )

    await connection.execute(
      `INSERT IGNORE INTO wallets (id, user_id, balance, currency, status)
       VALUES (?, ?, 0, 'KES', 'active')`,
      [randomUUID(), id],
    )

    await connection.execute(
      `INSERT IGNORE INTO credit_scores (id, user_id, score, grade)
       VALUES (?, ?, 700, 'A')`,
      [randomUUID(), id],
    )

    console.log('✅ Super admin ensured.')
    console.log('  email:', email)
    console.log('  password: Admin@123')

    // --- Ensure Platform Investor exists ---
    const investorEmail = 'investor@test.com'
    const [[existingInvestor]] = (await connection.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [
      investorEmail,
    ])) as [{ id: string }[], unknown]

    const investorId = existingInvestor?.id || randomUUID()
    const investorPasswordHash = await bcrypt.hash('Test@123', 12)

    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
       VALUES (?, ?, ?, 'John', 'Investor', 'investor', 'active', TRUE)`,
      [investorId, investorEmail, investorPasswordHash],
    )

    await connection.execute(
      `INSERT IGNORE INTO wallets (id, user_id, balance, currency, status)
       VALUES (?, ?, 150000, 'KES', 'active')`,
      [randomUUID(), investorId],
    )

    await connection.execute(
      `INSERT IGNORE INTO credit_scores (id, user_id, score, grade)
       VALUES (?, ?, 750, 'A')`,
      [randomUUID(), investorId],
    )

    console.log('✅ Platform Investor ensured.')
    console.log('  email:', investorEmail)
    console.log('  password: Test@123')
  } finally {
    await connection.end()
  }
}

seedAdmin().catch((e) => {
  console.error('❌ seed-admin failed:', e)
  process.exitCode = 1
})

