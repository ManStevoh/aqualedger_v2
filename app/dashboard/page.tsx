'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  ClipboardList,
  Package,
  Ship,
  ShoppingCart,
  Snowflake,
  Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SetupChecklist } from '@/components/dashboard/setup-checklist'
import { WidgetCustomizer } from '@/components/dashboard/widget-customizer'
import { KpiStrip } from '@/components/dashboard/kpi-strip'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useAppStore } from '@/lib/store'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { authFetchJson, useExecutiveSummary, useNotifications } from '@/lib/api'
import { getNavForRole } from '@/lib/platform/modules'
import { legacyRoleToMemberRole } from '@/lib/platform/permissions'
import type { UserRole } from '@/lib/types'

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  investor: 'Platform Operator',
  boat_owner: 'Boat Owner',
  fisherman: 'Fisherman',
  fish_buyer: 'Fish Buyer',
  bmu_official: 'BMU Official',
}

const QUICK_ACTIONS = [
  {
    id: 'new-order',
    label: 'Create order',
    description: 'Record a commerce order',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    id: 'log-catch',
    label: 'Log catch',
    description: 'Record landing weight',
    href: '/dashboard/catches',
    icon: Ship,
  },
  {
    id: 'check-inventory',
    label: 'Check stock',
    description: 'View inventory levels',
    href: '/dashboard/inventory',
    icon: Package,
  },
  {
    id: 'cold-alerts',
    label: 'Cold alerts',
    description: 'Review temperature breaches',
    href: '/dashboard/coldchain/alerts',
    icon: Snowflake,
  },
  {
    id: 'procurement',
    label: 'Purchase order',
    description: 'Raise supplier PO',
    href: '/dashboard/procurement/orders',
    icon: ClipboardList,
  },
  {
    id: 'ai-insights',
    label: 'AI insights',
    description: 'Demand & yield forecasts',
    href: '/dashboard/ai',
    icon: Sparkles,
  },
] as const

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

type OnboardingStatus = {
  isComplete: boolean
  completedCount: number
  totalSteps: number
}

export default function DashboardPage() {
  const { currentRole, currentUser, enabledModuleIds, modulesLoaded } = useAppStore()
  const meta = useDashboardPageMeta({
    title: `${APP_NAME} Command Center`,
    description: `Welcome back${currentUser?.name ? `, ${currentUser.name}` : ''}. ${APP_TAGLINE}`,
    breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Command Center' }],
  })
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)
  const { data: summary, isLoading: kpisLoading } = useExecutiveSummary()
  const { data: notificationsData, isLoading: activityLoading } = useNotifications(
    currentUser?.id,
  )

  const modules = useMemo(() => {
    const memberRole = legacyRoleToMemberRole(currentRole)
    return getNavForRole(
      memberRole,
      currentRole,
      modulesLoaded ? enabledModuleIds : ['platform'],
    ).filter((m) => m.id !== 'platform')
  }, [currentRole, enabledModuleIds, modulesLoaded])

  const recentActivity = (notificationsData?.items ?? []).slice(0, 8)

  useEffect(() => {
    authFetchJson<{
      success: boolean
      data?: {
        isComplete: boolean
        onboarding: { completed_steps: number[]; totalSteps: number } | null
      }
    }>('/api/v2/tenant/onboarding')
      .then((res) => {
        if (!res.success || !res.data) return
        if (res.data.isComplete || !res.data.onboarding) {
          setOnboardingStatus({ isComplete: true, completedCount: 0, totalSteps: 0 })
          return
        }
        const { completed_steps, totalSteps } = res.data.onboarding
        setOnboardingStatus({
          isComplete: false,
          completedCount: completed_steps.length,
          totalSteps: totalSteps,
        })
      })
      .catch(() => {})
  }, [])

  const showSetupChecklist =
    onboardingStatus !== null && !onboardingStatus.isComplete

  const kpiItems = [
    {
      id: 'fleet',
      title: 'Fleet vessels',
      value: summary?.fleetCount ?? '—',
      description: summary ? `${summary.activeFleetCount} active` : undefined,
      icon: <Ship className="h-4 w-4" />,
    },
    {
      id: 'orders',
      title: 'Orders',
      value: summary?.ordersCount ?? '—',
      description: 'Commerce orders',
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: summary ? formatCurrency(summary.revenueTotal) : '—',
      description: 'Order totals',
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: 'cold-alerts',
      title: 'Cold alerts',
      value: summary?.openColdAlertsCount ?? '—',
      description: summary
        ? `${summary.coldAlertsCount} total recorded`
        : undefined,
      icon: <Snowflake className="h-4 w-4" />,
    },
  ]

  return (
    <DashboardPageLayout
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      hideWorkspaceNav
      className="space-y-8"
      actions={
        <div className="flex items-center gap-2">
          <WidgetCustomizer />
          <Badge variant="secondary" className="font-normal">
            {roleLabels[currentRole]}
          </Badge>
        </div>
      }
    >
      {showSetupChecklist && (
        <SetupChecklist
          completedSteps={onboardingStatus.completedCount}
          totalSteps={onboardingStatus.totalSteps}
        />
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Executive summary</h2>
        <KpiStrip items={kpiItems} loading={kpisLoading} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.id} href={action.href}>
                <Card className="h-full transition-all hover:border-primary/25 hover:shadow-md hover:shadow-primary/5">
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">{action.label}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/notifications">View all</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {activityLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No recent activity"
                  description="Notifications and alerts will appear here."
                  actionLabel="Open inbox"
                  actionHref="/dashboard/notifications"
                  className="border-0"
                />
              ) : (
                <ul className="divide-y">
                  {recentActivity.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.action_url || '/dashboard/notifications'}
                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            item.is_read ? 'bg-muted-foreground/30' : 'bg-primary'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.message}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatRelativeTime(item.created_at)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Your modules</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/modules">All dashboards</Link>
              </Button>
              <Badge variant="outline" className="font-normal">
                {modules.length} modules
              </Badge>
            </div>
          </div>

          {modules.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No modules available"
              description="Contact your administrator to request access."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((mod) => {
                const ModuleIcon = mod.icon
                const primaryHref = mod.nav[0]?.href ?? '/dashboard'

                return (
                  <Card
                    key={mod.id}
                    className="group overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className={`h-1 bg-gradient-to-r ${mod.color}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${mod.color}`}
                        >
                          <ModuleIcon className="h-5 w-5 text-white" />
                        </div>
                        <Link
                          href={primaryHref}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Open ${mod.label}`}
                        >
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                      <CardTitle className="text-lg">{mod.label}</CardTitle>
                      <CardDescription>{mod.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {mod.nav.slice(0, 4).map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        )
                      })}
                      {mod.nav.length > 4 && (
                        <p className="px-2 text-xs text-muted-foreground">
                          +{mod.nav.length - 4} more
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardPageLayout>
  )
}
