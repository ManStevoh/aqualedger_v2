'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import Link from 'next/link'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { getNavForRole } from '@/lib/platform/modules'
import { legacyRoleToMemberRole } from '@/lib/platform/permissions'
import { ArrowRight, LayoutDashboard } from 'lucide-react'

export default function ModuleDashboardsIndexPage() {
  const { currentRole, enabledModuleIds, modulesLoaded } = useAppStore()
  const modules = useMemo(() => {
    const memberRole = legacyRoleToMemberRole(currentRole)
    return getNavForRole(
      memberRole,
      currentRole,
      modulesLoaded ? enabledModuleIds : ['platform'],
    ).filter((m) => m.id !== 'platform')
  }, [currentRole, enabledModuleIds, modulesLoaded])

  return (
    <DashboardPageLayout
        title="Module dashboards"
        description="Dedicated operational command centers for every ERP module — live KPIs, trends, alerts, and quick links."
        breadcrumbs={[
          { label: 'Command Center', href: '/dashboard' },
          { label: 'Module dashboards' },
        ]}
      >
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const dash = mod.nav.find((n) => n.title === 'Dashboard')
          if (!dash) return null
          return (
            <Link key={mod.id} href={dash.href}>
              <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all group">
                <CardHeader>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-2`}>
                    <mod.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {mod.label}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Open dashboard
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </DashboardPageLayout>
  )
}

