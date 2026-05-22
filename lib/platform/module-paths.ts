import { ERP_MODULES, type ModuleId } from './modules'

const API_SEGMENT_MODULE: Record<string, ModuleId> = {
  tenant: 'tenant',
  users: 'tenant',
  workflows: 'tenant',
  boats: 'fishing',
  trips: 'fishing',
  catches: 'fishing',
  bmu: 'fishing',
  'landing-sites': 'fishing',
  licenses: 'fishing',
  'fish-species': 'fishing',
  traceability: 'fishing',
  'fishing-ops': 'fishing',
  fishing: 'fishing',
  cooperative: 'fishing',
  export: 'fishing',
  maintenance: 'fishing',
  climate: 'fishing',
  risk: 'fishing',
  offline: 'fishing',
  commerce: 'commerce',
  marketplace: 'commerce',
  catalog: 'commerce',
  orders: 'commerce',
  payments: 'commerce',
  inventory: 'inventory',
  storage: 'coldchain',
  coldchain: 'coldchain',
  procurement: 'procurement',
  crm: 'crm',
  'credit-score': 'crm',
  accounting: 'accounting',
  wallet: 'accounting',
  expenses: 'accounting',
  logistics: 'logistics',
  hr: 'hr',
  analytics: 'analytics',
  communications: 'analytics',
  notifications: 'notifications',
  integrations: 'integrations',
  ai: 'ai',
  investments: 'accounting',
  'investment-packages': 'accounting',
  dashboard: 'platform',
  'digital-identity': 'tenant',
}

export const API_ALWAYS_ALLOWED_PREFIXES = [
  '/api/v2/auth/',
  '/api/v2/platform/modules',
  '/api/health',
  '/api/auth/',
]

export const DASHBOARD_ALWAYS_ALLOWED_PREFIXES = ['/dashboard/admin/modules']

export function resolveModuleFromApiPath(pathname: string): ModuleId | null {
  for (const prefix of API_ALWAYS_ALLOWED_PREFIXES) {
    if (pathname.startsWith(prefix)) return null
  }
  const match = pathname.match(/^\/api\/v2\/([^/]+)/)
  if (!match) return null
  return API_SEGMENT_MODULE[match[1]] ?? null
}

export function resolveModuleFromDashboardPath(pathname: string): ModuleId | null {
  for (const prefix of DASHBOARD_ALWAYS_ALLOWED_PREFIXES) {
    if (pathname.startsWith(prefix)) return null
  }
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/modules')) {
    return 'platform'
  }

  for (const mod of ERP_MODULES) {
    if (mod.id === 'platform') continue
    for (const item of mod.nav) {
      if (
        pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)) ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href))
      ) {
        return mod.id
      }
    }
  }

  const dashMatch = pathname.match(/^\/dashboard\/([^/]+)/)
  if (!dashMatch) return null
  const segment = dashMatch[1]
  const prefixMap: Record<string, ModuleId> = {
    organization: 'tenant',
    team: 'tenant',
    settings: 'tenant',
    users: 'tenant',
    admin: 'analytics',
    fleet: 'fishing',
    trips: 'fishing',
    catches: 'fishing',
    licenses: 'fishing',
    'landing-sites': 'fishing',
    bmu: 'fishing',
    traceability: 'fishing',
    maintenance: 'fishing',
    catalog: 'commerce',
    marketplace: 'commerce',
    orders: 'commerce',
    vendor: 'commerce',
    wallet: 'accounting',
    expenses: 'accounting',
    inventory: 'inventory',
    storage: 'coldchain',
    coldchain: 'coldchain',
    procurement: 'procurement',
    crm: 'crm',
    'credit-score': 'crm',
    logistics: 'logistics',
    hr: 'hr',
    analytics: 'analytics',
    communications: 'analytics',
    notifications: 'notifications',
    integrations: 'integrations',
    ai: 'ai',
    climate: 'fishing',
    mobile: 'fishing',
    risk: 'fishing',
    investments: 'accounting',
    portfolio: 'accounting',
    export: 'fishing',
  }
  return prefixMap[segment] ?? null
}
