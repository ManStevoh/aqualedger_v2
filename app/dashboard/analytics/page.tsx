'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, DollarSign, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Ship, Snowflake, ClipboardList } from 'lucide-react'
import { authFetchJson } from '@/lib/api'

type AnalyticsShape = {
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  monthlyRevenue: { month: string; revenue: number; expenses: number }[]
  fishTypeBreakdown: { type: string; sales: number }[]
  expenseByCategory: { name: string; value: number }[]
  topRevenueDays: { day: string; revenue: number; trend: 'up' | 'down' }[]
  portfolioPerformance: { month: string; value: number; returns: number }[]
  portfolioSummary: { currentValue: number; totalReturns: number; avgAnnualPct: number }
  enterpriseKpis: { label: string; value: string }[]
}

export default function AnalyticsPage() {
  const meta = useDashboardPageMeta()

  const [analyticsData, setAnalyticsData] = useState<AnalyticsShape | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const fin = await authFetchJson<{
        success: boolean
        data?: {
          summary?: { totalRevenue?: number; totalExpenses?: number; netProfit?: number }
          monthlyProfitLoss?: { month: string; revenue: number; expenses: number }[]
          expensesByCategory?: { category: string; total: number }[]
        }
      }>('/api/v2/analytics?type=financial&period=365')

      const dash = await authFetchJson<{
        success: boolean
        data?: { topSpecies?: { species_name: string; total_value: number }[] }
      }>('/api/v2/analytics?type=dashboard')

      const catchesAn = await authFetchJson<{
        success: boolean
        data?: { dailyTrend?: { date: string; total_value: number }[] }
      }>('/api/v2/analytics?type=catches&period=365')

      const commerceRes = await authFetchJson<{
        success: boolean
        data?: { name: string; value: number }[]
      }>('/api/v2/analytics?type=commerce-revenue')

      const revenue = Number(fin.data?.summary?.totalRevenue) || 0
      const expenses = Number(fin.data?.summary?.totalExpenses) || 0
      const profit =
        fin.data?.summary?.netProfit != null
          ? Number(fin.data.summary.netProfit)
          : revenue - expenses
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
      const monthlyRevenue = (fin.data?.monthlyProfitLoss || []).map((m) => ({
        month: m.month,
        revenue: Number(m.revenue) || 0,
        expenses: Number(m.expenses) || 0,
      }))
      let fishTypeBreakdown = (dash.data?.topSpecies || []).map((s) => ({
        type: s.species_name || 'Unknown',
        sales: Number(s.total_value) || 0,
      }))
      if (commerceRes.success && Array.isArray(commerceRes.data) && commerceRes.data.length > 0) {
        fishTypeBreakdown = commerceRes.data.map((r) => ({
          type: r.name,
          sales: Number(r.value) || 0,
        }))
      }

      const expenseByCategory = (fin.data?.expensesByCategory || []).map((e) => ({
        name: String(e.category || 'other').replace(/_/g, ' '),
        value: Number(e.total) || 0,
      }))

      const sortedDays = [...(catchesAn.data?.dailyTrend || [])].sort(
        (a, b) => (Number(b.total_value) || 0) - (Number(a.total_value) || 0),
      )
      const topRevenueDays = sortedDays.slice(0, 5).map((d, i, arr) => ({
        day: d.date,
        revenue: Number(d.total_value) || 0,
        trend:
          i < arr.length - 1 && (Number(d.total_value) || 0) >= (Number(arr[i + 1]?.total_value) || 0)
            ? ('up' as const)
            : ('down' as const),
      }))

      const portfolioPerformance = monthlyRevenue.map((m) => ({
        month: m.month,
        value: m.revenue,
        returns: m.revenue - m.expenses,
      }))
      const currentValue = revenue
      const totalReturns = profit
      const avgAnnualPct = profitMargin

      let enterpriseKpis: { label: string; value: string }[] = []
      try {
        const kpiRes = await authFetchJson<{
          success: boolean
          data?: { kpis?: { metric: string; value: string; unit: string }[] }
        }>('/api/v2/analytics/export?type=kpi&format=json')
        if (kpiRes.success && kpiRes.data?.kpis) {
          enterpriseKpis = kpiRes.data.kpis.map((k) => ({
            label: k.metric,
            value: k.unit === 'KES' ? `KES ${Number(k.value).toLocaleString()}` : k.value,
          }))
        }
      } catch {
        enterpriseKpis = []
      }

      setAnalyticsData({
        revenue,
        expenses,
        profit,
        profitMargin,
        monthlyRevenue,
        fishTypeBreakdown,
        expenseByCategory,
        topRevenueDays,
        portfolioPerformance,
        portfolioSummary: {
          currentValue,
          totalReturns,
          avgAnnualPct,
        },
        enterpriseKpis,
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setAnalyticsData({
        revenue: 0,
        expenses: 0,
        profit: 0,
        profitMargin: 0,
        monthlyRevenue: [],
        fishTypeBreakdown: [],
        expenseByCategory: [],
        topRevenueDays: [],
        portfolioPerformance: [],
        portfolioSummary: { currentValue: 0, totalReturns: 0, avgAnnualPct: 0 },
        enterpriseKpis: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analyticsData) return <div className="flex items-center justify-center h-96">Loading...</div>

  const {
    revenue,
    expenses,
    profit,
    profitMargin,
    monthlyRevenue,
    fishTypeBreakdown,
    expenseByCategory,
    topRevenueDays,
    portfolioPerformance,
    portfolioSummary,
    enterpriseKpis,
  } = analyticsData

  const fleetBoats = enterpriseKpis.find((k) => k.label === 'Fleet boats')?.value ?? '0'
  const activeFleet = enterpriseKpis.find((k) => k.label === 'Active fleet')?.value ?? '0'
  const coldZones = enterpriseKpis.find((k) => k.label === 'Cold chain zones')?.value ?? '0'
  const coldAlerts = enterpriseKpis.find((k) => k.label === 'Open cold chain alerts')?.value ?? '0'
  const purchaseOrders = enterpriseKpis.find((k) => k.label === 'Purchase orders')?.value ?? '0'
  const suppliers = enterpriseKpis.find((k) => k.label === 'Suppliers')?.value ?? '0'

  const kes = (v: number) => `KES ${Number(v).toLocaleString()}`

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`KES ${revenue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Expenses"
          value={`KES ${expenses.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Net Profit"
          value={`KES ${profit.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Profit Margin"
          value={`${profitMargin}%`}
          icon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Fleet boats" value={fleetBoats} icon={<Ship className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Active fleet" value={activeFleet} icon={<Ship className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Cold chain zones" value={coldZones} icon={<Snowflake className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Cold chain alerts" value={coldAlerts} icon={<Snowflake className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Purchase orders" value={purchaseOrders} icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Suppliers" value={suppliers} icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="portfolio">Commerce</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => kes(value)} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense vs Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => kes(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by species</CardTitle>
                <CardDescription>From logged catches (dashboard scope)</CardDescription>
              </CardHeader>
              <CardContent>
                {fishTypeBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No species revenue data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={fishTypeBreakdown.map((f) => ({ name: f.type, value: f.sales }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${kes(Number(value))}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fishTypeBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => kes(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top catch value days</CardTitle>
                <CardDescription>By total catch value from daily trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRevenueDays.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No daily catch trend yet</p>
                  ) : (
                    topRevenueDays.map((item) => (
                      <div key={item.day} className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="font-medium">{item.day}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{kes(item.revenue)}</span>
                          {item.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Fish Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fishTypeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => kes(value)} />
                    <Bar dataKey="sales" fill="#3b82f6" name="Sales Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense breakdown</CardTitle>
                <CardDescription>Approved expenses by category (period)</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No expense categories in range</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${kes(Number(value))}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => kes(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
              <CardDescription>Portfolio value and returns over time</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  No commerce revenue history yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={portfolioPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: number) => kes(value)} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Principal (KES)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="returns"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Dividends (KES)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Principal invested</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{kes(portfolioSummary.currentValue)}</p>
                <p className="text-sm text-muted-foreground mt-2">Sum of active positions in range</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dividends paid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{kes(portfolioSummary.totalReturns)}</p>
                <p className="text-sm text-muted-foreground mt-2">Recorded paid returns</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg expected uplift</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{portfolioSummary.avgAnnualPct.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-2">(expected − principal) / principal</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  )
}

