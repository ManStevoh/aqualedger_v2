import { query, queryOne, execute } from '@/lib/db'

export type MaintenanceSetting = { enabled: boolean; message: string }
export type SignupSetting = { locked: boolean }
export type AnnouncementSetting = { enabled: boolean; title: string; body: string }
export type PlatformBrandingSetting = {
  logo_url: string
  primary_color: string
  app_name: string
}
export type DeveloperSetting = {
  local_dev_mode: boolean
  mock_mpesa_callbacks: boolean
  bypass_rate_limits: boolean
  debug_logging: boolean
  api_sandbox_enabled: boolean
}

export type PlatformSettings = {
  maintenance: MaintenanceSetting
  signup: SignupSetting
  announcement: AnnouncementSetting
  branding: PlatformBrandingSetting
  developer: DeveloperSetting
}

const SETTING_KEYS = ['maintenance', 'signup', 'announcement', 'branding', 'developer'] as const
export type PlatformSettingKey = (typeof SETTING_KEYS)[number]

const DEFAULTS: PlatformSettings = {
  maintenance: { enabled: false, message: '' },
  signup: { locked: false },
  announcement: { enabled: false, title: '', body: '' },
  branding: { logo_url: '', primary_color: '', app_name: '' },
  developer: {
    local_dev_mode: true,
    mock_mpesa_callbacks: false,
    bypass_rate_limits: false,
    debug_logging: false,
    api_sandbox_enabled: false,
  },
}

let maintenanceCache: { value: MaintenanceSetting; expiresAt: number } | null = null
const MAINTENANCE_CACHE_MS = 30_000

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

export async function getSettings(): Promise<PlatformSettings> {
  const rows = await query<{ setting_key: string; setting_value: unknown }>(
    `SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN (?, ?, ?, ?, ?)`,
    [...SETTING_KEYS],
  )
  const map = new Map(rows.map((r) => [r.setting_key, r.setting_value]))
  return {
    maintenance: parseJson(map.get('maintenance'), DEFAULTS.maintenance),
    signup: parseJson(map.get('signup'), DEFAULTS.signup),
    announcement: parseJson(map.get('announcement'), DEFAULTS.announcement),
    branding: parseJson(map.get('branding'), DEFAULTS.branding),
    developer: parseJson(map.get('developer'), DEFAULTS.developer),
  }
}

export async function updateSetting(
  key: PlatformSettingKey,
  value: Record<string, unknown>,
  updatedBy?: string,
): Promise<PlatformSettings> {
  const current = await getSettings()
  const merged = { ...current[key], ...value }
  await execute(
    `INSERT INTO platform_settings (setting_key, setting_value, updated_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()`,
    [key, JSON.stringify(merged), updatedBy ?? null],
  )
  if (key === 'maintenance') {
    maintenanceCache = null
  }
  if (key === 'signup') {
    signupCache = null
  }
  return getSettings()
}

export async function getMaintenanceStatus(): Promise<MaintenanceSetting> {
  const now = Date.now()
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.value
  }
  const row = await queryOne<{ setting_value: unknown }>(
    `SELECT setting_value FROM platform_settings WHERE setting_key = 'maintenance' LIMIT 1`,
  )
  const value = parseJson(row?.setting_value, DEFAULTS.maintenance)
  maintenanceCache = { value, expiresAt: now + MAINTENANCE_CACHE_MS }
  return value
}

export function invalidateMaintenanceCache(): void {
  maintenanceCache = null
}

let signupCache: { value: boolean; expiresAt: number } | null = null

export async function getSignupLocked(): Promise<boolean> {
  const now = Date.now()
  if (signupCache && signupCache.expiresAt > now) {
    return signupCache.value
  }
  const row = await queryOne<{ setting_value: unknown }>(
    `SELECT setting_value FROM platform_settings WHERE setting_key = 'signup' LIMIT 1`,
  )
  const signup = parseJson(row?.setting_value, DEFAULTS.signup)
  signupCache = { value: Boolean(signup.locked), expiresAt: now + MAINTENANCE_CACHE_MS }
  return signupCache.value
}

export function invalidateSignupCache(): void {
  signupCache = null
}

/** Flat shape used by admin UI and public status API */
export interface PlatformSettingsUi {
  maintenanceMode: boolean
  maintenanceMessage: string
  signupLocked: boolean
  announcementEnabled: boolean
  announcementTitle: string
  announcementBody: string
  brandingLogoUrl: string
  brandingPrimaryColor: string
  brandingAppName: string
  localDevMode: boolean
  mockMpesaCallbacks: boolean
  bypassRateLimits: boolean
  debugLogging: boolean
  apiSandboxEnabled: boolean
}

export function settingsToUi(settings: PlatformSettings): PlatformSettingsUi {
  return {
    maintenanceMode: settings.maintenance.enabled,
    maintenanceMessage: settings.maintenance.message,
    signupLocked: settings.signup.locked,
    announcementEnabled: settings.announcement.enabled,
    announcementTitle: settings.announcement.title,
    announcementBody: settings.announcement.body,
    brandingLogoUrl: settings.branding.logo_url ?? '',
    brandingPrimaryColor: settings.branding.primary_color ?? '',
    brandingAppName: settings.branding.app_name ?? '',
    localDevMode: settings.developer.local_dev_mode ?? true,
    mockMpesaCallbacks: settings.developer.mock_mpesa_callbacks ?? false,
    bypassRateLimits: settings.developer.bypass_rate_limits ?? false,
    debugLogging: settings.developer.debug_logging ?? false,
    apiSandboxEnabled: settings.developer.api_sandbox_enabled ?? false,
  }
}

export async function saveAllUiSettings(
  ui: Partial<PlatformSettingsUi>,
  updatedBy?: string,
): Promise<PlatformSettingsUi> {
  if (ui.maintenanceMode !== undefined || ui.maintenanceMessage !== undefined) {
    const current = await getSettings()
    await updateSetting(
      'maintenance',
      {
        enabled: ui.maintenanceMode ?? current.maintenance.enabled,
        message: ui.maintenanceMessage ?? current.maintenance.message,
      },
      updatedBy,
    )
    invalidateMaintenanceCache()
  }
  if (ui.signupLocked !== undefined) {
    await updateSetting('signup', { locked: ui.signupLocked }, updatedBy)
    invalidateSignupCache()
  }
  if (
    ui.announcementEnabled !== undefined ||
    ui.announcementTitle !== undefined ||
    ui.announcementBody !== undefined
  ) {
    const current = await getSettings()
    await updateSetting(
      'announcement',
      {
        enabled: ui.announcementEnabled ?? current.announcement.enabled,
        title: ui.announcementTitle ?? current.announcement.title,
        body: ui.announcementBody ?? current.announcement.body,
      },
      updatedBy,
    )
  }
  if (
    ui.brandingLogoUrl !== undefined ||
    ui.brandingPrimaryColor !== undefined ||
    ui.brandingAppName !== undefined
  ) {
    const current = await getSettings()
    await updateSetting(
      'branding',
      {
        logo_url: ui.brandingLogoUrl ?? current.branding.logo_url,
        primary_color: ui.brandingPrimaryColor ?? current.branding.primary_color,
        app_name: ui.brandingAppName ?? current.branding.app_name,
      },
      updatedBy,
    )
  }
  if (
    ui.localDevMode !== undefined ||
    ui.mockMpesaCallbacks !== undefined ||
    ui.bypassRateLimits !== undefined ||
    ui.debugLogging !== undefined ||
    ui.apiSandboxEnabled !== undefined
  ) {
    const current = await getSettings()
    await updateSetting(
      'developer',
      {
        local_dev_mode: ui.localDevMode ?? current.developer.local_dev_mode,
        mock_mpesa_callbacks: ui.mockMpesaCallbacks ?? current.developer.mock_mpesa_callbacks,
        bypass_rate_limits: ui.bypassRateLimits ?? current.developer.bypass_rate_limits,
        debug_logging: ui.debugLogging ?? current.developer.debug_logging,
        api_sandbox_enabled: ui.apiSandboxEnabled ?? current.developer.api_sandbox_enabled,
      },
      updatedBy,
    )
  }
  return settingsToUi(await getSettings())
}
