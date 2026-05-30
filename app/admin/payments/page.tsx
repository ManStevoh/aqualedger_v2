'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import {
  CreditCard,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentIntentItem {
  id: string
  tenantId: string
  tenantName: string
  tenantSlug: string
  orderId: string | null
  provider: string
  amount: number
  currency: string
  status: string
  externalRef: string | null
  createdAt: string
}

interface PaymentStats {
  periodDays: number
  total: number
  byStatus: Record<string, number>
  totalAmount: number
  succeededAmount: number
}

interface PaymentsResponse {
  items: PaymentIntentItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUSES = ['pending', 'processing', 'succeeded', 'completed', 'failed', 'cancelled'] as const
const PROVIDERS = ['mpesa', 'stripe', 'paystack', 'cash', 'bank'] as const

interface ReconcileSummary {
  mpesaPending: number
  webhooks24h: number
  webhooksFailed: number
  lastRun: {
    created_at: string
    reconciled: number
    failed: number
    matched: number
    trigger_source: string
  } | null
}

function formatKes(n: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)
}

function statusBadgeVariant(status: string) {
  if (status === 'succeeded' || status === 'completed') return 'default' as const
  if (status === 'failed' || status === 'cancelled') return 'destructive' as const
  if (status === 'processing') return 'secondary' as const
  return 'outline' as const
}

export default function PlatformPaymentsPage() {
  const { currentRole } = useAppStore()
  const [items, setItems] = useState<PaymentIntentItem[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('all')
  const [provider, setProvider] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [reconciling, setReconciling] = useState(false)
  const [monitor, setMonitor] = useState<ReconcileSummary | null>(null)
  const limit = 25

  const loadMonitor = useCallback(async () => {
    const res = await authFetchJson<{
      success: boolean
      data?: { summary?: ReconcileSummary }
    }>('/api/v2/platform/payments/reconcile')
    if (res.success && res.data?.summary) setMonitor(res.data.summary)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      if (provider !== 'all') params.set('provider', provider)
      params.set('limit', String(limit))
      params.set('page', String(page))

      const res = await authFetchJson<{
        success: boolean
        data?: { payments: PaymentsResponse; stats?: PaymentStats }
        error?: string
      }>(`/api/v2/platform/payments?${params.toString()}`)

      if (!res.success) {
        toast.error(res.error || 'Failed to load payments')
        return
      }

      setItems(res.data?.payments.items ?? [])
      setTotalPages(res.data?.payments.totalPages ?? 0)
      setTotal(res.data?.payments.total ?? 0)
      if (res.data?.stats) setStats(res.data.stats)
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [status, provider, page])

  useEffect(() => {
    if (currentRole === 'super_admin') {
      load()
      loadMonitor()
    }
  }, [currentRole, load, loadMonitor])

  useEffect(() => {
    setPage(1)
  }, [status, provider])

  const reconcile = async () => {
    setReconciling(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { reconciled: number; failed: number; matched: number }
        error?: string
      }>('/api/v2/platform/payments/reconcile', { method: 'POST' })
      if (!res.success) {
        toast.error(res.error || 'Reconcile failed')
        return
      }
      const { reconciled = 0, failed = 0, matched = 0 } = res.data ?? {}
      toast.success(`Reconciled ${reconciled}: ${failed} stale failed, ${matched} orders matched`)
      await Promise.all([load(), loadMonitor()])
    } catch {
      toast.error('Network error')
    } finally {
      setReconciling(false)
    }
  }

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

  const pendingCount =
    (stats?.byStatus.pending ?? 0) + (stats?.byStatus.processing ?? 0)
  const succeededCount =
    (stats?.byStatus.succeeded ?? 0) + (stats?.byStatus.completed ?? 0)
  const failedCount =
    (stats?.byStatus.failed ?? 0) + (stats?.byStatus.cancelled ?? 0)

  return (
    <DashboardPageLayout title="Payments monitor" description="Cross-tenant payment intents and activity (last 7 days stats)">


      <AdminHubNav />

      <StatCardGrid>
        <StatCard
          title="Intents (7d)"
          value={stats?.total ?? '—'}
          description={`${stats?.periodDays ?? 7}-day window`}
          icon={<CreditCard className="h-4 w-4" />}
          loading={loading && !stats}
        />
        <StatCard
          title="Succeeded"
          value={succeededCount}
          description={formatKes(stats?.succeededAmount ?? 0)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          loading={loading && !stats}
        />
        <StatCard
          title="Pending / processing"
          value={pendingCount}
          icon={<Clock className="h-4 w-4" />}
          loading={loading && !stats}
        />
        <StatCard
          title="Failed / cancelled"
          value={failedCount}
          icon={<XCircle className="h-4 w-4" />}
          loading={loading && !stats}
        />
      </StatCardGrid>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation & webhooks</CardTitle>
          <CardDescription>
            Automated via <code className="text-xs">npm run reconcile:payments</code> (CRON_SECRET).
            {monitor?.lastRun
              ? ` Last run ${String(monitor.lastRun.created_at).slice(0, 19)} (${monitor.lastRun.trigger_source}): ${monitor.lastRun.reconciled} actions.`
              : ' No runs yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">M-Pesa pending</span>
            <p className="font-semibold">{monitor?.mpesaPending ?? '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Webhooks (24h)</span>
            <p className="font-semibold">{monitor?.webhooks24h ?? '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Webhook failures (24h)</span>
            <p className="font-semibold text-destructive">{monitor?.webhooksFailed ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Payment intents</CardTitle>
            <CardDescription>
              {total} intent{total === 1 ? '' : 's'}
              {status !== 'all' || provider !== 'all' ? ' (filtered)' : ''}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              disabled={reconciling || loading}
              onClick={reconcile}
            >
              {reconciling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Reconcile
            </Button>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="filter-control">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="filter-control">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payments…
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payment intents match your filters</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <DataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.tenantName}</div>
                          <div className="font-mono text-xs text-muted-foreground">{item.tenantSlug}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.provider}</Badge>
                        </TableCell>
                        <TableCell>{formatKes(item.amount, item.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.orderId ? item.orderId.slice(0, 8) + '…' : '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">
                          {item.externalRef ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {String(item.createdAt).replace('T', ' ').slice(0, 19)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </DataTableShell>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
