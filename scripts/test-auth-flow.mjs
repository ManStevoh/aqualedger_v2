#!/usr/bin/env node
/**
 * End-to-end auth smoke: login → session cookie → /auth/me → dashboard.
 * Usage: node scripts/test-auth-flow.mjs [--base=http://localhost:3000]
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const baseArg = process.argv.find((a) => a.startsWith('--base='))
const base = (
  baseArg?.split('=')[1] ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

const accounts = [
  { label: 'Super admin', email: 'admin@aqualedger.co.ke', password: 'Admin@123', required: true },
  {
    label: 'Fisherman (seed)',
    email: 'fisherman@test.com',
    password: 'Test@123',
    required: false,
  },
]

let failed = 0

function parseCookies(setCookie) {
  if (!setCookie) return ''
  const list = Array.isArray(setCookie) ? setCookie : [setCookie]
  return list.map((c) => c.split(';')[0]).join('; ')
}

async function probe(name, url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(15_000) })
    const ok = res.status >= 200 && res.status < 400
    console.log(`${ok ? 'OK' : 'FAIL'}  ${name} (${res.status})`)
    if (!ok) failed++
    return res
  } catch (err) {
    console.log(`FAIL  ${name} — ${err instanceof Error ? err.message : err}`)
    failed++
    return null
  }
}

console.log(`Auth flow test — ${base}\n`)

for (const account of accounts) {
  console.log(`--- ${account.label} (${account.email}) ---`)
  const loginRes = await probe('POST /api/auth/login', `${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: account.email, password: account.password }),
  })
  if (!loginRes) continue

  const loginJson = await loginRes.json().catch(() => ({}))
  if (!loginRes.ok || !loginJson.success) {
    console.log(`      login error: ${loginJson.error || loginRes.status}`)
    if (account.required) failed++
    else console.log('      (optional seed account — run npm run db:seed if needed)')
    continue
  }
  if (loginJson.mfaRequired) {
    console.log('      MFA required — skip (configure test user without MFA)')
    continue
  }

  const cookie = parseCookies(loginRes.headers.getSetCookie?.() ?? loginRes.headers.get('set-cookie'))
  if (!cookie.includes('access_token=')) {
    console.log('FAIL  No access_token Set-Cookie on login')
    failed++
    continue
  }

  const meRes = await probe('GET /api/auth/me', `${base}/api/auth/me`, {
    headers: { Cookie: cookie },
  })
  if (meRes) {
    const meJson = await meRes.json().catch(() => ({}))
    if (meRes.ok && meJson.success) {
      console.log(`      user: ${meJson.data?.user?.email} (${meJson.data?.user?.role})`)
    } else {
      console.log(`      me error: ${meJson.error || meRes.status}`)
    }
  }

  const dashRes = await fetch(`${base}/dashboard`, {
    redirect: 'manual',
    headers: { Cookie: cookie },
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null)

  if (!dashRes) {
    console.log('FAIL  GET /dashboard')
    failed++
  } else if (dashRes.status === 307 || dashRes.status === 308) {
    const loc = dashRes.headers.get('location') || ''
    if (loc.includes('/login')) {
      console.log(`FAIL  Dashboard redirected to login (${loc})`)
      failed++
    } else {
      console.log(`OK   GET /dashboard redirect (${dashRes.status}) → ${loc}`)
    }
  } else if (dashRes.status >= 200 && dashRes.status < 400) {
    console.log(`OK   GET /dashboard (${dashRes.status})`)
  } else {
    console.log(`FAIL  GET /dashboard (${dashRes.status})`)
    failed++
  }

  console.log('')
}

// Registration probe (validation only — does not create users)
const regRes = await fetch(`${base}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
  signal: AbortSignal.timeout(15_000),
}).catch(() => null)

if (regRes && regRes.status === 400) {
  console.log('OK   POST /api/auth/register rejects empty body (400)')
} else {
  console.log(`FAIL  POST /api/auth/register expected 400, got ${regRes?.status ?? 'error'}`)
  failed++
}

console.log('')
if (failed) {
  console.error(`${failed} check(s) failed. Restart dev server after .env changes: npm run dev`)
  process.exit(1)
}
console.log('Auth flow checks passed.')
