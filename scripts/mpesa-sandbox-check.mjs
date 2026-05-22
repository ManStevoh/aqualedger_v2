/**
 * Validate M-Pesa Daraja env for sandbox/live STK.
 * Usage: node scripts/mpesa-sandbox-check.mjs
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

const required = [
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORTCODE',
  'MPESA_PASSKEY',
]

const optional = ['MPESA_ENV', 'MPESA_CALLBACK_URL', 'MPESA_TEST_PHONE', 'MPESA_TEST_AMOUNT', 'NEXT_PUBLIC_APP_URL']

console.log('M-Pesa configuration check\n')

let live = true
for (const key of required) {
  const val = process.env[key]
  if (!val) {
    console.log(`  MISSING  ${key}`)
    live = false
  } else {
    console.log(`  OK       ${key} (${key.includes('SECRET') || key.includes('PASSKEY') ? '***' : val.slice(0, 12)}…)`)
  }
}

for (const key of optional) {
  const val = process.env[key]
  console.log(`  ${val ? 'OK' : '—'}       ${key}${val ? `: ${val}` : ' (optional)'}`)
}

if (!live) {
  console.log('\nMode: STUB (auto-complete when MPESA_STUB_AUTO_COMPLETE=true)')
  console.log('Set required MPESA_* vars for live Daraja sandbox. See docs/MPESA_SANDBOX.md')
  process.exit(0)
}

const base =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'

try {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString('base64')
  const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!res.ok) {
    console.error(`\nDaraja OAuth failed: HTTP ${res.status}`)
    process.exit(1)
  }
  const data = await res.json()
  if (data.access_token) {
    console.log('\nDaraja OAuth: OK (sandbox/live credentials valid)')
  } else {
    console.error('\nDaraja OAuth: unexpected response')
    process.exit(1)
  }
} catch (e) {
  console.error('\nDaraja OAuth error:', e instanceof Error ? e.message : e)
  process.exit(1)
}

console.log('Callback URL should be publicly reachable:', process.env.MPESA_CALLBACK_URL || '(set MPESA_CALLBACK_URL)')
