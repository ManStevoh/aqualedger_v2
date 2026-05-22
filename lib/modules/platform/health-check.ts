import { healthCheck, queryOne } from '@/lib/db'
import { getEnabledModuleIds } from '@/lib/platform/module-enablement'
import { getJwtSecret } from '@/lib/auth'

export interface PlatformHealth {
  database: { ok: boolean }
  environment: {
    mpesa: { configured: boolean; keys: string[] }
    smtp: { configured: boolean }
    stripe: { configured: boolean }
    paystack: { configured: boolean }
    openai: { configured: boolean }
    googleOAuth: { configured: boolean }
    fcm: { configured: boolean }
    resend: { configured: boolean }
    sms: { configured: boolean }
    jwtSecret: { configured: boolean; length: number | null }
  }
  modules: { enabledCount: number; totalFlags: number }
}

export type HealthServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export interface HealthServiceRow {
  name: string
  status: HealthServiceStatus
  message?: string
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

  const stripeConfigured = envPresent('STRIPE_SECRET_KEY')
  const paystackConfigured = envPresent('PAYSTACK_SECRET_KEY')
  const openaiConfigured = envPresent('OPENAI_API_KEY')
  const googleOAuthConfigured =
    envPresent('GOOGLE_OAUTH_CLIENT_ID') && envPresent('GOOGLE_OAUTH_CLIENT_SECRET')
  const fcmConfigured = envPresent('FCM_SERVER_KEY')
  const resendConfigured = envPresent('RESEND_API_KEY')
  const smsConfigured =
    envPresent('SMS_API_KEY') ||
    envPresent('AFRICASTALKING_API_KEY') ||
    envPresent('TWILIO_ACCOUNT_SID')

  return {
    database: { ok: dbOk },
    environment: {
      mpesa: {
        configured: mpesaConfigured,
        keys: mpesaKeys.map((k) => (envPresent(k) ? k : `${k} (missing)`)),
      },
      smtp: { configured: smtpConfigured },
      stripe: { configured: stripeConfigured },
      paystack: { configured: paystackConfigured },
      openai: { configured: openaiConfigured },
      googleOAuth: { configured: googleOAuthConfigured },
      fcm: { configured: fcmConfigured },
      resend: { configured: resendConfigured },
      sms: { configured: smsConfigured },
      jwtSecret: { configured: jwtConfigured, length: jwtLength },
    },
    modules: {
      enabledCount: enabled.size,
      totalFlags: Number(flagRow?.total ?? 0),
    },
  }
}

export function healthToServiceRows(health: PlatformHealth): HealthServiceRow[] {
  const env = health.environment
  const rows: HealthServiceRow[] = [
    {
      name: 'MySQL database',
      status: health.database.ok ? 'healthy' : 'down',
      message: health.database.ok ? 'Connected' : 'Connection failed',
    },
    {
      name: 'JWT secret',
      status: env.jwtSecret.configured ? 'healthy' : 'degraded',
      message: env.jwtSecret.configured
        ? `${env.jwtSecret.length} chars`
        : 'Set JWT_SECRET (32+ chars) for production',
    },
    {
      name: 'M-Pesa Daraja',
      status: env.mpesa.configured ? 'healthy' : 'degraded',
      message: env.mpesa.configured ? 'STK push ready' : env.mpesa.keys.join(', '),
    },
    {
      name: 'Stripe',
      status: env.stripe.configured ? 'healthy' : 'degraded',
      message: env.stripe.configured ? 'Card payments enabled' : 'STRIPE_SECRET_KEY not set',
    },
    {
      name: 'Paystack',
      status: env.paystack.configured ? 'healthy' : 'degraded',
      message: env.paystack.configured ? 'Paystack checkout ready' : 'PAYSTACK_SECRET_KEY not set',
    },
    {
      name: 'Email (SMTP)',
      status: env.smtp.configured ? 'healthy' : 'degraded',
      message: env.smtp.configured ? 'SMTP configured' : 'SMTP_HOST/USER not set',
    },
    {
      name: 'Email (Resend)',
      status: env.resend.configured ? 'healthy' : 'unknown',
      message: env.resend.configured ? 'RESEND_API_KEY set' : 'Optional — use SMTP or Resend',
    },
    {
      name: 'SMS',
      status: env.sms.configured ? 'healthy' : 'unknown',
      message: env.sms.configured ? 'SMS provider configured' : 'Optional',
    },
    {
      name: 'FCM push',
      status: env.fcm.configured ? 'healthy' : 'unknown',
      message: env.fcm.configured ? 'FCM_SERVER_KEY set' : 'Optional mobile push',
    },
    {
      name: 'OpenAI',
      status: env.openai.configured ? 'healthy' : 'unknown',
      message: env.openai.configured ? 'AI features enabled' : 'Optional OPENAI_API_KEY',
    },
    {
      name: 'Google OAuth',
      status: env.googleOAuth.configured ? 'healthy' : 'unknown',
      message: env.googleOAuth.configured ? 'Sign-in with Google' : 'Optional GOOGLE_OAUTH_*',
    },
    {
      name: 'ERP modules',
      status: 'healthy',
      message: `${health.modules.enabledCount} modules enabled (${health.modules.totalFlags} flags)`,
    },
  ]
  return rows
}
