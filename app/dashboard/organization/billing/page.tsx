'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { authFetchJson } from '@/lib/api'
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react'
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
}

interface TenantResponse {
  tenant: { plan: string; status: string; name: string }
  members: unknown[]
  branches: unknown[]
  subscription: Subscription
}

function UsageBar({
  label,
  used,
  max,
}: {
  label: string
  used: number
  max: number
}) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const over = used >= max
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
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

export default function OrganizationBillingPage() {
  const [loading, setLoading] = useState(true)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<
    Array<{
      id: string
      number: string | null
      status: string
      amountDue: number
      currency: string
      hostedInvoiceUrl: string | null
    }>
  >([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [tenantName, setTenantName] = useState('')
  const [plan, setPlan] = useState('')
  const [status, setStatus] = useState('')
  const [userCount, setUserCount] = useState(0)
  const [branchCount, setBranchCount] = useState(0)

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: TenantResponse }>('/api/v2/tenant')
      .then((res) => {
        if (res.success && res.data) {
          setSubscription(res.data.subscription)
          setTenantName(res.data.tenant.name)
          setPlan(res.data.tenant.plan)
          setStatus(res.data.tenant.status)
          setUserCount(res.data.members?.length ?? 0)
          setBranchCount(res.data.branches?.length ?? 0)
        }
      })
      .catch(() => toast.error('Failed to load billing information'))
      .finally(() => setLoading(false))

    authFetchJson<{
      success: boolean
      data?: {
        invoices: Array<{
          id: string
          number: string | null
          status: string
          amountDue: number
          currency: string
          hostedInvoiceUrl: string | null
        }>
      }
    }>('/api/v2/tenant/billing/invoices')
      .then((inv) => {
        if (inv.success && inv.data?.invoices) setInvoices(inv.data.invoices)
      })
      .catch(() => {})
  }, [])

  const upgradePlan = async (targetPlan: 'starter' | 'professional' | 'enterprise') => {
    setUpgrading(targetPlan)
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
          plan: targetPlan,
          successUrl: `${returnUrl}?checkout=success`,
          cancelUrl: `${returnUrl}?checkout=cancel`,
        }),
      })
      if (!res.success || !res.data?.url) {
        toast.error(res.error || 'Could not start checkout')
        return
      }
      if (res.data.stub) toast.info('Stripe prices not configured — stub checkout')
      window.location.href = res.data.url
    } catch {
      toast.error('Checkout failed')
    } finally {
      setUpgrading(null)
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
      if (!res.success || !res.data?.url) {
        toast.error(res.error || 'Could not open billing portal')
        return
      }
      if (res.data.stub) {
        toast.info('Stripe is not configured — opening stub billing view')
      }
      window.location.href = res.data.url
    } catch {
      toast.error('Network error')
    } finally {
      setOpeningPortal(false)
    }
  }

  const limits = subscription?.limits

  return (
    <DashboardPageLayout
      title="Billing"
      description={`Subscription plan and usage for ${tenantName || 'your organization'}`}
      actions={
        <Button className="gap-2" onClick={openPortal} disabled={openingPortal || loading}>
          {openingPortal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Manage subscription
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>Your active subscription tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{subscription?.label ?? plan}</span>
                  <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
                </div>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  {(subscription?.features ?? []).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Current consumption vs plan caps —{' '}
              <Link href="#limits" className="text-primary underline-offset-4 hover:underline">
                view all limits
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || !limits ? (
              <p className="text-muted-foreground text-sm">Loading usage…</p>
            ) : (
              <>
                <UsageBar label="Team members" used={userCount} max={limits.maxUsers} />
                <UsageBar label="Branches" used={branchCount} max={limits.maxBranches} />
                <p className="text-xs text-muted-foreground">
                  Product catalog limit: {limits.maxProducts} items
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card id="limits">
        <CardHeader>
          <CardTitle>Plan limits</CardTitle>
          <CardDescription>Feature caps included with your {subscription?.label ?? plan} plan</CardDescription>
        </CardHeader>
        <CardContent>
          {limits ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Max users</dt>
                <dd className="font-medium">{limits.maxUsers}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max products</dt>
                <dd className="font-medium">{limits.maxProducts}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max branches</dt>
                <dd className="font-medium">{limits.maxBranches}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Advanced analytics</dt>
                <dd className="font-medium">{limits.analyticsAdvanced ? 'Included' : 'Not included'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Marketplace</dt>
                <dd className="font-medium">{limits.marketplace ? 'Included' : 'Not included'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">API access</dt>
                <dd className="font-medium">{limits.apiAccess ? 'Included' : 'Not included'}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">Loading limits…</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/organization">
                Organization settings
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" onClick={openPortal} disabled={openingPortal}>
              Manage subscription in Stripe
            </Button>
          </div>
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-2">Upgrade plan (Stripe Checkout)</p>
            <div className="flex flex-wrap gap-2">
              {(['starter', 'professional', 'enterprise'] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={plan === p ? 'default' : 'outline'}
                  disabled={upgrading !== null || plan === p}
                  onClick={() => upgradePlan(p)}
                >
                  {upgrading === p ? <Loader2 className="h-3 w-3 animate-spin" /> : p}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Set STRIPE_PRICE_STARTER, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_ENTERPRISE in .env
            </p>
          </div>
        </CardContent>
      </Card>

      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stripe invoices</CardTitle>
            <CardDescription>Billing history from your Stripe customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center text-sm border-b py-2">
                <span className="font-mono">{inv.number || inv.id.slice(0, 12)}</span>
                <span>
                  {inv.currency} {inv.amountDue.toLocaleString()} · {inv.status}
                </span>
                {inv.hostedInvoiceUrl && (
                  <a href={inv.hostedInvoiceUrl} className="text-primary text-xs" target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </DashboardPageLayout>
  )
}
