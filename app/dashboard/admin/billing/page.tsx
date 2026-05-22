'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { Receipt, Shield, Loader2, AlertTriangle } from 'lucide-react'
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
    <div className="space-y-1 min-w-[140px]">
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
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { tenants: TenantBillingRow[] }
        error?: string
      }>('/api/v2/platform/billing')

      if (!res.success) {
        toast.error(res.error || 'Failed to load billing overview')
        return
      }
      setTenants(res.data?.tenants ?? [])
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

  const overLimitCount = tenants.filter((t) => t.overLimit.any).length

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
    <DashboardPageLayout title="Billing overview" description="Plan limits and usage across all tenants">


      <AdminHubNav />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tenant plans & usage
            {overLimitCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {overLimitCount} over limit
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {tenants.length} tenant{tenants.length === 1 ? '' : 's'} — users, products, and branches vs plan caps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading billing data…
            </div>
          ) : tenants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tenants found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Branches</TableHead>
                    <TableHead>Limits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.tenantId}>
                      <TableCell>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{tenant.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={planBadgeVariant(tenant.plan)}>{tenant.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
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
                      <TableCell>
                        {tenant.overLimit.any ? (
                          <Badge variant="destructive">Over limit</Badge>
                        ) : (
                          <Badge variant="outline">Within limits</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
