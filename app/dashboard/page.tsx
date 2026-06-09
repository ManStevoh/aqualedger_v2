'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bell,
  ClipboardList,
  Package,
  Ship,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Truck,
  MapPin,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useBrand } from '@/components/branding/brand-provider'

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  investor: 'Platform Operator',
  user: 'User',
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

function BulkBuyerDashboard() {
  const brand = useBrand()
  const { currentUser, tenantSlug } = useAppStore()
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Order Placement State
  const [orderModal, setOrderModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [orderQty, setOrderQty] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [lRes, oRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { listings: any[] } }>('/api/v2/marketplace?status=available&limit=50'),
        authFetchJson<{ success: boolean; data?: { orders: any[] } }>('/api/v2/orders?role=buyer&limit=50'),
      ])

      if (lRes.success && lRes.data?.listings) setListings(lRes.data.listings)
      if (oRes.success && oRes.data?.orders) setOrders(oRes.data.orders)
    } catch (err) {
      console.error('Error fetching bulk buyer portal data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePlaceOrder = async () => {
    if (!orderQty || parseFloat(orderQty) <= 0) {
      toast.error('Enter a valid quantity')
      return
    }
    if (parseFloat(orderQty) > selectedListing.available_quantity_kg) {
      toast.error('Insufficient available stock')
      return
    }
    if (!deliveryAddress.trim()) {
      toast.error('Enter a delivery address')
      return
    }

    setOrderLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string; data?: { orderId: string } }>('/api/v2/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ listingId: selectedListing.id, quantity: parseFloat(orderQty) }],
          deliveryAddress: deliveryAddress.trim(),
          deliveryNotes: deliveryNotes.trim() || undefined,
        }),
      })

      if (!res.success) {
        toast.error(res.error || 'Failed to place order')
        setOrderLoading(false)
        return
      }

      toast.success('Wholesale order placed!')
      setOrderModal(false)

      setOrderQty('')
      setDeliveryAddress('')
      setDeliveryNotes('')
      loadData()
    } catch {
      toast.error('Network error')
    } finally {
      setOrderLoading(false)
    }
  }

  const kes = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <DashboardPageLayout
      title={`${brand.appName} B2B Command Center`}
      description="Direct wholesale purchasing and logistics tracking."
      breadcrumbs={[{ label: 'B2B Portal', href: '/dashboard' }, { label: 'Command Center' }]}
    >
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Premium Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-xl lg:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-32 w-32 translate-y-12 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <Badge className="bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/35">B2B Wholesale Portal</Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {currentUser?.name}</h1>
              <p className="text-sm text-slate-300/90 max-w-md">Browse available wholesale catches and track your order logistics in real-time.</p>
            </div>
            {tenantSlug && (
              <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white shrink-0 gap-2">
                <Link href={`/store/${tenantSlug}`} target="_blank">
                  Visit Retail Storefront
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* KPI Summary Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="relative overflow-hidden border-border/40 bg-card transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Available Batches</CardDescription>
              <Package className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active wholesale listings on the marketplace</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-card transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">My Orders</CardDescription>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total wholesale purchases placed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column: Logistics (3/5 cols) */}
          <div className="space-y-6 lg:col-span-3">
            {/* Orders & Logistics Tracking */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-blue-500" /> Logistics Tracking</CardTitle>
                <CardDescription>Track your pending delivery logistics and status.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No wholesale orders placed yet.</div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {orders.map((o) => (
                      <div key={o.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold">Order #{o.order_number || o.id.slice(0, 8)}</span>
                            <p className="text-xs text-muted-foreground">{o.items?.[0]?.quantity_kg ? `${Number(o.items[0].quantity_kg).toLocaleString()} kg of ${o.items[0].species_name || o.items[0].fish_type}` : 'Wholesale package'}</p>
                          </div>
                          <Badge className={
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            o.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }>{o.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {o.delivery_address || 'Wholesale Depot'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Wholesale Marketplace Catalog (2/5 cols) */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-emerald-500" /> B2B Wholesale Shop</CardTitle>
                <CardDescription>Order fish batches directly. Discounts are applied based on wholesale volume.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {listings.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No wholesale fish listings currently available.</div>
                ) : (
                  <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
                    {listings.map((l) => (
                      <div key={l.id} className="p-4 space-y-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-semibold">{l.fish_type} <span className="text-xs text-muted-foreground">({l.grade ? `Grade ${l.grade}` : 'Grade A'})</span></h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {l.landing_site_name || 'Coastal site'}</p>
                          </div>
                          <span className="text-sm font-bold text-primary">{kes(Number(l.price_per_kg))}/kg</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">Stock: <strong className="text-foreground">{Number(l.available_quantity_kg).toLocaleString()} kg</strong></span>
                          <Button size="sm" onClick={() => {
                            setSelectedListing(l)
                            setOrderModal(true)
                          }} className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5">
                            Order batch
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Batch Dialog */}
        <Dialog open={orderModal} onOpenChange={setOrderModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Place Wholesale Order: {selectedListing?.fish_type}</DialogTitle>
              <DialogDescription>Create a bulk order from available landing-site stock.</DialogDescription>
            </DialogHeader>
            {selectedListing && (
              <div className="space-y-4 py-3">
                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-xs">Landing site</span>
                    <strong className="text-foreground">{selectedListing.landing_site_name || 'Coastal site'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Stock available</span>
                    <strong className="text-foreground">{Number(selectedListing.available_quantity_kg).toLocaleString()} kg</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Wholesale price</span>
                    <strong className="text-foreground">{kes(Number(selectedListing.price_per_kg))}/kg</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Grade</span>
                    <strong className="text-foreground">{selectedListing.grade || 'A'}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="orderQty">Purchase Quantity (kg)</Label>
                  <Input id="orderQty" type="number" placeholder="Enter weight in kg" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} max={selectedListing.available_quantity_kg} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Input id="deliveryAddress" placeholder="Wholesale depot, restaurant depot..." value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deliveryNotes">Special Delivery Instructions</Label>
                  <Input id="deliveryNotes" placeholder="Ice specifications, timing, driver contact info..." value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} />
                </div>

                {orderQty && parseFloat(orderQty) > 0 && (
                  <div className="border-t border-border/40 pt-3 text-sm space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{kes(parseFloat(orderQty) * Number(selectedListing.price_per_kg))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>16% VAT</span>
                      <span>{kes(parseFloat(orderQty) * Number(selectedListing.price_per_kg) * 0.16)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-foreground pt-1 border-t border-dashed border-border/40">
                      <span>Total Amount</span>
                      <span>{kes(parseFloat(orderQty) * Number(selectedListing.price_per_kg) * 1.16)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={handlePlaceOrder} disabled={orderLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                {orderLoading ? 'Processing wholesale checkout...' : 'Submit Wholesale Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageLayout>
  )
}

export default function DashboardPage() {
  const { currentRole, currentUser, memberRole, enabledModuleIds, modulesLoaded } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (currentRole === 'super_admin') {
      router.replace('/admin')
    } else if (memberRole === 'vendor') {
      router.replace('/dashboard/vendor')
    }
  }, [currentRole, memberRole, router])

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
    const resolvedRole = memberRole ?? legacyRoleToMemberRole(currentRole)
    return getNavForRole(
      resolvedRole,
      currentRole,
      modulesLoaded ? enabledModuleIds : ['platform'],
    ).filter((m) => m.id !== 'platform')
  }, [currentRole, memberRole, enabledModuleIds, modulesLoaded])

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

  if (memberRole === 'customer') {
    return <BulkBuyerDashboard />
  }

  if (memberRole === 'vendor') {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

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

