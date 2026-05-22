import { execute, query, queryOne } from '@/lib/db'
import { ApiError } from '@/lib/api-handler'
import { logAudit } from '@/lib/audit'

/** Google reCAPTCHA — v3 (score-based) or v2 (checkbox), configured by super admin. */
export type RecaptchaVersion = 'v3' | 'v2_checkbox'

export type RecaptchaAction = 'login' | 'register' | 'guest_checkout'

export interface RecaptchaConfig {
  enabled: boolean
  version: RecaptchaVersion
  siteKey: string
  secretKey: string
  /** v3 only — 0.0 (bot) to 1.0 (human). Google recommends 0.5 for production. */
  minScore: number
  protectLogin: boolean
  protectRegister: boolean
  protectGuestCheckout: boolean
  /** Optional hostnames from siteverify response (e.g. localhost, app.example.com). */
  hostnameAllowlist: string[]
}

export interface PublicRecaptchaConfig {
  enabled: boolean
  version: RecaptchaVersion
  siteKey: string
  minScore: number
  protectLogin: boolean
  protectRegister: boolean
  protectGuestCheckout: boolean
}

export interface RecaptchaAdminView {
  enabled: boolean
  version: RecaptchaVersion
  siteKey: string
  secretKeyConfigured: boolean
  secretKeyHint: string | null
  minScore: number
  protectLogin: boolean
  protectRegister: boolean
  protectGuestCheckout: boolean
  hostnameAllowlist: string[]
}

export interface RecaptchaAuditEntry {
  id: string
  action: string
  outcome: string
  recaptchaAction: string
  code?: string
  score?: number
  hostname?: string
  ipAddress?: string
  createdAt: string
}

const SETTING_KEY = 'recaptcha'

const DEFAULTS: RecaptchaConfig = {
  enabled: false,
  version: 'v3',
  siteKey: '',
  secretKey: '',
  minScore: 0.5,
  protectLogin: true,
  protectRegister: true,
  protectGuestCheckout: true,
  hostnameAllowlist: [],
}

/** Google test keys — for local dev / automated tests only. */
export const RECAPTCHA_TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
export const RECAPTCHA_TEST_SECRET_KEY = '6LeIxAcTAAAAAGG-vFIwTn6xmNXbW9h8JqXJq'

/** Token value accepted with test secret in non-production (CI / scripts). */
export const RECAPTCHA_SANDBOX_PASS_TOKEN = 'google-sandbox-pass'

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

let configCache: { value: RecaptchaConfig; expiresAt: number } | null = null
const CACHE_MS = 30_000

function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback
  if (typeof raw === 'object') return raw as T
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

function normalizeConfig(raw: Partial<RecaptchaConfig>): RecaptchaConfig {
  const version = raw.version === 'v2_checkbox' ? 'v2_checkbox' : 'v3'
  const minScore =
    typeof raw.minScore === 'number' && raw.minScore >= 0 && raw.minScore <= 1
      ? raw.minScore
      : DEFAULTS.minScore
  const allowlist = Array.isArray(raw.hostnameAllowlist)
    ? raw.hostnameAllowlist.filter((h): h is string => typeof h === 'string' && h.length > 0)
    : []

  return {
    enabled: Boolean(raw.enabled),
    version,
    siteKey: typeof raw.siteKey === 'string' ? raw.siteKey.trim() : '',
    secretKey: typeof raw.secretKey === 'string' ? raw.secretKey.trim() : '',
    minScore,
    protectLogin: raw.protectLogin !== false,
    protectRegister: raw.protectRegister !== false,
    protectGuestCheckout: raw.protectGuestCheckout !== false,
    hostnameAllowlist: allowlist,
  }
}

export function invalidateRecaptchaCache(): void {
  configCache = null
}

export async function getRecaptchaConfig(skipCache = false): Promise<RecaptchaConfig> {
  const now = Date.now()
  if (!skipCache && configCache && configCache.expiresAt > now) {
    return configCache.value
  }

  const row = await queryOne<{ setting_value: unknown }>(
    `SELECT setting_value FROM platform_settings WHERE setting_key = ? LIMIT 1`,
    [SETTING_KEY],
  )
  const value = normalizeConfig(parseJson(row?.setting_value, DEFAULTS))
  configCache = { value, expiresAt: now + CACHE_MS }
  return value
}

export async function updateRecaptchaConfig(
  patch: Partial<RecaptchaConfig> & { secretKey?: string },
  updatedBy?: string,
): Promise<RecaptchaConfig> {
  const current = await getRecaptchaConfig()
  const next = normalizeConfig({
    ...current,
    ...patch,
    secretKey:
      patch.secretKey !== undefined && patch.secretKey.trim().length > 0
        ? patch.secretKey.trim()
        : current.secretKey,
  })

  await execute(
    `INSERT INTO platform_settings (setting_key, setting_value, updated_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()`,
    [SETTING_KEY, JSON.stringify(next), updatedBy ?? null],
  )
  invalidateRecaptchaCache()
  return getRecaptchaConfig()
}

export function toAdminView(config: RecaptchaConfig): RecaptchaAdminView {
  const hint =
    config.secretKey.length > 4
      ? `••••${config.secretKey.slice(-4)}`
      : config.secretKey.length > 0
        ? '••••'
        : null
  return {
    enabled: config.enabled,
    version: config.version,
    siteKey: config.siteKey,
    secretKeyConfigured: config.secretKey.length > 0,
    secretKeyHint: hint,
    minScore: config.minScore,
    protectLogin: config.protectLogin,
    protectRegister: config.protectRegister,
    protectGuestCheckout: config.protectGuestCheckout,
    hostnameAllowlist: config.hostnameAllowlist,
  }
}

export function toPublicConfig(config: RecaptchaConfig): PublicRecaptchaConfig | null {
  if (!config.enabled || !config.siteKey) return null
  return {
    enabled: true,
    version: config.version,
    siteKey: config.siteKey,
    minScore: config.minScore,
    protectLogin: config.protectLogin,
    protectRegister: config.protectRegister,
    protectGuestCheckout: config.protectGuestCheckout,
  }
}

export function isRecaptchaRequired(
  config: RecaptchaConfig,
  action: RecaptchaAction,
): boolean {
  if (!config.enabled || !config.siteKey || !config.secretKey) return false
  if (action === 'login') return config.protectLogin
  if (action === 'register') return config.protectRegister
  return config.protectGuestCheckout
}

async function logRecaptchaEvent(params: {
  outcome: 'pass' | 'fail' | 'missing'
  recaptchaAction: RecaptchaAction
  code?: string
  score?: number
  hostname?: string
  ipAddress?: string
  userAgent?: string
  tenantId?: string
}): Promise<void> {
  await logAudit({
    action: 'security.recaptcha',
    tenantId: params.tenantId ?? null,
    resourceType: 'recaptcha',
    resourceId: params.recaptchaAction,
    metadata: {
      outcome: params.outcome,
      recaptchaAction: params.recaptchaAction,
      code: params.code,
      score: params.score,
      hostname: params.hostname,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  })
}

export async function listRecaptchaAuditEvents(limit = 25): Promise<RecaptchaAuditEntry[]> {
  const rows = await query<{
    id: string
    action: string
    metadata: unknown
    ip_address: string | null
    created_at: Date
  }>(
    `SELECT id, action, metadata, ip_address, created_at
     FROM audit_logs
     WHERE action = 'security.recaptcha'
     ORDER BY created_at DESC
     LIMIT ?`,
    [Math.min(limit, 100)],
  )

  return rows.map((row) => {
    const meta = parseJson<Record<string, unknown>>(row.metadata, {})
    return {
      id: row.id,
      action: row.action,
      outcome: String(meta.outcome ?? 'unknown'),
      recaptchaAction: String(meta.recaptchaAction ?? ''),
      code: meta.code != null ? String(meta.code) : undefined,
      score: typeof meta.score === 'number' ? meta.score : undefined,
      hostname: meta.hostname != null ? String(meta.hostname) : undefined,
      ipAddress: row.ip_address ?? undefined,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    }
  })
}

interface SiteVerifyResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

export async function verifyRecaptchaToken(params: {
  token: string
  remoteIp?: string
  expectedAction?: RecaptchaAction
  tenantId?: string
  userAgent?: string
  audit?: boolean
}): Promise<{ ok: true; score?: number; hostname?: string } | { ok: false; code: string; error: string }> {
  const config = await getRecaptchaConfig(true)
  if (!config.secretKey) {
    return { ok: false, code: 'RECAPTCHA_NOT_CONFIGURED', error: 'reCAPTCHA secret key is not configured' }
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    config.secretKey === RECAPTCHA_TEST_SECRET_KEY &&
    params.token === RECAPTCHA_SANDBOX_PASS_TOKEN
  ) {
    if (params.audit !== false && params.expectedAction) {
      await logRecaptchaEvent({
        outcome: 'pass',
        recaptchaAction: params.expectedAction,
        score: 0.9,
        hostname: 'localhost',
        ipAddress: params.remoteIp,
        userAgent: params.userAgent,
        tenantId: params.tenantId,
      })
    }
    return { ok: true, score: 0.9, hostname: 'localhost' }
  }

  const body = new URLSearchParams({
    secret: config.secretKey,
    response: params.token,
  })
  if (params.remoteIp && params.remoteIp !== 'unknown') {
    body.set('remoteip', params.remoteIp)
  }

  let data: SiteVerifyResponse
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(10_000),
    })
    data = (await res.json()) as SiteVerifyResponse
  } catch {
    const fail = { ok: false as const, code: 'RECAPTCHA_UNAVAILABLE', error: 'Could not verify CAPTCHA. Try again later.' }
    if (params.audit !== false && params.expectedAction) {
      await logRecaptchaEvent({
        outcome: 'fail',
        recaptchaAction: params.expectedAction,
        code: fail.code,
        ipAddress: params.remoteIp,
        userAgent: params.userAgent,
        tenantId: params.tenantId,
      })
    }
    return fail
  }

  const auditFail = async (code: string, error: string, score?: number, hostname?: string) => {
    if (params.audit !== false && params.expectedAction) {
      await logRecaptchaEvent({
        outcome: 'fail',
        recaptchaAction: params.expectedAction,
        code,
        score,
        hostname,
        ipAddress: params.remoteIp,
        userAgent: params.userAgent,
        tenantId: params.tenantId,
      })
    }
    return { ok: false as const, code, error }
  }

  if (!data.success) {
    const codes = data['error-codes']?.join(', ') || 'verification_failed'
    return auditFail('RECAPTCHA_FAILED', `CAPTCHA verification failed (${codes})`)
  }

  if (config.hostnameAllowlist.length > 0 && data.hostname) {
    const allowed = config.hostnameAllowlist.some(
      (h) => h.toLowerCase() === data.hostname!.toLowerCase(),
    )
    if (!allowed) {
      return auditFail('RECAPTCHA_HOST_MISMATCH', 'CAPTCHA hostname not allowed', undefined, data.hostname)
    }
  }

  if (config.version === 'v3') {
    const score = typeof data.score === 'number' ? data.score : 0
    if (score < config.minScore) {
      return auditFail('RECAPTCHA_LOW_SCORE', 'Security check failed. Please try again.', score, data.hostname)
    }
    if (params.expectedAction && data.action && data.action !== params.expectedAction) {
      return auditFail('RECAPTCHA_ACTION_MISMATCH', 'Invalid CAPTCHA action', score, data.hostname)
    }
    if (params.audit !== false && params.expectedAction) {
      await logRecaptchaEvent({
        outcome: 'pass',
        recaptchaAction: params.expectedAction,
        score,
        hostname: data.hostname,
        ipAddress: params.remoteIp,
        userAgent: params.userAgent,
        tenantId: params.tenantId,
      })
    }
    return { ok: true, score, hostname: data.hostname }
  }

  if (params.audit !== false && params.expectedAction) {
    await logRecaptchaEvent({
      outcome: 'pass',
      recaptchaAction: params.expectedAction,
      hostname: data.hostname,
      ipAddress: params.remoteIp,
      userAgent: params.userAgent,
      tenantId: params.tenantId,
    })
  }
  return { ok: true, hostname: data.hostname }
}

/** Throws ApiError when verification fails or token missing. */
export async function assertRecaptcha(
  action: RecaptchaAction,
  token: string | undefined,
  remoteIp?: string,
  options?: { tenantId?: string; userAgent?: string },
): Promise<void> {
  const config = await getRecaptchaConfig(true)
  if (!isRecaptchaRequired(config, action)) return

  if (!token?.trim()) {
    await logRecaptchaEvent({
      outcome: 'missing',
      recaptchaAction: action,
      code: 'RECAPTCHA_REQUIRED',
      ipAddress: remoteIp,
      userAgent: options?.userAgent,
      tenantId: options?.tenantId,
    })
    throw new ApiError('Security verification required', 400, 'RECAPTCHA_REQUIRED')
  }

  const result = await verifyRecaptchaToken({
    token: token.trim(),
    remoteIp,
    expectedAction: config.version === 'v3' ? action : undefined,
    tenantId: options?.tenantId,
    userAgent: options?.userAgent,
  })

  if (!result.ok) {
    throw new ApiError(result.error, 400, result.code)
  }
}
