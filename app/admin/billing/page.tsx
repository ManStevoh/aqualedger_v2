'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableShell } from '@/components/dashboard/data-table-shell'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Download,
  Loader2,
  Search,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

interface TenantBillingRow {
  tenantId: string
  slug: string
  name: string
  plan: string
  status: string
  limits: { maxUsers: number; maxProducts: number; maxBranches: number }
  usage: { users: number; products: number; branches: number }
  overLimit: { users: boolean; products: boolean; branches: boolean; any: boolean }
  utilizationPct: { users: number; products: number; branches: number }
}

interface PlatformBillingSummary {
  totalTenants: number
  activeTenants: number
  overLimitCount: number
  estimatedMrr: number
  planCounts: Record<string, number>
}

function UsageBar({
  label,
  used,
  max,
  pct,
  over,
}: {
  label: string
  used: number
  max: number
  pct: number
  over: boolean
}) {
  return (
    <div className="space-y-1 w-full sm:min-w-[7rem]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={over ? 'text-destructive font-medium' : ''}>
          {used}/{max}
        </span>
      </div>
      <Progress
        value={pct}
        className={over ? '[&_[data-slot=progress-indicator]]:bg-destructive' : undefined}
      />
    </div>
  )
}

function planBadgeVariant(plan: string) {
  if (plan === 'enterprise') return 'default' as const
  if (plan === 'professional') return 'secondary' as const
  return 'outline' as const
}

export default function PlatformBillingPage() {
  const { currentRole } = useAppStore()
  const [tenants, setTenants] = useState<TenantBillingRow[]>([])
  const [summary, setSummary] = useState<PlatformBillingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { tenants: TenantBillingRow[]; summary: PlatformBillingSummary }
        error?: string
      }>('/api/v2/platform/billing')

      if (!res.success) {
        toast.error(res.error || 'Failed to load billing overview')
      } else {
        setTenants(res.data?.tenants ?? [])
        if (res.data?.summary) setSummary(res.data.summary)
      }
    } catch {
      toast.error('Network error while fetching platform billing overview')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

  const handleTenantAction = async (
    tenantId: string,
    action: 'set_plan' | 'extend_trial' | 'set_status',
    payload: { plan?: string; status?: string; days?: number },
  ) => {
    setProcessingId(tenantId)
    try {
      const res = await authFetchJson<{ success: boolean; message?: string; error?: string }>(
        '/api/v2/platform/tenants/manage',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            action,
            ...payload,
          }),
        },
      )

      if (res.success) {
        toast.success(res.message || 'Tenant updated successfully')
        load()
      } else {
        toast.error(res.error || 'Action failed')
      }
    } catch {
      toast.error('Error updating tenant')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlan = planFilter === 'all' || t.plan.toLowerCase() === planFilter.toLowerCase()
      return matchesSearch && matchesPlan
    })
  }, [tenants, searchQuery, planFilter])

  const exportToCsv = () => {
    if (tenants.length === 0) {
      toast.info('No tenant billing data to export')
      return
    }

    const headers = [
      'Tenant ID',
      'Tenant Name',
      'Slug',
      'Plan',
      'Status',
      'Users (Used/Max)',
      'Products (Used/Max)',
      'Branches (Used/Max)',
      'Over Limit',
    ]

    const rows = filteredTenants.map((t) => [
      t.tenantId,
      `"${t.name.replace(/"/g, '""')}"`,
      t.slug,
      t.plan,
      t.status,
      `${t.usage.users}/${t.limits.maxUsers}`,
      `${t.usage.products}/${t.limits.maxProducts}`,
      `${t.usage.branches}/${t.limits.maxBranches}`,
      t.overLimit.any ? 'Yes' : 'No',
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `aqualedger_tenant_billing_report_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Tenant billing report exported to CSV')
  }

  const overLimitCount = summary?.overLimitCount ?? tenants.filter((t) => t.overLimit.any).length

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
    <DashboardPageLayout
      title="Billing & Subscription Management"
      description="Platform-wide SaaS revenue, tenant tier caps, and 1-click plan management"
    >
      <AdminHubNav />

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalTenants ?? tenants.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.activeTenants ?? tenants.filter((t) => t.status === 'active').length} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Est. Platform MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              KSh {(summary?.estimatedMrr ?? 0).toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tenants Over Limit</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${overLimitCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${overLimitCount > 0 ? 'text-destructive' : ''}`}>
                {overLimitCount}
              </span>
              {overLimitCount > 0 && <Badge variant="destructive">Requires Review</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Exceeding resource caps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tier Distribution</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className="text-[10px]">
                Starter: {summary?.planCounts?.starter ?? 0}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Pro: {summary?.planCounts?.professional ?? 0}
              </Badge>
              <Badge variant="default" className="text-[10px]">
                Ent: {summary?.planCounts?.enterprise ?? 0}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active tier breakdown</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tenant Billing Table with Management Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Tenant Plans & Direct Management Actions
                {overLimitCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {overLimitCount} over limit
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Monitoring {filteredTenants.length} of {tenants.length} tenants — 1-click plan switching, trial extension, and reinstatement
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportToCsv}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Filters & Search toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t mt-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenant name or slug…"
                className="pl-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground shrink-0">Filter tier:</span>
              <div className="flex flex-wrap gap-1">
                {(['all', 'trial', 'starter', 'professional', 'enterprise'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={planFilter === p ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-8 capitalize"
                    onClick={() => setPlanFilter(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading platform billing metrics…
            </div>
          ) : filteredTenants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No matching tenant billing records found</p>
          ) : (
            <div className="overflow-x-auto">
              <DataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead className="text-right">Super Admin Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map((tenant) => (
                      <TableRow key={tenant.tenantId}>
                        <TableCell>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{tenant.slug}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={planBadgeVariant(tenant.plan)} className="capitalize font-bold">
                            {tenant.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <UsageBar
                            label="Users"
                            used={tenant.usage.users}
                            max={tenant.limits.maxUsers}
                            pct={tenant.utilizationPct.users}
                            over={tenant.overLimit.users}
                          />
                        </TableCell>
                        <TableCell>
                          <UsageBar
                            label="Products"
                            used={tenant.usage.products}
                            max={tenant.limits.maxProducts}
                            pct={tenant.utilizationPct.products}
                            over={tenant.overLimit.products}
                          />
                        </TableCell>
                        <TableCell>
                          <UsageBar
                            label="Branches"
                            used={tenant.usage.branches}
                            max={tenant.limits.maxBranches}
                            pct={tenant.utilizationPct.branches}
                            over={tenant.overLimit.branches}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Change Plan Options */}
                            {tenant.plan !== 'professional' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[11px] h-7 px-2"
                                disabled={processingId === tenant.tenantId}
                                onClick={() =>
                                  handleTenantAction(tenant.tenantId, 'set_plan', { plan: 'professional' })
                                }
                              >
                                Set Pro
                              </Button>
                            )}
                            {tenant.plan !== 'enterprise' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[11px] h-7 px-2 bg-primary/5 text-primary"
                                disabled={processingId === tenant.tenantId}
                                onClick={() =>
                                  handleTenantAction(tenant.tenantId, 'set_plan', { plan: 'enterprise' })
                                }
                              >
                                Set Ent
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[11px] h-7 px-2"
                              disabled={processingId === tenant.tenantId}
                              onClick={() =>
                                handleTenantAction(tenant.tenantId, 'extend_trial', { days: 14 })
                              }
                            >
                              +14d Trial
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTableShell>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
