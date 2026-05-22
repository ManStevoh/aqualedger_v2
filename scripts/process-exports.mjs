#!/usr/bin/env node
/**
 * Process pending GDPR export jobs via cron API.
 * Requires CRON_SECRET and APP_URL (or NEXT_PUBLIC_APP_URL) in .env
 *
 * Usage: node scripts/process-exports.mjs [--limit=10]
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

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

const cronUrl = `${url}?limit=${limit}`
const res = await fetch(cronUrl, {
  method: 'GET',
  headers: { Authorization: `Bearer ${secret}` },
})

const json = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error('Export process failed:', res.status, json.error || json)
  process.exit(1)
}

console.log(`Processed ${json.data?.processed ?? 0} export job(s).`)
