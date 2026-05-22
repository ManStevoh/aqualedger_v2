import { healthCheck, queryOne } from '@/lib/db'
import { getEnabledModuleIds } from '@/lib/platform/module-enablement'
import { getJwtSecret } from '@/lib/auth'

export interface PlatformHealth {
  database: { ok: boolean }
  environment: {
    mpesa: { configured: boolean; keys: string[] }
    smtp: { configured: boolean }
    jwtSecret: { configured: boolean; length: number | null }
  }
  modules: { enabledCount: number; totalFlags: number }
}

function envPresent(key: string): boolean {
  const v = process.env[key]
  return Boolean(v && v.trim().length > 0)
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  const dbOk = await healthCheck()

  const mpesaKeys = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORTCODE',
    'MPESA_PASSKEY',
  ]
  const mpesaConfigured = mpesaKeys.every(envPresent)

  const smtpConfigured =
    envPresent('SMTP_HOST') &&
    envPresent('SMTP_PORT') &&
    envPresent('SMTP_USER') &&
    envPresent('SMTP_PASS')

  let jwtConfigured = false
  let jwtLength: number | null = null
  try {
    const secret = getJwtSecret()
    jwtConfigured = secret.length >= 32
    jwtLength = secret.length
  } catch {
    jwtConfigured = false
    jwtLength = process.env.JWT_SECRET?.length ?? null
  }

  const enabled = await getEnabledModuleIds()
  const flagRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM platform_module_flags`,
  )

  return {
    database: { ok: dbOk },
    environment: {
      mpesa: {
        configured: mpesaConfigured,
        keys: mpesaKeys.map((k) => (envPresent(k) ? k : `${k} (missing)`)),
      },
      smtp: { configured: smtpConfigured },
      jwtSecret: { configured: jwtConfigured, length: jwtLength },
    },
    modules: {
      enabledCount: enabled.size,
      totalFlags: Number(flagRow?.total ?? 0),
    },
  }
}
