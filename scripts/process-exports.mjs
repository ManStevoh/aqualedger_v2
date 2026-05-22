#!/usr/bin/env node
/**
 * Process pending GDPR export jobs via cron API.
 * Requires CRON_SECRET and APP_URL (or NEXT_PUBLIC_APP_URL) in .env
 *
 * Usage: node scripts/process-exports.mjs [--limit=10]
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

const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : 10

const baseUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('Set CRON_SECRET in .env to run export processing from cron.')
  process.exit(1)
}

const url = `${baseUrl.replace(/\/$/, '')}/api/v2/platform/exports/process`

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cron-secret': secret,
  },
  body: JSON.stringify({ limit }),
})

const json = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error('Export process failed:', res.status, json.error || json)
  process.exit(1)
}

console.log(`Processed ${json.data?.processed ?? 0} export job(s).`)
