#!/usr/bin/env node
/**
 * Production / pilot environment readiness check.
 * Usage: node scripts/env-check.mjs [--strict]
 *
 * --strict  Fail if optional pilot vars (CRON_SECRET, NEXT_PUBLIC_APP_URL) are missing.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const strict = process.argv.includes('--strict')
loadEnv(root)

let errors = 0
let warnings = 0

function ok(msg) {
  console.log(`  OK   ${msg}`)
}
function warn(msg) {
  console.log(`  WARN ${msg}`)
  warnings++
}
function fail(msg) {
  console.log(`  FAIL ${msg}`)
  errors++
}

console.log('AquaERP environment check\n')

const jwt = process.env.JWT_SECRET || ''
if (jwt.length < 32) {
  fail('JWT_SECRET must be at least 32 characters')
} else {
  ok('JWT_SECRET length')
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
if (!appUrl || appUrl.includes('your-domain')) {
  if (strict) fail('NEXT_PUBLIC_APP_URL (or APP_URL) must be set to your public HTTPS origin')
  else warn('NEXT_PUBLIC_APP_URL not set — M-Pesa callbacks and emails need a public URL')
} else {
  ok(`App URL: ${appUrl}`)
}

for (const key of ['DB_HOST', 'DB_USER', 'DB_NAME']) {
  if (!process.env[key]) fail(`${key} is required`)
  else ok(key)
}

if (!process.env.CRON_SECRET) {
  if (strict) fail('CRON_SECRET missing — run npm run setup:cron')
  else warn('CRON_SECRET missing — GDPR export cron will not run')
} else {
  ok('CRON_SECRET set')
}

if (!process.env.PLATFORM_HOST) {
  warn('PLATFORM_HOST not set — subdomain routing defaults to localhost')
} else {
  ok(`PLATFORM_HOST=${process.env.PLATFORM_HOST}`)
}

const mpesaKeys = [
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORTCODE',
  'MPESA_PASSKEY',
]
const mpesaLive = mpesaKeys.every((k) => process.env[k])
if (mpesaLive) {
  ok('M-Pesa Daraja credentials present')
  if (!process.env.MPESA_CALLBACK_URL) {
    warn('MPESA_CALLBACK_URL not set')
  }
} else {
  warn('M-Pesa not configured — run npm run mpesa:wire then add Daraja keys (npm run mpesa:check)')
}

if (process.env.STRIPE_SECRET_KEY) ok('Stripe configured')
else warn('STRIPE_SECRET_KEY not set — billing portal uses stub')

const smtp =
  process.env.SMTP_HOST ||
  process.env.RESEND_API_KEY ||
  process.env.SENDGRID_API_KEY
if (smtp) ok('Email provider configured')
else warn('No email provider — outbox stays in stub/log mode')

console.log('')
if (errors) {
  console.error(`${errors} error(s), ${warnings} warning(s). Fix errors before production.`)
  process.exit(1)
}
if (warnings) {
  console.log(`${warnings} warning(s). OK for local dev; address before pilot go-live.`)
  process.exit(strict ? 1 : 0)
}
console.log('Environment check passed.')
