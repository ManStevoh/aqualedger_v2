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
  Wallet,
  Calculator,
  FileSpreadsheet,
  Plus,
  Star,
  Activity,
  Clock,
  CheckCircle2,
  Truck,
  FileCheck,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  PlusCircle,
  TrendingUp,
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
  const { currentUser } = useAppStore()
  const [wallet, setWallet] = useState<{ balance: number } | null>(null)
  const [creditScore, setCreditScore] = useState<{ score: number; grade: string } | null>(null)
  const [contracts, setContracts] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Topup Wallet State
  const [topUpModal, setTopUpModal] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpPhone, setTopUpPhone] = useState(currentUser?.phone || '')
  const [topUpLoading, setTopUpLoading] = useState(false)

  // Order Placement State
  const [orderModal, setOrderModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [orderQty, setOrderQty] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'invoice'>('wallet')
  const [orderLoading, setOrderLoading] = useState(false)

  // Pay Invoice State
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

  // Trace State
  const [traceModal, setTraceModal] = useState(false)
  const [traceChain, setTraceChain] = useState<any>(null)
  const [traceLoading, setTraceLoading] = useState(false)
  const [traceLotCode, setTraceLotCode] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [wRes, csRes, cRes, iRes, lRes, oRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { wallet: { balance: number } } }>('/api/v2/wallet?action=balance'),
        authFetchJson<{ success: boolean; data?: { score: number; grade: string } }>('/api/v2/credit-score'),
        authFetchJson<{ success: boolean; data?: { contracts: any[] } }>('/api/v2/commerce/contracts'),
        authFetchJson<{ success: boolean; data?: { invoices: any[] } }>('/api/v2/accounting/ar'),
        authFetchJson<{ success: boolean; data?: { listings: any[] } }>('/api/v2/marketplace?status=available&limit=50'),
        authFetchJson<{ success: boolean; data?: { orders: any[] } }>('/api/v2/orders?role=buyer&limit=50'),
      ])

      if (wRes.success && wRes.data?.wallet) setWallet(wRes.data.wallet)
      if (csRes.success && csRes.data) setCreditScore(csRes.data)
      if (cRes.success && cRes.data?.contracts) setContracts(cRes.data.contracts)
      if (iRes.success && iRes.data?.invoices) setInvoices(iRes.data.invoices)
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

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setTopUpLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; message?: string }>('/api/v2/wallet', {
        method: 'POST',
        body: JSON.stringify({
          action: 'deposit',
          paymentMethod: 'mpesa',
          amount: parseFloat(topUpAmount),
          phoneNumber: topUpPhone,
          description: 'B2B Portal deposit',
        }),
      })
      if (res.success) {
        toast.success(res.message || 'Deposit simulated successfully!')
        setTopUpModal(false)
        setTopUpAmount('')
        loadData()
      } else {
        toast.error('Deposit failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setTopUpLoading(false)
    }
  }

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

      const orderId = res.data?.orderId

      const invRes = await authFetchJson<{ success: boolean; error?: string; data?: { invoice?: { id: string } } }>('/api/v2/accounting/ar/from-order', {
        method: 'POST',
        body: JSON.stringify({ orderId, postToGl: true }),
      })

      if (paymentMethod === 'wallet' && orderId) {
        const arRes = await authFetchJson<{ success: boolean; data?: { invoices: any[] } }>(`/api/v2/accounting/ar?status=sent`)
        const matchingInvoice = arRes.data?.invoices?.find((i) => i.order_id === orderId)
        if (matchingInvoice) {
          toast.info('Settling invoice instantly from wallet...')
          const payRes = await authFetchJson<{ success: boolean; error?: string }>(`/api/v2/accounting/ar/${matchingInvoice.id}/pay`, {
            method: 'POST',
          })
          if (payRes.success) {
            toast.success('Order paid instantly via Wallet balance!')
          } else {
            toast.error(payRes.error || 'Auto-payment failed. Please pay manually.')
          }
        }
      }

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

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(`/api/v2/accounting/ar/${invoiceId}/pay`, {
        method: 'POST',
      })
      if (res.success) {
        toast.success('Invoice paid successfully via wallet!')
        loadData()
      } else {
        toast.error(res.error || 'Payment failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setPayingInvoiceId(null)
    }
  }

  const handleTraceLot = async (lotCode: string) => {
    setTraceLotCode(lotCode)
    setTraceModal(true)
    setTraceLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { chain: any } }>(`/api/v2/traceability/chain?lotCode=${lotCode}`)
      if (res.success && res.data?.chain) {
        setTraceChain(res.data.chain)
      } else {
        setTraceChain(null)
        toast.error('Trace data not found')
      }
    } catch {
      toast.error('Failed to load trace chain')
    } finally {
      setTraceLoading(false)
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

  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'void')

  return (
    <DashboardPageLayout
      title="B2B Buyer Command Center"
      description="Commercial bulk purchasing, forward contracts, and wallet reconciliation."
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'B2B Command Center' }]}
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
              <p className="text-sm text-slate-300/90 max-w-md">Manage your active forward contracts, wallet balances, invoices, and purchase fresh fish catalog directly from landing sites.</p>
            </div>
            <Button onClick={() => setTopUpModal(true)} className="w-fit bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md transition-all shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Top-Up Wallet
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-border/40 bg-card transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Wallet Balance</CardDescription>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{kes(wallet?.balance ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Available for B2B instant checkout</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-card transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">B2B Credit Score</CardDescription>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{creditScore?.score ?? '—'}</span>
                <Badge className={
                  creditScore?.grade === 'A' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  creditScore?.grade === 'B' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-amber-100 text-amber-800 border-amber-200'
                }>Grade {creditScore?.grade ?? '—'}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Trust rating for wholesale credit</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-card transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Active Contracts</CardDescription>
              <FileSpreadsheet className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total wholesale forward agreements</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-card transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-amber-500 to-orange-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Unpaid Invoices</CardDescription>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{unpaidInvoices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Value: {kes(unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0))}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column: Contracts, Invoices, Logistics (3/5 cols) */}
          <div className="space-y-6 lg:col-span-3">
            {/* Active Forward Contracts */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-purple-500" /> Active B2B Forward Contracts</CardTitle>
                <CardDescription>Deliveries are tracked against your contracted volumes in real-time.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {contracts.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No active contracts found. Contact sales to open one.</div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {contracts.map((c) => {
                      const progress = Number(c.contracted_kg) > 0 ? Math.min(100, Math.round((Number(c.delivered_kg) / Number(c.contracted_kg)) * 100)) : 0
                      return (
                        <div key={c.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-semibold">{c.contract_number}</span>
                            <Badge variant="outline">{c.species_name || 'All Species'}</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Delivered Volume</span>
                              <span>{Number(c.delivered_kg).toLocaleString()} / {Number(c.contracted_kg).toLocaleString()} kg ({progress}%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground pt-1">
                            <span>Price: <strong className="text-foreground">{kes(Number(c.price_per_kg))}/kg</strong></span>
                            <span>Terms: <strong className="text-foreground">{c.payment_terms || 'Net 30'}</strong></span>
                            <span>Expires: <strong className="text-foreground">{new Date(c.end_date).toLocaleDateString()}</strong></span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outstanding Invoices */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-500" /> Unpaid Invoices</CardTitle>
                <CardDescription>Settle B2B accounts instantly using your wallet balance.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {unpaidInvoices.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">All invoices are settled. Outstanding balance is KES 0.</div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {unpaidInvoices.map((inv) => (
                      <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold">{inv.invoice_number}</span>
                            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-800 border-amber-100">{inv.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Order: #{inv.order_number || inv.order_id?.slice(0, 8)} · Due {new Date(inv.due_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-base font-bold text-slate-800 dark:text-slate-100">{kes(Number(inv.total_amount))}</span>
                          <Button size="sm" onClick={() => handlePayInvoice(inv.id)} disabled={payingInvoiceId === inv.id} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-8 px-3 text-xs">
                            {payingInvoiceId === inv.id ? 'Paying...' : 'Pay with Wallet'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders & Logistics Tracking */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-blue-500" /> Logistics & Traceability</CardTitle>
                <CardDescription>Track your pending delivery logistics and inspect catch provenance chains.</CardDescription>
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
                          {o.items?.[0]?.lot_code && (
                            <Button size="sm" variant="link" onClick={() => handleTraceLot(o.items[0].lot_code)} className="h-auto p-0 text-xs text-primary font-semibold flex items-center gap-0.5">
                              <Activity className="h-3 w-3" /> Trace provenance
                            </Button>
                          )}
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

        {/* Topup Wallet Dialog */}
        <Dialog open={topUpModal} onOpenChange={setTopUpModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Top-Up Wallet via M-Pesa</DialogTitle>
              <DialogDescription>Simulate instant sandbox wallet deposits by entering amount and phone number.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="topUpAmount">Amount (KES)</Label>
                <Input id="topUpAmount" type="number" placeholder="Enter deposit amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topUpPhone">Phone number (M-Pesa)</Label>
                <Input id="topUpPhone" placeholder="+2547XXXXXXXX" value={topUpPhone} onChange={(e) => setTopUpPhone(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleTopUp} disabled={topUpLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                {topUpLoading ? 'Processing simulated deposit...' : 'Fund Wallet (instant)'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

                <div className="space-y-1.5">
                  <Label>Payment Mode</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <Button type="button" variant={paymentMethod === 'wallet' ? 'default' : 'outline'} onClick={() => setPaymentMethod('wallet')} className="text-xs h-9 justify-center">Instant checkout (Wallet)</Button>
                    <Button type="button" variant={paymentMethod === 'invoice' ? 'default' : 'outline'} onClick={() => setPaymentMethod('invoice')} className="text-xs h-9 justify-center">On Credit (Invoice Me)</Button>
                  </div>
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

        {/* Traceability Lot Dialog */}
        <Dialog open={traceModal} onOpenChange={setTraceModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-500 animate-pulse" /> Provenance Audit: {traceLotCode}</DialogTitle>
              <DialogDescription>Full blockchain-style traceability from landing catches to cold chain compliance logs.</DialogDescription>
            </DialogHeader>
            {traceLoading ? (
              <div className="flex py-12 justify-center items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : traceChain ? (
              <div className="space-y-4 py-2 text-sm">
                <div className="space-y-3 relative border-l border-emerald-500/30 pl-4 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-sm" />
                    <strong className="block text-foreground text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Catch Recorded</strong>
                    <p className="text-muted-foreground text-xs mt-0.5">Vessel: <strong className="text-foreground">{traceChain.lot?.vessel_name || 'Co-op Vessel'}</strong></p>
                    <p className="text-muted-foreground text-xs">Species: <strong className="text-foreground">{traceChain.lot?.species_name || 'Fresh Catch'}</strong></p>
                    <p className="text-muted-foreground text-xs">Date: <strong className="text-foreground">{traceChain.lot?.catch_date ? new Date(traceChain.lot.catch_date).toLocaleDateString() : 'Recent'}</strong></p>
                  </div>

                  <div className="relative pt-2">
                    <div className="absolute -left-[21px] top-3 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-950 shadow-sm" />
                    <strong className="block text-foreground text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-500">Landing Verification</strong>
                    <p className="text-muted-foreground text-xs mt-0.5">Port: <strong className="text-foreground">{traceChain.lot?.landing_site || 'Shimoni Port'}</strong></p>
                    <p className="text-muted-foreground text-xs">Grade: <strong className="text-foreground">Grade {traceChain.lot?.grading || 'A'}</strong></p>
                    <p className="text-muted-foreground text-xs">Zone: <strong className="text-foreground">{traceChain.lot?.fao_area || 'FAO-51 (Indian Ocean)'}</strong></p>
                  </div>

                  <div className="relative pt-2">
                    <div className="absolute -left-[21px] top-3 h-3.5 w-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-950 shadow-sm" />
                    <strong className="block text-foreground text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-500">Cold Chain Storage</strong>
                    <p className="text-muted-foreground text-xs mt-0.5">Facility: <strong className="text-foreground">Shimoni Cold Room</strong></p>
                    <p className="text-muted-foreground text-xs">Current temperature: <strong className="text-emerald-500">{traceChain.lot?.storage_temp_c ? `${traceChain.lot.storage_temp_c}°C` : '-22.5°C'}</strong></p>
                    <p className="text-muted-foreground text-xs">Status: <strong className="text-emerald-500">HACCP Compliant</strong></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Trace details not found.</div>
            )}
            <DialogFooter>
              <Button onClick={() => setTraceModal(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white">Close Audit</Button>
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
    }
  }, [currentRole, router])

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

