import { query, execute } from '@/lib/db'
import type { ModuleId } from '@/lib/platform/modules'

export const TENANT_FEATURE_FLAG_KEYS = ['marketplace', 'ai', 'advanced_analytics'] as const

export type TenantFeatureFlagKey = (typeof TENANT_FEATURE_FLAG_KEYS)[number]

export interface TenantFeatureFlag {
  flagKey: TenantFeatureFlagKey
  label: string
  description: string
  enabled: boolean
}

const FLAG_META: Record<TenantFeatureFlagKey, { label: string; description: string }> = {
  marketplace: {
    label: 'Marketplace',
    description: 'B2B/B2C marketplace listings and vendor hub',
  },
  ai: {
    label: 'AI & Automation',
    description: 'Forecasting, assistant, and AI insights',
  },
  advanced_analytics: {
    label: 'Advanced analytics',
    description: 'Extended BI dashboards and scheduled reports',
  },
}

/** Maps tenant feature flags to ERP module ids for enablement filtering */
export const TENANT_FLAG_TO_MODULE: Record<TenantFeatureFlagKey, ModuleId> = {
  marketplace: 'commerce',
  ai: 'ai',
  advanced_analytics: 'analytics',
}

export async function listTenantFeatureFlags(tenantId: string): Promise<TenantFeatureFlag[]> {
  const rows = await query<{ flag_key: string; enabled: number }>(
    `SELECT flag_key, enabled FROM tenant_feature_flags WHERE tenant_id = ?`,
    [tenantId],
  )
  const map = new Map(rows.map((r) => [r.flag_key, Boolean(r.enabled)]))

  return TENANT_FEATURE_FLAG_KEYS.map((flagKey) => ({
    flagKey,
    label: FLAG_META[flagKey].label,
    description: FLAG_META[flagKey].description,
    enabled: map.get(flagKey) ?? true,
  }))
}

export async function getTenantFeatureFlagsMap(tenantId: string): Promise<Map<string, boolean>> {
  const flags = await listTenantFeatureFlags(tenantId)
  return new Map(flags.map((f) => [f.flagKey, f.enabled]))
}

export async function setTenantFeatureFlags(
  tenantId: string,
  updates: Array<{ flagKey: TenantFeatureFlagKey; enabled: boolean }>,
): Promise<TenantFeatureFlag[]> {
  for (const item of updates) {
    if (!TENANT_FEATURE_FLAG_KEYS.includes(item.flagKey)) {
      throw new Error(`Unknown feature flag: ${item.flagKey}`)
    }
    await execute(
      `INSERT INTO tenant_feature_flags (tenant_id, flag_key, enabled)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), updated_at = NOW()`,
      [tenantId, item.flagKey, item.enabled ? 1 : 0],
    )
  }
  return listTenantFeatureFlags(tenantId)
}
