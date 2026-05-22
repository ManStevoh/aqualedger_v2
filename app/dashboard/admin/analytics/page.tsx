'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { BarChart3, Shield, Loader2, DollarSign, ShoppingCart, Building2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface PlatformAnalytics {
  revenue30d: number
  orders30d: number
  paidOrders30d: number
  planBreakdown: { plan: string; count: number }[]
  topTenants: {
    tenantId: string
    tenantName: string
    slug: string
    plan: string
    status: string
    orderCount30d: number
    revenue30d: number
    memberCount: number
  }[]
  signupsByDay: { date: string; count: number }[]
}

function formatKes(n: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function PlatformAnalyticsPage() {
  const meta = useDashboardPageMeta()

  const { currentRole } = useAppStore()
  const [data, setData] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { analytics: PlatformAnalytics } }>(
        '/api/v2/platform/analytics',
      )
      if (res.success && res.data?.analytics) {
        setData(res.data.analytics)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

  if (currentRole !== 'super_admin') {
    return (
      <div className="py-12 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-medium">Super administrator access required</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<AdminHubNav />

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics…
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="GMV (30d)"
              value={formatKes(data.revenue30d)}
              icon={<DollarSign className="h-4 w-4" />}
              description="Order totals across all tenants"
            />
            <StatCard
              title="Orders (30d)"
              value={String(data.orders30d)}
              icon={<ShoppingCart className="h-4 w-4" />}
              description={`${data.paidOrders30d} paid`}
            />
            <StatCard
              title="Top tenant GMV"
              value={data.topTenants[0] ? formatKes(data.topTenants[0].revenue30d) : '—'}
              icon={<Building2 className="h-4 w-4" />}
              description={data.topTenants[0]?.tenantName ?? 'No orders yet'}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Signups (14 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.signupsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" name="Signups" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans</CardTitle>
                <CardDescription>Tenant distribution by subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.planBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Tenants" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top tenants by revenue</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topTenants.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No tenant revenue data</p>
              ) : (
                data.topTenants.map((t) => (
                  <div
                    key={t.tenantId}
                    className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{t.tenantName}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{t.slug}</span>
                      <Badge variant="outline" className="ml-2">
                        {t.plan}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatKes(t.revenue30d)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.orderCount30d} orders · {t.memberCount} members
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </DashboardPageLayout>
  )
}

