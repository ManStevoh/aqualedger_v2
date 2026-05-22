'use client'

import { use } from 'react'
import Link from 'next/link'
import { ModuleDashboardShell } from '@/components/dashboard/module-dashboard-shell'
import { MODULE_DASHBOARD_IDS } from '@/lib/modules/dashboard/constants'

export default function ModuleDashboardPage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = use(params)

  if (!MODULE_DASHBOARD_IDS.includes(moduleId as (typeof MODULE_DASHBOARD_IDS)[number])) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Module dashboard not found.</p>
        <Link href="/dashboard/modules" className="text-primary underline mt-4 inline-block">
          View all module dashboards
        </Link>
      </div>
    )
  }

  return <ModuleDashboardShell moduleId={moduleId} />
}
