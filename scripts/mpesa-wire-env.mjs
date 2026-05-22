#!/usr/bin/env node
/**
 * Wire M-Pesa sandbox defaults in .env from NEXT_PUBLIC_APP_URL (no Daraja secrets).
 * Usage: node scripts/mpesa-wire-env.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')

loadEnv(root)

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000')
  .replace(/\/$/, '')
const callback = `${appUrl}/api/payments/mpesa/callback`

if (!fs.existsSync(envPath)) {
  console.error('.env not found — copy .env.example first.')
  process.exit(1)
}

let content = fs.readFileSync(envPath, 'utf8')

function upsert(key, value) {
  const line = `${key}=${value}`
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm')
  if (re.test(content)) {
    content = content.replace(re, line)
  } else {
    content += `\n${line}\n`
  }
}

upsert('MPESA_ENV', 'sandbox')
upsert('MPESA_CALLBACK_URL', callback)

if (!/^MPESA_TEST_PHONE=/m.test(content)) {
  content += '\n# MPESA_TEST_PHONE=2547XXXXXXXX\n'
}
if (!/^MPESA_TEST_AMOUNT=/m.test(content)) {
  content += '# MPESA_TEST_AMOUNT=1\n'
}

fs.writeFileSync(envPath, content, 'utf8')

console.log('M-Pesa env wired in .env:')
console.log(`  MPESA_ENV=sandbox`)
console.log(`  MPESA_CALLBACK_URL=${callback}`)
console.log('')
console.log('Next: add Daraja keys from https://developer.safaricom.co.ke')
console.log('  MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY')
console.log('Then: npm run mpesa:check')
