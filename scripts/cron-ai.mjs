#!/usr/bin/env node
/**
 * Run AI automation for all active tenants (cron).
 * Uses CRON_SECRET or AI_CRON_SECRET with x-cron-secret header.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const base = (
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

const secret = process.env.AI_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim()
if (!secret) {
  console.error('Set CRON_SECRET or AI_CRON_SECRET in .env')
  process.exit(1)
}

const res = await fetch(`${base}/api/v2/ai/automation/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cron-secret': secret,
    'x-aquaerp-cron-secret': secret,
  },
  body: '{}',
})

const text = await res.text()
if (!res.ok) {
  console.error('AI cron failed:', res.status, text.slice(0, 500))
  process.exit(1)
}

try {
  const json = JSON.parse(text)
  const n = json.data?.results?.length ?? json.data?.processed ?? '?'
  console.log(`AI automation OK — tenants processed: ${n}`)
} catch {
  console.log('AI automation OK')
}
