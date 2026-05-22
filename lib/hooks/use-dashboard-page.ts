'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import type { BreadcrumbItemDef } from '@/components/dashboard/module-page-header'
import { resolvePageContext } from '@/lib/platform/page-context'

export function useDashboardPageMeta(overrides?: {
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItemDef[]
}) {
  const pathname = usePathname() ?? '/dashboard'
  return useMemo(() => {
    const ctx = resolvePageContext(pathname)
    return {
      title: overrides?.title ?? ctx.title,
      description: overrides?.description ?? ctx.subtitle,
      breadcrumbs: overrides?.breadcrumbs ?? ctx.breadcrumbs,
      moduleId: ctx.moduleId,
      moduleLabel: ctx.moduleLabel,
    }
  }, [pathname, overrides?.title, overrides?.description, overrides?.breadcrumbs])
}
