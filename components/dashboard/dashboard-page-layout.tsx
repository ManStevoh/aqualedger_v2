'use client'

import { usePathname } from 'next/navigation'
import { ModulePageHeader, type BreadcrumbItemDef } from '@/components/dashboard/module-page-header'
import { WorkspaceNav } from '@/components/dashboard/workspace-nav'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { workspaceNavForPath } from '@/lib/platform/workspace-routes'
import type { WorkspaceNavItem } from '@/components/dashboard/workspace-nav'

interface DashboardPageLayoutProps {
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItemDef[]
  actions?: React.ReactNode
  workspaceNav?: WorkspaceNavItem[] | null
  hideWorkspaceNav?: boolean
  children: React.ReactNode
}

/** Standard ERP page shell: optional workspace tabs + breadcrumbs + title */
export function DashboardPageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  workspaceNav,
  hideWorkspaceNav = false,
  children,
}: DashboardPageLayoutProps) {
  const pathname = usePathname() ?? '/dashboard'
  const meta = useDashboardPageMeta({ title, description, breadcrumbs })
  const nav = hideWorkspaceNav ? null : (workspaceNav ?? workspaceNavForPath(pathname))

  return (
    <div className="space-y-6">
      {nav && nav.length > 0 && <WorkspaceNav items={nav} />}
      <ModulePageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
        actions={actions}
      />
      {children}
    </div>
  )
}
