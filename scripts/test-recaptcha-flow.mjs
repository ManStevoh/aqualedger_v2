/**
 * End-to-end checks for reCAPTCHA + platform security APIs (no browser).
 * Usage: node scripts/test-recaptcha-flow.mjs [baseUrl]
 */
import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseUrl = process.argv[2] || 'http://localhost:3000'

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

const TEST_SITE = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
const TEST_SECRET = '6LeIxAcTAAAAAGG-vFIwTn6xmNXbW9h8JqXJq'

let passed = 0
let failed = 0

function ok(msg) {
  passed++
  console.log('  ✓', msg)
}

function fail(msg, detail) {
  failed++
  console.error('  ✗', msg, detail ?? '')
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options)
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text.slice(0, 200) }
  }
  return { res, json }
}

async function enableTestRecaptcha(conn) {
  const value = JSON.stringify({
    enabled: true,
    version: 'v2_checkbox',
    siteKey: TEST_SITE,
    secretKey: TEST_SECRET,
    minScore: 0.5,
    protectLogin: true,
    protectRegister: true,
    protectGuestCheckout: true,
    hostnameAllowlist: [],
  })
  await conn.query(
    `INSERT INTO platform_settings (setting_key, setting_value)
     VALUES ('recaptcha', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [value],
  )
}

async function disableRecaptcha(conn) {
  const value = JSON.stringify({
    enabled: false,
    version: 'v3',
    siteKey: '',
    secretKey: '',
    minScore: 0.5,
    protectLogin: true,
    protectRegister: true,
    protectGuestCheckout: true,
    hostnameAllowlist: [],
  })
  await conn.query(
    `UPDATE platform_settings SET setting_value = ? WHERE setting_key = 'recaptcha'`,
    [value],
  )
}

async function main() {
  console.log('\n🔐 Security flow tests @', baseUrl)

  const { res: healthRes, json: health } = await fetchJson(`${baseUrl}/api/health`)
  if (!healthRes.ok) {
    fail('Server not reachable', `GET /api/health → ${healthRes.status}`)
    console.log('\nStart the app: npm run dev\n')
    process.exit(1)
  }
  ok(`Health: ${health.data?.services?.database?.status ?? health.status}`)

  const { json: pubConfig } = await fetchJson(`${baseUrl}/api/public/recaptcha/config`)
  if (!pubConfig.success) {
    fail('Public recaptcha config', pubConfig)
  } else {
    ok(
      `Public config: ${pubConfig.data?.recaptcha ? 'enabled' : 'disabled'} (site key ${pubConfig.data?.recaptcha?.siteKey ? 'set' : 'none'})`,
    )
  }

  const { json: status } = await fetchJson(`${baseUrl}/api/public/platform/status`)
  if (status.success && status.data) {
    ok(`Platform status: signupLocked=${Boolean(status.data.signupLocked)}`)
  } else {
    fail('Platform status API', status)
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aquaerp_operating',
  })

  await enableTestRecaptcha(conn)
  ok('Enabled Google test reCAPTCHA keys in DB')

  const { json: pubEnabled } = await fetchJson(`${baseUrl}/api/public/recaptcha/config`)
  if (pubEnabled.data?.recaptcha?.enabled && pubEnabled.data.recaptcha.siteKey === TEST_SITE) {
    ok('Public config reflects enabled test site key')
  } else {
    fail('Public config after enable', pubEnabled.data)
  }

  const loginBody = {
    email: 'admin@aqualedger.co.ke',
    password: 'wrong-password',
  }

  const { res: noTokenRes, json: noToken } = await fetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginBody),
  })
  if (noToken.code === 'RECAPTCHA_REQUIRED' || noToken.error?.includes('Security verification')) {
    ok('Login without token rejected (RECAPTCHA_REQUIRED)')
  } else {
    fail('Login without token should require CAPTCHA', { status: noTokenRes.status, ...noToken })
  }

  const { res: withTokenRes, json: withToken } = await fetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...loginBody,
      recaptchaToken: 'google-sandbox-pass',
    }),
  })
  if (
    withToken.code === 'INVALID_CREDENTIALS' ||
    withToken.error?.includes('Invalid email')
  ) {
    ok('Login with test token passed CAPTCHA (failed auth as expected)')
  } else if (withToken.code === 'RECAPTCHA_REQUIRED' || withToken.code === 'RECAPTCHA_FAILED') {
    fail('Login with test token should pass Google test verify', withToken)
  } else {
    ok(`Login with token: ${withToken.code ?? withToken.error ?? withTokenRes.status}`)
  }

  await disableRecaptcha(conn)

  const { json: noCap } = await fetchJson(`${baseUrl}/api/public/recaptcha/config`)
  if (noCap.data?.recaptcha === null) {
    ok('Public config shows disabled after DB update')
  }

  const { json: loginNoCap } = await fetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginBody),
  })
  if (loginNoCap.code !== 'RECAPTCHA_REQUIRED') {
    ok('Login without CAPTCHA allowed when disabled')
  } else {
    fail('CAPTCHA still required after disable', loginNoCap)
  }

  await conn.end()

  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
