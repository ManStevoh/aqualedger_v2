#!/usr/bin/env node
/**
 * Cron: M-Pesa / payment reconciliation for stale intents and order sync.
 * Usage: npm run reconcile:payments
 */
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

const base =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('Set CRON_SECRET in .env to run payment reconciliation from cron.')
  process.exit(1)
}

const url = `${base.replace(/\/$/, '')}/api/v2/platform/payments/reconcile`
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
})
const json = await res.json().catch(() => ({}))
console.log(res.status, JSON.stringify(json, null, 2))
process.exit(res.ok ? 0 : 1)
