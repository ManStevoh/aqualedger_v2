'use client'

import { useMemo } from 'react'
import { TrendingUp, Ship, Fish, DollarSign, Anchor, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { useAppStore } from '@/lib/store'
import { useDashboardStats, useRevenueData, useTrips, useInvestments, useFishOrders, useCatches } from '@/lib/api'
import type { Catch, FishOrder, FishingTrip, UserRole } from '@/lib/types'
import { hasFullSystemAccess } from '@/lib/platform-access'

function activityTimeLabel(iso?: string): string {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return '—'
  const sec = Math.floor((Date.now() - t) / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function DashboardPage() {
  const { currentRole, currentUser } = useAppStore()
  const { data: statsData, isLoading: statsLoading } = useDashboardStats(currentRole, currentUser?.id)
  const { data: revenueData } = useRevenueData()
  const { data: tripsData } = useTrips()
  const { data: investmentsData } = useInvestments(
    hasFullSystemAccess(currentRole as UserRole) ? undefined : currentUser?.id,
  )
  const orderHookRole =
    hasFullSystemAccess((currentUser?.role || currentRole) as UserRole)
      ? 'seller'
      : currentUser?.role === 'fish_buyer'
        ? 'buyer'
        : 'seller'
  const { data: ordersData } = useFishOrders(orderHookRole)
  const { data: catchesData } = useCatches({ limit: '8' })

  const stats = statsData?.data
  const revenue = revenueData?.data || []
  const trips = tripsData?.data?.items || []
  const investments = investmentsData?.data?.items || []
  const orders = ordersData?.data?.items || []
  const recentCatches = catchesData?.data?.items || []

  type ActivityRow = {
    id: string
    kind: 'catch' | 'order' | 'trip'
    title: string
    subtitle: string
    atMs: number
  }

  const recentActivity = useMemo(() => {
    const rows: ActivityRow[] = []
    for (const c of recentCatches as Catch[]) {
      const atMs = c.loggedAt ? Date.parse(c.loggedAt) : 0
      rows.push({
        id: `catch-${c.id}`,
        kind: 'catch',
        title: `Catch: ${c.weight.toLocaleString()} kg ${c.fishType}`,
        subtitle: `KES ${c.totalValue.toLocaleString()} · trip`,
        atMs,
      })
    }
    for (const o of orders as FishOrder[]) {
      const atMs = o.createdAt ? Date.parse(o.createdAt) : 0
      rows.push({
        id: `order-${o.id}`,
        kind: 'order',
        title: `Order ${o.status}: ${o.quantity} kg ${o.fishType}`,
        subtitle: `${o.buyerName} → ${o.sellerName}`,
        atMs,
      })
    }
    for (const trip of trips as FishingTrip[]) {
      if (trip.status !== 'completed') continue
      const raw = trip.endTime || trip.startTime
      const atMs = raw ? Date.parse(raw) : 0
      rows.push({
        id: `trip-${trip.id}`,
        kind: 'trip',
        title: `Trip completed: ${trip.boatName}`,
        subtitle: `${trip.totalCatch.toLocaleString()} kg · KES ${trip.totalRevenue.toLocaleString()}`,
        atMs,
      })
    }
    return rows
      .filter((r) => r.atMs > 0)
      .sort((a, b) => b.atMs - a.atMs)
      .slice(0, 8)
  }, [recentCatches, orders, trips])

  // Role-specific stats
  const getStatCards = () => {
    switch (currentRole) {
      case 'boat_owner':
        return (
          <>
            <StatCard
              title="Total Boats"
              value={stats?.totalBoats || 0}
              icon={<Ship className="h-4 w-4 text-muted-foreground" />}
              description="in your fleet"
              loading={statsLoading}
            />
            <StatCard
              title="Active Trips"
              value={stats?.activeTrips || 0}
              icon={<Anchor className="h-4 w-4 text-muted-foreground" />}
              description="currently ongoing"
              loading={statsLoading}
            />
            <StatCard
              title="Total Catch"
              value={`${((stats?.totalCatch || 0) / 1000).toFixed(1)}T`}
              icon={<Fish className="h-4 w-4 text-muted-foreground" />}
              trend={{ value: 8.3, isPositive: true }}
              description="this month"
              loading={statsLoading}
            />
            <StatCard
              title="Net Profit"
              value={`KES ${(stats?.netProfit || 0).toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              trend={{ value: 15.2, isPositive: true }}
              description="this month"
              loading={statsLoading}
            />
          </>
        )
      case 'fish_buyer':
        return (
          <>
            <StatCard
              title="Active Orders"
              value={orders.filter((o: { status: string }) => o.status === 'pending' || o.status === 'shipped').length}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
              description="in progress"
              loading={statsLoading}
            />
            <StatCard
              title="Total Purchased"
              value={`${(orders.reduce((s: number, o: { quantity: number }) => s + o.quantity, 0) / 1000).toFixed(1)}T`}
              icon={<Fish className="h-4 w-4 text-muted-foreground" />}
              description="this month"
              loading={statsLoading}
            />
            <StatCard
              title="Total Spent"
              value={`KES ${orders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0).toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              description="this month"
              loading={statsLoading}
            />
            <StatCard
              title="Avg Order Value"
              value={`KES ${orders.length > 0 ? Math.round(orders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0) / orders.length).toLocaleString() : 0}`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description="per order"
              loading={statsLoading}
            />
          </>
        )
      default:
        return (
          <>
            <StatCard
              title="Total Investments"
              value={`KES ${(stats?.totalInvestments || 0).toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              trend={{ value: 12.5, isPositive: true }}
              description="platform-wide"
              loading={statsLoading}
            />
            <StatCard
              title="Active Boats"
              value={stats?.totalBoats || 0}
              icon={<Ship className="h-4 w-4 text-muted-foreground" />}
              description="registered vessels"
              loading={statsLoading}
            />
            <StatCard
              title="Total Catch"
              value={`${((stats?.totalCatch || 0) / 1000).toFixed(1)}T`}
              icon={<Fish className="h-4 w-4 text-muted-foreground" />}
              trend={{ value: 8.3, isPositive: true }}
              description="this month"
              loading={statsLoading}
            />
            <StatCard
              title="Total Revenue"
              value={`KES ${(stats?.totalRevenue || 0).toLocaleString()}`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              trend={{ value: 15.2, isPositive: true }}
              description="this month"
              loading={statsLoading}
            />
          </>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}. Here&apos;s your overview.
        </p>
      </div>

      <StatCardGrid>{getStatCards()}</StatCardGrid>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
            <CardDescription>Monthly revenue and profit analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip
                    formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#0088FE"
                    fill="#0088FE"
                    fillOpacity={0.3}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stackId="2"
                    stroke="#00C49F"
                    fill="#00C49F"
                    fillOpacity={0.3}
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No recent catches, orders, or completed trips yet.
              </p>
            ) : (
              recentActivity.map((item) => {
                const iconWrap =
                  item.kind === 'catch'
                    ? 'bg-green-100'
                    : item.kind === 'trip'
                      ? 'bg-sky-100'
                      : 'bg-purple-100'
                const Icon =
                  item.kind === 'catch' ? Fish : item.kind === 'trip' ? Anchor : ShoppingCart
                const iconColor =
                  item.kind === 'catch' ? 'text-green-600' : item.kind === 'trip' ? 'text-sky-600' : 'text-purple-600'
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {activityTimeLabel(new Date(item.atMs).toISOString())}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Trips</CardTitle>
              <CardDescription>Currently ongoing fishing operations</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips.filter((t: { status: string }) => t.status === 'ongoing').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active trips</p>
              ) : (
                trips
                  .filter((t: { status: string }) => t.status === 'ongoing')
                  .slice(0, 3)
                  .map((trip: { id: string; boatName: string; fishingZone: string; captainName: string; startTime: string }) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Anchor className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{trip.boatName}</p>
                          <p className="text-xs text-muted-foreground">{trip.fishingZone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ongoing
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Captain: {trip.captainName}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Investment Portfolio Summary */}
        {hasFullSystemAccess(currentRole as UserRole) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Investment Portfolio</CardTitle>
                <CardDescription>
                  {currentRole === 'investor' ? 'Platform and your investments' : 'Platform-wide investments'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.slice(0, 3).map((inv: { id: string; packageName: string; amount: number; expectedReturn: number; dividendsPaid: number; status: string }) => (
                  <div key={inv.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{inv.packageName}</span>
                      <Badge variant={inv.status === 'active' ? 'default' : 'secondary'}>
                        {inv.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        KES {inv.amount.toLocaleString()}
                      </span>
                      <span className="text-green-600">
                        +KES {inv.dividendsPaid.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(() => {
                        const target = Math.max(1, inv.expectedReturn - inv.amount)
                        return Math.min(100, (inv.dividendsPaid / target) * 100)
                      })()}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Activity for Fish Buyers */}
        {currentRole === 'fish_buyer' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your purchase history</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 4).map((order: { id: string; fishType: string; quantity: number; totalAmount: number; status: string }) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{order.fishType}</p>
                      <p className="text-xs text-muted-foreground">{order.quantity}kg</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KES {order.totalAmount.toLocaleString()}</p>
                      <Badge
                        variant="outline"
                        className={
                          order.status === 'delivered'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
