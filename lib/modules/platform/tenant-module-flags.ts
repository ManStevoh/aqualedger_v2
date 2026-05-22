import { query, execute } from '@/lib/db'
import { ERP_MODULES, type ModuleId } from '@/lib/platform/modules'

const ALWAYS_ON_MODULE_IDS: ModuleId[] = ['platform']
const TOGGLABLE_MODULE_IDS: ModuleId[] = ERP_MODULES.map((m) => m.id).filter(
  (id): id is ModuleId => id !== 'platform',
)

async function loadPlatformEnabledModuleIds(): Promise<Set<string>> {
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
  return ids
}

export interface TenantModuleFlagView {
  moduleId: ModuleId
  label: string
  description: string
  platformEnabled: boolean
  /** Row exists in tenant_module_flags */
  hasOverride: boolean
  /** Effective for this tenant (platform ceiling + override) */
  enabled: boolean
}

/**
 * Merge platform defaults with per-tenant module overrides and legacy feature-flag disables.
 */
export function mergeTenantEnabledModuleIds(
  platformIds: Set<string>,
  overrides: Array<{ module_id: string; enabled: boolean | number }>,
  featureFlagDisabledModuleIds: string[] = [],
): Set<string> {
  const ids = new Set(platformIds)

  for (const row of overrides) {
    if (!TOGGLABLE_MODULE_IDS.includes(row.module_id as ModuleId)) continue
    if (row.enabled) {
      if (platformIds.has(row.module_id)) ids.add(row.module_id)
    } else {
      ids.delete(row.module_id)
    }
  }

  for (const moduleId of featureFlagDisabledModuleIds) {
    ids.delete(moduleId)
  }

  for (const id of ALWAYS_ON_MODULE_IDS) {
    ids.add(id)
  }

  return ids
}

export async function listTenantModuleFlags(tenantId: string): Promise<TenantModuleFlagView[]> {
  const platformIds = await loadPlatformEnabledModuleIds()
  const rows = await query<{ module_id: string; enabled: number }>(
    `SELECT module_id, enabled FROM tenant_module_flags WHERE tenant_id = ?`,
    [tenantId],
  )
  const overrideMap = new Map(rows.map((r) => [r.module_id, Boolean(r.enabled)]))

  return ERP_MODULES.filter((m) => m.id !== 'platform').map((mod) => {
    const platformEnabled = platformIds.has(mod.id)
    const hasOverride = overrideMap.has(mod.id)
    const overrideEnabled = overrideMap.get(mod.id)
    const enabled = hasOverride
      ? Boolean(overrideEnabled && platformEnabled)
      : platformEnabled

    return {
      moduleId: mod.id,
      label: mod.label,
      description: mod.description,
      platformEnabled,
      hasOverride,
      enabled,
    }
  })
}

export async function getTenantModuleOverrides(
  tenantId: string,
): Promise<Array<{ module_id: string; enabled: boolean }>> {
  const rows = await query<{ module_id: string; enabled: number }>(
    `SELECT module_id, enabled FROM tenant_module_flags WHERE tenant_id = ?`,
    [tenantId],
  )
  return rows.map((r) => ({ module_id: r.module_id, enabled: Boolean(r.enabled) }))
}

export async function setTenantModuleFlags(
  tenantId: string,
  updates: Array<{ moduleId: ModuleId; enabled: boolean }>,
  updatedBy?: string,
): Promise<TenantModuleFlagView[]> {
  const platformIds = await loadPlatformEnabledModuleIds()

  for (const item of updates) {
    if (!TOGGLABLE_MODULE_IDS.includes(item.moduleId)) {
      throw new Error(`Unknown or non-togglable module: ${item.moduleId}`)
    }
    if (ALWAYS_ON_MODULE_IDS.includes(item.moduleId)) {
      throw new Error(`Cannot override module: ${item.moduleId}`)
    }

    const platformEnabled = platformIds.has(item.moduleId)
    const inherit = item.enabled === platformEnabled

    if (inherit) {
      await execute(
        `DELETE FROM tenant_module_flags WHERE tenant_id = ? AND module_id = ?`,
        [tenantId, item.moduleId],
      )
      continue
    }

    if (item.enabled && !platformEnabled) {
      throw new Error(
        `Cannot enable ${item.moduleId} for this tenant — module is disabled platform-wide`,
      )
    }

    await execute(
      `INSERT INTO tenant_module_flags (tenant_id, module_id, enabled, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), updated_by = VALUES(updated_by), updated_at = NOW()`,
      [tenantId, item.moduleId, item.enabled ? 1 : 0, updatedBy ?? null],
    )
  }

  return listTenantModuleFlags(tenantId)
}
