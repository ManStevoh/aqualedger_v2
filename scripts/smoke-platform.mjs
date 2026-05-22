#!/usr/bin/env node
/**
 * Post-deploy smoke checks (no auth required for core probes).
 * Usage: node scripts/smoke-platform.mjs [--base=http://localhost:3000]
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

const baseArg = process.argv.find((a) => a.startsWith('--base='))
const base = (
  baseArg?.split('=')[1] ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

let failed = 0

async function probe(name, url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(12_000) })
    const ok = res.status >= 200 && res.status < 400
    console.log(`${ok ? 'OK' : 'FAIL'}  ${name} (${res.status}) ${url}`)
    if (!ok) failed++
    return { ok, res }
  } catch (err) {
    console.log(`FAIL  ${name} — ${err instanceof Error ? err.message : err}`)
    failed++
    return { ok: false, res: null }
  }
}

console.log(`AquaERP smoke — ${base}\n`)

await probe('Health', `${base}/api/health`)
await probe('Platform status (public)', `${base}/api/public/platform/status`)

const { ok: resolveOk, res: resolveRes } = await probe(
  'Resolve host (internal)',
  `${base}/api/internal/resolve-host?host=localhost`,
)
if (resolveOk && resolveRes) {
  try {
    const json = await resolveRes.json()
    if (json.tenantId !== null && json.tenantId !== undefined) {
      console.log('      unexpected tenant on localhost (expected null)')
      failed++
    }
  } catch {
    /* ignore */
  }
}

const cronSecret = process.env.CRON_SECRET
if (cronSecret) {
  const { ok, res } = await probe('Export cron (dry)', `${base}/api/v2/platform/exports/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-cron-secret': cronSecret },
    body: JSON.stringify({ limit: 1 }),
  })
  if (ok && res) {
    try {
      const json = await res.json()
      console.log(`      processed: ${json.data?.processed ?? 'n/a'}`)
    } catch {
      /* ignore */
    }
  }
} else {
  console.log('SKIP  Export cron — set CRON_SECRET in .env (npm run setup:cron)')
}

console.log('')
if (failed) {
  console.error(`${failed} check(s) failed. Is the app running? (npm run dev)`)
  process.exit(1)
}
console.log('Smoke checks passed.')
