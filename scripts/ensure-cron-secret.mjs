#!/usr/bin/env node
/**
 * Append CRON_SECRET to .env if missing (for export cron + smoke tests).
 * Usage: node scripts/ensure-cron-secret.mjs
 */
import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')

if (!fs.existsSync(envPath)) {
  console.error('.env not found — copy .env.example first.')
  process.exit(1)
}

const content = fs.readFileSync(envPath, 'utf8')
if (/^CRON_SECRET=/m.test(content)) {
  console.log('CRON_SECRET already set in .env')
  process.exit(0)
}

const secret = crypto.randomBytes(32).toString('hex')
const line = `\n# Auto-generated for GDPR export cron (npm run exports:process)\nCRON_SECRET=${secret}\n`
fs.appendFileSync(envPath, line, 'utf8')
console.log('Added CRON_SECRET to .env — run: npm run exports:process')
