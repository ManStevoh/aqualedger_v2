'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableShell } from '@/components/dashboard/data-table-shell'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { authFetchJson } from '@/lib/api'
import {
  TrendingUp,
  ShoppingBag,
  Banknote,
  FileSpreadsheet,
  Users,
  Package,
} from 'lucide-react'

type SalesReport = {
  periodDays: number
  summary: {
    grossSales: number
    deliveredSales: number
    paidSales: number
    unpaidSales: number
    orderCount: number
    deliveredCount: number
    avgOrderValue: number
    contractOpenValue: number
    contractActiveCount: number
  }
  monthlyTrend: { month: string; sales: number; orders: number }[]
  byStatus: { status: string; count: number; amount: number }[]
  byPaymentStatus: { paymentStatus: string; count: number; amount: number }[]
  topCustomers: { name: string; orders: number; amount: number }[]
  topProducts: { name: string; quantityKg: number; amount: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    buyerName: string
    total: number
    status: string
    paymentStatus: string
    createdAt: string
  }[]
}

function kes(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`
}

export default function SalesTrackingPage() {
  const meta = useDashboardPageMeta({
    title: 'Sales',
    description: 'Track marketplace and storefront revenue, orders, and forward contracts',
  })
  const [period, setPeriod] = useState('30')
  const [scope, setScope] = useState<'tenant' | 'mine'>('tenant')
  const [canViewTenant, setCanViewTenant] = useState(true)
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (scope === 'mine') params.set('scope', 'mine')
      const res = await authFetchJson<{
        success: boolean
        data?: { report: SalesReport; canViewTenant?: boolean }
      }>(`/api/v2/commerce/sales?${params}`)
      if (res.success && res.data?.report) {
        setReport(res.data.report)
        if (res.data.canViewTenant === false) {
          setCanViewTenant(false)
          setScope('mine')
        } else {
          setCanViewTenant(true)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [period, scope])

  useEffect(() => {
    load()
  }, [load])

  const s = report?.summary

  return (
    <DashboardPageLayout
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      actions={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {canViewTenant && (
            <Tabs value={scope} onValueChange={(v) => setScope(v as 'tenant' | 'mine')}>
              <TabsList className="flex-wrap h-auto w-full sm:w-auto">
                <TabsTrigger value="tenant" className="min-h-11 flex-1 sm:flex-none">
                  All sales
                </TabsTrigger>
                <TabsTrigger value="mine" className="min-h-11 flex-1 sm:flex-none">
                  My sales
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="flex-wrap h-auto w-full sm:w-auto">
              <TabsTrigger value="7" className="min-h-11">7d</TabsTrigger>
              <TabsTrigger value="30" className="min-h-11">30d</TabsTrigger>
              <TabsTrigger value="90" className="min-h-11">90d</TabsTrigger>
              <TabsTrigger value="365" className="min-h-11">1y</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="min-h-11 flex-1 sm:flex-none" asChild>
              <Link href="/dashboard/orders">Orders</Link>
            </Button>
            <Button variant="outline" size="sm" className="min-h-11 flex-1 sm:flex-none" asChild>
              <Link href="/dashboard/commerce/contracts">Contracts</Link>
            </Button>
          </div>
        </div>
      }
    >
      <StatCardGrid className="md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross sales"
          value={loading ? '…' : kes(s?.grossSales ?? 0)}
          description={`${s?.orderCount ?? 0} orders · last ${period} days`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Delivered"
          value={loading ? '…' : kes(s?.deliveredSales ?? 0)}
          description={`${s?.deliveredCount ?? 0} completed deliveries`}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Collected (paid)"
          value={loading ? '…' : kes(s?.paidSales ?? 0)}
          description={loading ? '' : `Outstanding: ${kes(s?.unpaidSales ?? 0)}`}
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg order value"
          value={loading ? '…' : kes(s?.avgOrderValue ?? 0)}
          description={
            loading
              ? ''
              : `${s?.contractActiveCount ?? 0} active contracts · ${kes(s?.contractOpenValue ?? 0)} open`
          }
          icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales trend</CardTitle>
            <CardDescription>Monthly order revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {loading || !report?.monthlyTrend.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No sales in this period</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => kes(v)} />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By order status</CardTitle>
            <CardDescription>Revenue and count per status</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {loading || !report?.byStatus.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => kes(v)} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !report?.topCustomers.length ? (
              <p className="text-sm text-muted-foreground">No customers yet</p>
            ) : (
              <ul className="space-y-2">
                {report.topCustomers.map((c) => (
                  <li key={c.name} className="flex justify-between text-sm">
                    <span>
                      {c.name}{' '}
                      <span className="text-muted-foreground">({c.orders} orders)</span>
                    </span>
                    <span className="font-medium">{kes(c.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !report?.topProducts.length ? (
              <p className="text-sm text-muted-foreground">No line items yet</p>
            ) : (
              <ul className="space-y-2">
                {report.topProducts.map((p) => (
                  <li key={p.name} className="flex justify-between text-sm">
                    <span>
                      {p.name}{' '}
                      <span className="text-muted-foreground">({p.quantityKg.toFixed(1)} kg)</span>
                    </span>
                    <span className="font-medium">{kes(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sales</CardTitle>
          <CardDescription>Latest orders in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !report?.recentOrders.length ? (
            <p className="text-sm text-muted-foreground">No orders in this period.</p>
          ) : (
            <DataTableShell label="Recent sales orders">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                    <TableCell>{o.buyerName}</TableCell>
                    <TableCell>{kes(o.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/orders/${o.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </DataTableShell>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
