import type { ModuleId } from '@/lib/platform/modules'

/** Module IDs with dedicated dashboard pages (keep in sync with HANDLERS in module-summaries.ts). */
export const MODULE_DASHBOARD_IDS = [
  'fishing',
  'commerce',
  'inventory',
  'coldchain',
  'procurement',
  'crm',
  'accounting',
  'logistics',
  'hr',
  'analytics',
  'notifications',
  'integrations',
  'ai',
  'tenant',
] as const satisfies readonly ModuleId[]
