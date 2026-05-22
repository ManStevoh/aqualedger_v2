import { query, queryOne, execute } from '@/lib/db'

export type MaintenanceSetting = { enabled: boolean; message: string }
export type SignupSetting = { locked: boolean }
export type AnnouncementSetting = { enabled: boolean; title: string; body: string }

export type PlatformSettings = {
  maintenance: MaintenanceSetting
  signup: SignupSetting
  announcement: AnnouncementSetting
}

const SETTING_KEYS = ['maintenance', 'signup', 'announcement'] as const
export type PlatformSettingKey = (typeof SETTING_KEYS)[number]

const DEFAULTS: PlatformSettings = {
  maintenance: { enabled: false, message: '' },
  signup: { locked: false },
  announcement: { enabled: false, title: '', body: '' },
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
    `SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN (?, ?, ?)`,
    [...SETTING_KEYS],
  )
  const map = new Map(rows.map((r) => [r.setting_key, r.setting_value]))
  return {
    maintenance: parseJson(map.get('maintenance'), DEFAULTS.maintenance),
    signup: parseJson(map.get('signup'), DEFAULTS.signup),
    announcement: parseJson(map.get('announcement'), DEFAULTS.announcement),
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
}

export function settingsToUi(settings: PlatformSettings): PlatformSettingsUi {
  return {
    maintenanceMode: settings.maintenance.enabled,
    maintenanceMessage: settings.maintenance.message,
    signupLocked: settings.signup.locked,
    announcementEnabled: settings.announcement.enabled,
    announcementTitle: settings.announcement.title,
    announcementBody: settings.announcement.body,
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
  return settingsToUi(await getSettings())
}
