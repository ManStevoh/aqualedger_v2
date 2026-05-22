'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  ModulePageHeader,
  type BreadcrumbItemDef,
} from '@/components/dashboard/module-page-header'
import { WorkspaceNav } from '@/components/dashboard/workspace-nav'
import { workspaceNavForPath } from '@/lib/platform/workspace-routes'
import { resolvePageContext } from '@/lib/platform/page-context'
import { cn } from '@/lib/utils'

export interface DashboardPageLayoutProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItemDef[]
  actions?: React.ReactNode
  /** Suppress module workspace tabs (e.g. mobile-focused pages) */
  hideWorkspaceNav?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Standard dashboard page shell: optional workspace nav + module header + content.
 * Used across ERP module pages (commerce, HR, accounting, etc.).
 */
export function DashboardPageLayout({
  title,
  description,
  breadcrumbs: breadcrumbsProp,
  actions,
  hideWorkspaceNav,
  className,
  children,
}: DashboardPageLayoutProps) {
  const pathname = usePathname() ?? '/dashboard'
  const ctx = useMemo(() => resolvePageContext(pathname), [pathname])
  const breadcrumbs = breadcrumbsProp ?? ctx.breadcrumbs
  const workspaceNav = hideWorkspaceNav ? null : workspaceNavForPath(pathname)

  return (
    <div className={cn('space-y-6', className)}>
      {workspaceNav && workspaceNav.length > 0 && <WorkspaceNav items={workspaceNav} />}
      <ModulePageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {children}
    </div>
  )
}
