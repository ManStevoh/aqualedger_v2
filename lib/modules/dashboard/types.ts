import type { ModuleId } from '@/lib/platform/modules'

export interface ModuleKpi {
  id: string
  label: string
  value: string | number
  unit?: string
  description?: string
  severity?: 'default' | 'success' | 'warning' | 'critical' | string
  href?: string
}

export interface ModuleTrendPoint {
  label: string
  value: number
}

export interface ModuleTrendSeries {
  id: string
  name: string
  points: ModuleTrendPoint[]
}

export interface ModuleRecentItem {
  id: string
  title: string
  subtitle?: string
  status?: string
  date?: string
  href?: string
}

export interface ModuleAlert {
  message: string
  severity: 'info' | 'warning' | 'critical' | string
  href?: string
}

export interface ModuleDashboardPayload {
  moduleId: ModuleId | string
  title: string
  description: string
  standards: string[]
  periodLabel: string
  kpis: ModuleKpi[]
  trends: ModuleTrendSeries[]
  recent: ModuleRecentItem[]
  alerts: ModuleAlert[]
  quickLinks: { label: string; href: string; title?: string }[]
  refreshedAt: string
}
