import type { Permission } from '@/lib/platform/permissions'
import type { ModuleId } from '@/lib/platform/modules'

export const MODULE_DASHBOARD_PERMISSION: Record<string, Permission> = {
  fishing: 'fishing.catches.read',
  commerce: 'commerce.orders.read',
  inventory: 'inventory.stock.read',
  coldchain: 'coldchain.facilities.read',
  procurement: 'procurement.orders.read',
  crm: 'crm.customers.read',
  accounting: 'accounting.ledger.read',
  logistics: 'logistics.deliveries.read',
  hr: 'hr.employees.read',
  analytics: 'analytics.dashboard.read',
  notifications: 'notifications.read',
  integrations: 'integrations.read',
  ai: 'ai.forecast.read',
  tenant: 'tenant.settings.read',
}

export function permissionForModuleDashboard(moduleId: string): Permission | null {
  return MODULE_DASHBOARD_PERMISSION[moduleId] ?? null
}

export function isValidModuleDashboardId(moduleId: string): moduleId is ModuleId {
  return moduleId in MODULE_DASHBOARD_PERMISSION
}
