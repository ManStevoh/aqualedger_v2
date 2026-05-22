import { query, execute } from '@/lib/db'
import { forbidden } from '@/lib/api-handler'
import { ERP_MODULES, type ModuleId } from './modules'
import { resolveModuleFromApiPath, resolveModuleFromDashboardPath } from './module-paths'

export { resolveModuleFromApiPath, resolveModuleFromDashboardPath }

/** Overview / command center — cannot be turned off */
export const ALWAYS_ON_MODULE_IDS: ModuleId[] = ['platform']

export const TOGGLABLE_MODULE_IDS: ModuleId[] = ERP_MODULES.map((m) => m.id).filter(
  (id): id is ModuleId => id !== 'platform',
)

let cache: { ids: Set<string>; expiresAt: number } | null = null
const CACHE_MS = 15_000

export function invalidateModuleEnablementCache(): void {
  cache = null
}

export async function getEnabledModuleIds(): Promise<Set<string>> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) {
    return cache.ids
  }

  const rows = await query<{ module_id: string; enabled: number }>(
    `SELECT module_id, enabled FROM platform_module_flags`,
  )
  const ids = new Set<string>(ALWAYS_ON_MODULE_IDS)
  for (const row of rows) {
    if (row.enabled) ids.add(row.module_id)
  }
  for (const id of TOGGLABLE_MODULE_IDS) {
    if (!rows.some((r) => r.module_id === id)) ids.add(id)
  }

  cache = { ids, expiresAt: now + CACHE_MS }
  return ids
}

export async function isModuleEnabled(moduleId: string): Promise<boolean> {
  if (ALWAYS_ON_MODULE_IDS.includes(moduleId as ModuleId)) return true
  const enabled = await getEnabledModuleIds()
  return enabled.has(moduleId)
}

export async function listModuleFlagsForAdmin(): Promise<
  Array<{ moduleId: ModuleId; label: string; description: string; enabled: boolean }>
> {
  const rows = await query<{ module_id: string; enabled: number }>(
    `SELECT module_id, enabled FROM platform_module_flags`,
  )
  const map = new Map(rows.map((r) => [r.module_id, Boolean(r.enabled)]))

  return ERP_MODULES.filter((m) => m.id !== 'platform').map((mod) => ({
    moduleId: mod.id,
    label: mod.label,
    description: mod.description,
    enabled: map.get(mod.id) ?? true,
  }))
}

export async function setModuleEnabled(
  moduleId: string,
  enabled: boolean,
  updatedBy?: string,
): Promise<void> {
  if (ALWAYS_ON_MODULE_IDS.includes(moduleId as ModuleId)) {
    throw new Error('Cannot disable the platform overview module')
  }
  if (!TOGGLABLE_MODULE_IDS.includes(moduleId as ModuleId)) {
    throw new Error('Unknown module')
  }

  await execute(
    `INSERT INTO platform_module_flags (module_id, enabled, updated_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), updated_by = VALUES(updated_by), updated_at = NOW()`,
    [moduleId, enabled ? 1 : 0, updatedBy ?? null],
  )
  invalidateModuleEnablementCache()
}

export async function assertApiModuleEnabled(pathname: string): Promise<void> {
  const moduleId = resolveModuleFromApiPath(pathname)
  if (!moduleId) return
  if (!(await isModuleEnabled(moduleId))) {
    throw forbidden(`The ${moduleId} module is disabled on this platform`)
  }
}

export async function assertDashboardModuleEnabled(pathname: string): Promise<void> {
  const moduleId = resolveModuleFromDashboardPath(pathname)
  if (!moduleId) return
  if (!(await isModuleEnabled(moduleId))) {
    throw forbidden(`This module is disabled on this platform`)
  }
}

export function filterModulesByEnabled<T extends { id: string }>(
  modules: T[],
  enabledIds: Set<string>,
): T[] {
  return modules.filter((m) => enabledIds.has(m.id))
}
