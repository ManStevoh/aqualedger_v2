import type { BreadcrumbItemDef } from '@/components/dashboard/module-page-header'
import { ERP_MODULES, type ErpModule, type ModuleId } from './modules'

const ADMIN_SEGMENTS: Record<string, string> = {
  tenants: 'Tenants',
  users: 'Users',
  analytics: 'Analytics',
  payments: 'Payments',
  billing: 'Billing',
  modules: 'Modules',
  audit: 'Audit',
  health: 'Health',
  settings: 'Settings',
  security: 'Security',
}

function humanizeSegment(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function findBestNavMatch(pathname: string): {
  module: ErpModule
  item: (typeof ERP_MODULES)[0]['nav'][0]
} | null {
  let best: { module: ErpModule; item: (typeof ERP_MODULES)[0]['nav'][0]; len: number } | null =
    null

  for (const mod of ERP_MODULES) {
    for (const item of mod.nav) {
      const base = item.href.split('?')[0]
      const matches =
        pathname === item.href ||
        pathname === base ||
        (base !== '/dashboard' && pathname.startsWith(`${base}/`)) ||
        (base !== '/dashboard' && pathname.startsWith(base + '?'))

      if (matches) {
        const len = base.length
        if (!best || len > best.len) {
          best = { module: mod, item, len }
        }
      }
    }
  }

  return best ? { module: best.module, item: best.item } : null
}

export interface PageContext {
  title: string
  subtitle?: string
  moduleId: ModuleId | null
  moduleLabel: string | null
  breadcrumbs: BreadcrumbItemDef[]
}

export function resolvePageContext(pathname: string): PageContext {
  if (pathname === '/dashboard') {
    return {
      title: 'Command Center',
      subtitle: 'Executive summary and quick actions',
      moduleId: 'platform',
      moduleLabel: 'Overview',
      breadcrumbs: [{ label: 'Command Center' }],
    }
  }

  if (pathname.startsWith('/dashboard/modules')) {
    const parts = pathname.split('/').filter(Boolean)
    const moduleId = parts[2] as ModuleId | undefined
    const mod = moduleId ? ERP_MODULES.find((m) => m.id === moduleId) : null
    if (mod) {
      return {
        title: `${mod.label} dashboard`,
        subtitle: mod.description,
        moduleId: mod.id,
        moduleLabel: mod.label,
        breadcrumbs: [
          { label: 'Command Center', href: '/dashboard' },
          { label: 'Modules', href: '/dashboard/modules' },
          { label: mod.label },
        ],
      }
    }
    return {
      title: 'Module dashboards',
      subtitle: 'KPI command centers per ERP module',
      moduleId: 'platform',
      moduleLabel: 'Overview',
      breadcrumbs: [
        { label: 'Command Center', href: '/dashboard' },
        { label: 'Modules' },
      ],
    }
  }

  if (pathname.startsWith('/dashboard/admin')) {
    const segment = pathname.split('/')[3]
    const pageLabel = segment ? (ADMIN_SEGMENTS[segment] ?? humanizeSegment(segment)) : 'Platform admin'
    return {
      title: segment ? pageLabel : 'Platform admin',
      subtitle: 'Cross-tenant operations and system control',
      moduleId: 'platform',
      moduleLabel: 'Platform',
      breadcrumbs: [
        { label: 'Command Center', href: '/dashboard' },
        { label: 'Platform admin', href: '/dashboard/admin' },
        ...(segment ? [{ label: pageLabel }] : []),
      ],
    }
  }

  if (pathname === '/dashboard/onboarding') {
    return {
      title: 'Setup',
      subtitle: 'Complete your organization profile',
      moduleId: 'tenant',
      moduleLabel: 'Organization',
      breadcrumbs: [{ label: 'Setup' }],
    }
  }

  const match = findBestNavMatch(pathname)
  if (match) {
    const { module, item } = match
    const crumbs: BreadcrumbItemDef[] = [
      { label: 'Command Center', href: '/dashboard' },
      { label: module.label, href: `/dashboard/modules/${module.id}` },
      { label: item.title },
    ]
    return {
      title: item.title,
      subtitle: module.description,
      moduleId: module.id,
      moduleLabel: module.label,
      breadcrumbs: crumbs,
    }
  }

  const segments = pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1] ?? 'Dashboard'
  const title = humanizeSegment(last)

  return {
    title,
    subtitle: undefined,
    moduleId: null,
    moduleLabel: null,
    breadcrumbs: [
      { label: 'Command Center', href: '/dashboard' },
      { label: title },
    ],
  }
}

/** Auto breadcrumbs for ModulePageHeader — omit title on current page when using header chrome */
export function breadcrumbsForPage(
  pathname: string,
  overrides?: BreadcrumbItemDef[],
): BreadcrumbItemDef[] {
  if (overrides?.length) return overrides
  return resolvePageContext(pathname).breadcrumbs
}
