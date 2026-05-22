#!/usr/bin/env node
/**
 * Preflight for Playwright E2E — health, demo login, optional Chromium.
 * Usage: node scripts/preflight-e2e.mjs [--base=http://localhost:3000]
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const baseArg = process.argv.find((a) => a.startsWith('--base='))
const base = (
  baseArg?.split('=')[1] ||
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

let failed = 0

async function check(name, fn) {
  try {
    const ok = await fn()
    console.log(`${ok ? 'OK' : 'FAIL'}  ${name}`)
    if (!ok) failed++
  } catch (err) {
    console.log(`FAIL  ${name} — ${err instanceof Error ? err.message : err}`)
    failed++
  }
}

console.log(`E2E preflight — ${base}\n`)

await check('GET /api/health (app reachable)', async () => {
  const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(30_000) })
  if (res.status === 200) return true
  if (res.status === 503) {
    const json = await res.json().catch(() => ({}))
    const db = json?.services?.database?.status
    console.log(`      App up but database: ${db || 'disconnected'} — start MySQL (see docs/LOCAL_DEV_QUICKSTART.md)`)
    return false
  }
  return false
})

await check('Demo owner login', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner-coastfish@demo.aquaerp.local',
      password: 'Demo@123',
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) return false
  const json = await res.json()
  return Boolean(json.success && !json.mfaRequired)
})

const chromiumPaths = [
  path.join(root, 'node_modules', 'playwright-core', '.local-browsers'),
  path.join(process.env.LOCALAPPDATA || '', 'ms-playwright'),
]
const hasBrowser = chromiumPaths.some((p) => existsSync(p))
if (hasBrowser) {
  console.log('OK   Playwright browser cache found')
} else {
  console.log('WARN Playwright Chromium not installed — run: npx playwright install chromium')
}

console.log('')
if (failed) {
  console.error(`${failed} check(s) failed.`)
  console.error('  1. Start MySQL and run: npm run db:seed:demo')
  console.error('  2. Start app: npm run dev')
  console.error('  3. Install browser: npx playwright install chromium')
  process.exit(1)
}
console.log('E2E preflight passed. Run: npm run test:e2e')
