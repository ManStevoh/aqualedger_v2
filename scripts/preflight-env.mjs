#!/usr/bin/env node
/**
 * Report which production integrations are configured (.env merge).
 * Usage: node scripts/preflight-env.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

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

const checks = [
  { name: 'App URL', keys: ['NEXT_PUBLIC_APP_URL', 'APP_URL'], required: true },
  { name: 'JWT (32+ chars)', keys: ['JWT_SECRET'], minLen: 32, required: true },
  { name: 'Database', keys: ['DB_HOST', 'DB_USER', 'DB_NAME'], required: true },
  { name: 'CRON (exports)', keys: ['CRON_SECRET'], required: false },
  { name: 'M-Pesa Daraja', keys: ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY'], required: false },
  { name: 'Stripe', keys: ['STRIPE_SECRET_KEY'], required: false },
  { name: 'Email (SMTP)', keys: ['SMTP_HOST', 'SMTP_USER'], required: false },
  { name: 'Email (Resend)', keys: ['RESEND_API_KEY'], required: false },
  { name: 'OpenAI', keys: ['OPENAI_API_KEY'], required: false },
  { name: 'Google OAuth', keys: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'], required: false },
  { name: 'FCM push', keys: ['FCM_SERVER_KEY'], required: false },
]

function configured(keys, minLen) {
  const val = keys.map((k) => process.env[k]).find(Boolean)
  if (!val) return false
  if (minLen && val.length < minLen) return false
  return true
}

console.log('AquaERP environment preflight\n')

let missingRequired = 0
for (const c of checks) {
  const ok = configured(c.keys, c.minLen)
  const tag = ok ? 'OK  ' : c.required ? 'MISS' : '—   '
  console.log(`${tag}  ${c.name}`)
  if (!ok && c.required) missingRequired++
}

console.log('')
if (missingRequired) {
  console.log(`${missingRequired} required group(s) missing — see .env.example`)
  process.exit(1)
}
console.log('Required env OK. Optional integrations show MISS/— until you wire them for go-live.')
