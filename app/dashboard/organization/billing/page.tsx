'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { authFetchJson } from '@/lib/api'
import {
  ArrowUpRight,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Phone,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  plan: string
  label: string
  features: string[]
  limits: {
    maxUsers: number
    maxProducts: number
    maxBranches: number
    analyticsAdvanced: boolean
    marketplace: boolean
    apiAccess: boolean
  }
  expiryStatus?: {
    isTrial: boolean
    isTrialExpired: boolean
    isSubscriptionExpired: boolean
    inGracePeriod: boolean
    isSuspendedOrCancelled: boolean
    daysRemaining: number | null
    canWrite: boolean
    displayMessage: string
  }
}

interface TenantResponse {
  tenant: { plan: string; status: string; name: string; slug?: string }
  members: unknown[]
  branches: unknown[]
  productCount?: number
  subscription: Subscription
}

interface Invoice {
  id: string
  number: string | null
  status: string
  amountDue: number
  currency: string
  created?: number
  hostedInvoiceUrl: string | null
}

function UsageBar({
  label,
  used,
  max,
  unit = '',
}: {
  label: string
  used: number
  max: number
  unit?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const over = used >= max
  const nearLimit = pct >= 80 && !over

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={
              over
                ? 'font-bold text-destructive'
                : nearLimit
                  ? 'font-medium text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
            }
          >
            {used.toLocaleString()} / {max.toLocaleString()} {unit}
          </span>
          {over && (
            <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
              Exceeded
            </Badge>
          )}
        </div>
      </div>
      <Progress
        value={pct}
        className={
          over
            ? '[&_[data-slot=progress-indicator]]:bg-destructive'
            : nearLimit
              ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
              : undefined
        }
      />
    </div>
  )
}

const TIER_CARDS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Ideal for small operations & growing commercial teams',
    monthlyPrice: 6500,
    annualPrice: 5200,
    badge: null,
    features: [
      'Up to 15 Active Users',
      'Up to 500 Catalog Products',
      'Up to 3 Operational Branches',
      'Standard Financial Analytics',
      'Full Marketplace Access',
      'Standard API Access',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Comprehensive ERP suite for expanding enterprises',
    monthlyPrice: 19500,
    annualPrice: 15600,
    badge: 'Most Popular',
    features: [
      'Up to 100 Active Users',
      'Up to 5,000 Catalog Products',
      'Up to 20 Operational Branches',
      'Advanced Analytics & Custom Dashboards',
      'Full Marketplace & Cold Chain Sync',
      'Priority REST & Webhook APIs',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Maximum scale, dedicated support & multi-region deployment',
    monthlyPrice: 65000,
    annualPrice: 52000,
    badge: 'Unlimited Power',
    features: [
      'Up to 10,000 Active Users',
      'Up to 100,000 Catalog Products',
      'Up to 500 Operational Branches',
      'Real-time Analytics & AI Forecasts',
      'Dedicated Account Manager & SLA',
      'Custom Integrations & Direct DB Sync',
    ],
  },
] as const

export default function OrganizationBillingPage() {
  const [loading, setLoading] = useState(true)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [tenantName, setTenantName] = useState('')
  const [plan, setPlan] = useState('')
  const [status, setStatus] = useState('')
  const [userCount, setUserCount] = useState(0)
  const [branchCount, setBranchCount] = useState(0)
  const [productCount, setProductCount] = useState(0)

  // Platform Settings local dev toggle
  const [localDevEnabled, setLocalDevEnabled] = useState(true)

  // Payment Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<(typeof TIER_CARDS)[number] | null>(null)
  const [paymentTab, setPaymentTab] = useState<'mpesa' | 'stripe' | 'demo'>('mpesa')
  const [mpesaPhone, setMpesaPhone] = useState('0712345678')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const loadData = () => {
    setLoading(true)
    authFetchJson<{ success: boolean; data?: TenantResponse }>('/api/v2/tenant')
      .then((res) => {
        if (res.success && res.data) {
          setSubscription(res.data.subscription)
          setTenantName(res.data.tenant.name)
          setPlan(res.data.tenant.plan)
          setStatus(res.data.tenant.status)
          setUserCount(res.data.members?.length ?? 0)
          setBranchCount(res.data.branches?.length ?? 0)
          setProductCount(res.data.productCount ?? 0)
        }
      })
      .catch(() => toast.error('Failed to load billing information'))
      .finally(() => setLoading(false))

    authFetchJson<{
      success: boolean
      data?: {
        invoices: Invoice[]
      }
    }>('/api/v2/tenant/billing/invoices')
      .then((inv) => {
        if (inv.success && inv.data?.invoices) setInvoices(inv.data.invoices)
      })
      .catch(() => {})

    // Check platform local dev mode setting
    fetch('/api/v2/platform/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.localDevMode !== undefined) {
          setLocalDevEnabled(Boolean(d.data.localDevMode))
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCheckoutModal = (tier: (typeof TIER_CARDS)[number]) => {
    setSelectedTier(tier)
    setPaymentTab('mpesa')
    setCheckoutModalOpen(true)
  }

  const handleMpesaStkPush = async () => {
    if (!selectedTier) return
    if (!mpesaPhone.trim()) {
      toast.error('Please enter a valid M-Pesa phone number')
      return
    }

    setSubmittingPayment(true)
    const amount = billingCycle === 'annual' ? selectedTier.annualPrice * 12 : selectedTier.monthlyPrice

    try {
      const res = await authFetchJson<{ success: boolean; message?: string; error?: string }>(
        '/api/payments/mpesa/stk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: mpesaPhone.trim(),
            amount,
            accountReference: `SUBSCRIPTION-${selectedTier.id.toUpperCase()}`,
            transactionDesc: `${selectedTier.name} Plan Subscription`,
          }),
        },
      )

      if (res.success) {
        toast.success(`STK Push prompt sent to ${mpesaPhone}! Enter your M-Pesa PIN on your handset.`)
      } else {
        toast.error(res.error || 'Failed to initiate M-Pesa STK Push')
      }
    } catch {
      toast.error('Network error during M-Pesa checkout')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleDirectDemoUpgrade = async () => {
    if (!selectedTier) return
    setSubmittingPayment(true)
    try {
      const res = await authFetchJson<{ success: boolean; message?: string; error?: string }>(
        '/api/v2/tenant/billing/upgrade-direct',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: selectedTier.id,
            billingCycle,
          }),
        },
      )

      if (res.success) {
        toast.success(`Plan upgraded to ${selectedTier.name} tier!`)
        setCheckoutModalOpen(false)
        loadData()
      } else {
        toast.error(res.error || 'Failed to upgrade plan')
      }
    } catch {
      toast.error('Error performing instant demo upgrade')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleStripeCheckout = async () => {
    if (!selectedTier) return
    setSubmittingPayment(true)
    try {
      const returnUrl = `${window.location.origin}/dashboard/organization/billing`
      const res = await authFetchJson<{
        success: boolean
        data?: { url: string; stub?: boolean }
        error?: string
      }>('/api/v2/tenant/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedTier.id,
          successUrl: `${returnUrl}?checkout=success`,
          cancelUrl: `${returnUrl}?checkout=cancel`,
        }),
      })

      if (res.success && res.data?.url && !res.data.stub) {
        window.location.href = res.data.url
      } else {
        toast.info('Stripe API keys not configured. Use M-Pesa or Local Dev mode.')
        setPaymentTab('mpesa')
      }
    } catch {
      toast.error('Stripe checkout error')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const openPortal = async () => {
    setOpeningPortal(true)
    try {
      const returnUrl = `${window.location.origin}/dashboard/organization/billing`
      const res = await authFetchJson<{
        success: boolean
        data?: { url: string; stub?: boolean }
        error?: string
      }>('/api/v2/tenant/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl }),
      })
      if (res.success && res.data?.url && !res.data.stub) {
        window.location.href = res.data.url
      } else {
        toast.info('Stripe is in stub mode — use the upgrade cards below to manage payments.')
      }
    } catch {
      toast.error('Network error while connecting to Stripe billing portal')
    } finally {
      setOpeningPortal(false)
    }
  }

  const limits = subscription?.limits
  const isOverLimit = Boolean(
    limits &&
      (userCount >= limits.maxUsers ||
        branchCount >= limits.maxBranches ||
        productCount >= limits.maxProducts),
  )

  return (
    <DashboardPageLayout
      title="Billing & Subscriptions"
      description={`Manage plan subscriptions, usage limits, and payment methods for ${tenantName || 'your organization'}`}
      actions={
        <Button className="gap-2" onClick={openPortal} disabled={openingPortal || loading}>
          {openingPortal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Customer Billing Portal
        </Button>
      }
    >
      {/* Over-Limit Alert Banner */}
      {isOverLimit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive-foreground">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Plan Resource Limits Exceeded</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your organization has reached or exceeded its plan limits for active team members, branches, or product catalog entries. Upgrading your subscription ensures uninterrupted service.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="shrink-0 gap-1.5"
            onClick={() => {
              const el = document.getElementById('pricing-tiers')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Upgrade Plan <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Top Section Grid: Current Plan Details & Consumption Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Current Subscription Plan
              </CardTitle>
              <Badge
                variant={status === 'active' ? 'default' : status === 'trial' ? 'secondary' : 'outline'}
                className="capitalize"
              >
                {status || 'Active'}
              </Badge>
            </div>
            <CardDescription>Active subscription tier and included features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription details…
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between border-b pb-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-tight">
                        {subscription?.label ?? plan}
                      </span>
                      <span className="text-sm text-muted-foreground">tier</span>
                    </div>
                    {subscription?.expiryStatus && (
                      <div className="mt-2">
                        <Badge
                          variant={
                            subscription.expiryStatus.isTrialExpired || subscription.expiryStatus.isSubscriptionExpired
                              ? 'destructive'
                              : subscription.expiryStatus.inGracePeriod
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {subscription.expiryStatus.displayMessage}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={openPortal} disabled={openingPortal}>
                    Manage Subscription
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Included Tier Features
                  </h4>
                  <ul className="grid gap-2 text-sm">
                    {(subscription?.features ?? []).map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resource Consumption</CardTitle>
              <Link href="#limits" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all feature caps <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Current utilization against your active plan caps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading || !limits ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading usage metrics…
              </div>
            ) : (
              <div className="space-y-4">
                <UsageBar label="Team Members" used={userCount} max={limits.maxUsers} unit="users" />
                <UsageBar label="Catalog Products" used={productCount} max={limits.maxProducts} unit="items" />
                <UsageBar label="Operating Branches" used={branchCount} max={limits.maxBranches} unit="branches" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing & Upgrade Tier Cards */}
      <div id="pricing-tiers" className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Available Subscription Tiers</h2>
            <p className="text-muted-foreground text-sm">
              Upgrade or switch your tier anytime via M-Pesa or Card
            </p>
          </div>
          <div className="inline-flex items-center p-1 rounded-lg border bg-muted/50 text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual Billing
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TIER_CARDS.map((tier) => {
            const isCurrent = plan.toLowerCase() === tier.id
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice

            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col justify-between transition-all ${
                  tier.badge ? 'border-primary shadow-md' : ''
                } ${isCurrent ? 'bg-primary/5 border-primary/40' : ''}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1 text-[11px] px-2.5">
                      <Sparkles className="h-3 w-3" /> {tier.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs min-h-[32px]">{tier.tagline}</CardDescription>
                  <div className="pt-3">
                    <span className="text-3xl font-extrabold">KSh {price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/ month</span>
                    {billingCycle === 'annual' && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Billed annually (KSh {(price * 12).toLocaleString()}/yr)
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 text-xs">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full gap-2 mt-4"
                    variant={isCurrent ? 'outline' : tier.badge ? 'default' : 'secondary'}
                    disabled={isCurrent}
                    onClick={() => openCheckoutModal(tier)}
                  >
                    {isCurrent ? 'Active Tier' : `Upgrade to ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Plan Limits Specifications */}
      <Card id="limits">
        <CardHeader>
          <CardTitle>Detailed Plan Specifications</CardTitle>
          <CardDescription>
            Feature caps and entitlements included with your active {subscription?.label ?? plan} tier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {limits ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div className="p-3 rounded-lg border bg-card">
                <dt className="text-xs text-muted-foreground">Maximum Active Users</dt>
                <dd className="text-lg font-semibold mt-0.5">{limits.maxUsers.toLocaleString()}</dd>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <dt className="text-xs text-muted-foreground">Maximum Product Catalog</dt>
                <dd className="text-lg font-semibold mt-0.5">{limits.maxProducts.toLocaleString()} items</dd>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <dt className="text-xs text-muted-foreground">Maximum Operating Branches</dt>
                <dd className="text-lg font-semibold mt-0.5">{limits.maxBranches.toLocaleString()}</dd>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <dt className="text-xs text-muted-foreground">Advanced Analytics</dt>
                <dd className="text-lg font-semibold mt-0.5">{limits.analyticsAdvanced ? 'Included' : 'Standard'}</dd>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <dt className="text-xs text-muted-foreground">Marketplace Integration</dt>
                <dd className="text-lg font-semibold mt-0.5">{limits.marketplace ? 'Included' : 'Not included'}</dd>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <dt className="text-xs text-muted-foreground">API Access</dt>
                <dd className="text-lg font-semibold mt-0.5">{limits.apiAccess ? 'Included' : 'Not included'}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">Loading limits specifications…</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/organization">
                Organization Settings
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" onClick={openPortal} disabled={openingPortal}>
              <CreditCard className="h-3.5 w-3.5" /> Payment Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Invoices & Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Invoice & Billing History
          </CardTitle>
          <CardDescription>Download past invoices and view billing statement receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No invoice records found. Past invoices will appear here after billing processing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">
                        {inv.number || inv.id.slice(0, 16)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            inv.status === 'paid'
                              ? 'default'
                              : inv.status === 'open'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="capitalize"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {inv.currency.toUpperCase()}{' '}
                        {inv.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.hostedInvoiceUrl ? (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            View Invoice <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Payment & Checkout Modal */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-primary" /> Upgrade to {selectedTier?.name} Plan
            </DialogTitle>
            <DialogDescription>
              Select your payment method below to complete subscription to the {selectedTier?.name} tier ({billingCycle} cycle).
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <div className="space-y-6 pt-2">
              {/* Amount Summary Header Box */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Amount Due</p>
                  <p className="text-2xl font-extrabold text-primary mt-0.5">
                    KSh{' '}
                    {(
                      (billingCycle === 'annual'
                        ? selectedTier.annualPrice * 12
                        : selectedTier.monthlyPrice)
                    ).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize text-xs">
                  {billingCycle} Billing
                </Badge>
              </div>

              {/* Payment Method Selector Pills: M-Pesa, Stripe, and optional Local Dev */}
              <div className={`grid ${localDevEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 p-1 bg-muted rounded-xl text-xs font-semibold`}>
                <button
                  type="button"
                  onClick={() => setPaymentTab('mpesa')}
                  className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'mpesa' ? 'bg-background shadow-sm text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground'
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" /> M-Pesa STK
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('stripe')}
                  className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'stripe' ? 'bg-background shadow-sm text-sky-600 dark:text-sky-400 font-bold' : 'text-muted-foreground'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Card (Stripe)
                </button>
                {localDevEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentTab('demo')}
                    className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentTab === 'demo' ? 'bg-background shadow-sm text-purple-600 dark:text-purple-400 font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Local Dev
                  </button>
                )}
              </div>

              {/* TAB 1: M-Pesa STK Push */}
              {paymentTab === 'mpesa' && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">Instant M-Pesa Express Checkout</p>
                    <p className="text-muted-foreground text-[11px]">
                      Enter your Safaricom M-Pesa phone number below. An STK push prompt will display on your phone automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">M-Pesa Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. 0712345678"
                        className="pl-9"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={handleMpesaStkPush}
                    disabled={submittingPayment}
                  >
                    {submittingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    Send M-Pesa STK Push Prompt
                  </Button>
                </div>
              )}

              {/* TAB 2: Stripe Card Payment */}
              {paymentTab === 'stripe' && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-sky-700 dark:text-sky-400">Credit / Debit Card Checkout</p>
                    <p className="text-muted-foreground text-[11px]">
                      Process automated recurring billing securely via Stripe's encrypted payment gateway.
                    </p>
                  </div>

                  <Button className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white" onClick={handleStripeCheckout} disabled={submittingPayment}>
                    {submittingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Proceed to Stripe Hosted Checkout
                  </Button>
                </div>
              )}

              {/* TAB 3: Instant Demo Upgrade (Local Dev Sandbox Mode) */}
              {paymentTab === 'demo' && localDevEnabled && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-purple-700 dark:text-purple-400">Local Development & Sandbox Environment</p>
                    <p className="text-muted-foreground text-[11px]">
                      Instantly switch active tenant subscription plan to test enterprise features without external payment processing. (Toggleable via Super Admin Developer Options).
                    </p>
                  </div>

                  <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleDirectDemoUpgrade} disabled={submittingPayment}>
                    {submittingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Instant Sandbox Upgrade to {selectedTier.name} Tier
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
