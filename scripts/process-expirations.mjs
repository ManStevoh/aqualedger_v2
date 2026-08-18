#!/usr/bin/env node
/**
 * Automated cron worker script to check and process expired trials, grace periods,
 * and subscription period boundaries across all tenants.
 *
 * Usage: node scripts/process-expirations.mjs
 */
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
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
  const host = process.env.DB_HOST || 'localhost'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''

  const conn = await mysql.createConnection({ host, port, user, password, database: dbName })

  console.log(`[Subscription Expiry Processor] Starting audit for database: ${dbName}`)

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  // 1. Process Expired Trials (where trial_ends_at < NOW or created_at < 14 days ago without trial_ends_at set)
  const [expiredTrials] = await conn.query(
    `SELECT id, name, slug, created_at, trial_ends_at
     FROM tenants
     WHERE plan = 'trial'
       AND status = 'active'
       AND (
         (trial_ends_at IS NOT NULL AND trial_ends_at <= ?)
         OR (trial_ends_at IS NULL AND created_at <= DATE_SUB(?, INTERVAL 14 DAY))
       )`,
    [now, now],
  )

  const trialRows = expiredTrials
  console.log(`Found ${trialRows.length} expired trial(s)`)

  for (const t of trialRows) {
    console.log(`[Trial Expired] Suspending tenant ${t.name} (${t.slug})`)
    await conn.query(
      `UPDATE tenants SET status = 'suspended', updated_at = NOW() WHERE id = ?`,
      [t.id],
    )
  }

  // 2. Process Expired Grace Periods (where grace_period_ends_at < NOW)
  const [expiredGrace] = await conn.query(
    `SELECT id, name, slug
     FROM tenants
     WHERE grace_period_ends_at IS NOT NULL
       AND grace_period_ends_at <= ?
       AND status != 'suspended'`,
    [now],
  )

  const graceRows = expiredGrace
  console.log(`Found ${graceRows.length} expired grace period tenant(s)`)

  for (const t of graceRows) {
    console.log(`[Grace Period Expired] Suspending tenant ${t.name} (${t.slug})`)
    await conn.query(
      `UPDATE tenants SET status = 'suspended', updated_at = NOW() WHERE id = ?`,
      [t.id],
    )
  }

  await conn.end()
  console.log('[Subscription Expiry Processor] Finished successfully.')
}

main().catch((err) => {
  console.error('[Subscription Expiry Processor Failed]', err)
  process.exit(1)
})
