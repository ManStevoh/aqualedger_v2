'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModulePageHeader } from '@/components/dashboard/module-page-header'
import { KpiStrip } from '@/components/dashboard/kpi-strip'
import { authFetchJson } from '@/lib/api'
import { ERP_MODULES, type ModuleId } from '@/lib/platform/modules'
import type { ModuleDashboardPayload } from '@/lib/modules/dashboard/types'
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ModuleDashboardShellProps {
  moduleId: ModuleId | string
}

export function ModuleDashboardShell({ moduleId }: ModuleDashboardShellProps) {
  const [data, setData] = useState<ModuleDashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const mod = ERP_MODULES.find((m) => m.id === moduleId)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { dashboard: ModuleDashboardPayload } }>(
        `/api/v2/dashboard/modules/${moduleId}`,
      )
      if (res.success && res.data?.dashboard) {
        setData(res.data.dashboard)
      } else {
        toast.error('Could not load module dashboard')
      }
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  useEffect(() => {
    load()
  }, [load])

  const kpiItems =
    data?.kpis.map((k) => ({
      id: k.id,
      title: k.label,
      value: k.value,
      description: k.description,
      href: k.href,
    })) ?? []

  return (
    <div className="space-y-8">
      <ModulePageHeader
        title={data?.title ?? `${mod?.label ?? moduleId} Dashboard`}
        description={
          data?.description ??
          'Live operational KPIs sourced from tenant-scoped database aggregates (ISO 8601 periods).'
        }
        breadcrumbs={[
          { label: 'Command Center', href: '/dashboard' },
          { label: mod?.label ?? String(moduleId), href: `/dashboard/modules/${moduleId}` },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {data && (
        <div className="flex flex-wrap gap-2">
          {data.standards.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">
              {s}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            {data.periodLabel}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            Updated {new Date(data.refreshedAt).toLocaleString()}
          </span>
        </div>
      )}

      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                a.severity === 'critical'
                  ? 'border-red-200 bg-red-50/80 dark:bg-red-950/30'
                  : a.severity === 'warning'
                    ? 'border-amber-200 bg-amber-50/80 dark:bg-amber-950/30'
                    : 'border-sky-200 bg-sky-50/50 dark:bg-sky-950/20'
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{a.message}</span>
              {a.href && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={a.href}>View</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <KpiStrip items={kpiItems} loading={loading} columns={kpiItems.length <= 3 ? 3 : 4} />

      <div className="grid gap-6 lg:grid-cols-3">
        {data?.trends.map((series) => (
          <Card key={series.id} className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{series.name}</CardTitle>
              <CardDescription>{data.periodLabel}</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {series.points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series.points}>
                    <defs>
                      <linearGradient id={`grad-${series.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill={`url(#grad-${series.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-12 text-center">No trend data in period</p>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.quickLinks ?? mod?.nav.slice(0, 6).map((n) => ({ label: n.title, href: n.href })) ?? []).map(
              (link) => (
                <Button key={link.href} variant="outline" className="w-full justify-between" asChild>
                  <Link href={link.href}>
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      {data && data.recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest records in this module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-muted-foreground truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status && <Badge variant="outline">{item.status}</Badge>}
                    {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
                    {item.href && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={item.href}>Open</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {mod && mod.nav.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Module workspace</CardTitle>
            <CardDescription>All tools in {mod.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mod.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-muted/60 transition-colors"
                >
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
