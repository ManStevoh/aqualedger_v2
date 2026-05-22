#!/usr/bin/env node
/**
 * Run due scheduled analytics reports (all tenants) via cron API.
 * Requires CRON_SECRET and APP_URL (or NEXT_PUBLIC_APP_URL) in .env
 *
 * Usage: npm run reports:process
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(root, file)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
}

loadEnv()

const baseUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('Set CRON_SECRET in .env to run scheduled reports from cron.')
  process.exit(1)
}

const url = `${baseUrl.replace(/\/$/, '')}/api/v2/platform/reports/run-scheduled`

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cron-secret': secret,
  },
  body: '{}',
})

const json = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error('Scheduled reports failed:', res.status, json.error || json)
  process.exit(1)
}

const processed = json.data?.processed ?? 0
const failed = (json.data?.results ?? []).filter((r) => !r.ok).length
console.log(`Ran ${processed} scheduled report(s).${failed ? ` ${failed} failed.` : ''}`)
