'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { authFetchJson } from '@/lib/api'
import { Store, Wallet, Star, Package } from 'lucide-react'

export default function VendorDashboardPage() {
  const meta = useDashboardPageMeta({ title: 'Vendor dashboard', description: 'Manage listings, orders, and payouts in one place.' })

  const [stats, setStats] = useState({ listings: 0, orders: 0, commission: 0, rating: 0 })

  useEffect(() => {
    Promise.all([
      authFetchJson<{
        success: boolean
        data?: { listings?: unknown[]; pagination?: { total: number } }
      }>('/api/v2/marketplace?limit=1'),
      authFetchJson<{
        success: boolean
        data?: { orders?: unknown[]; pagination?: { total: number } }
      }>('/api/v2/orders?limit=1'),
      authFetchJson<{ success: boolean; data?: { commissions?: { commission_amount: number }[] } }>(
        '/api/v2/commerce/commissions?limit=50',
      ),
      authFetchJson<{
        success: boolean
        data?: { summary?: { avg_rating: number; review_count: number } }
      }>('/api/v2/commerce/reviews?limit=1'),
    ]).then(([listings, orders, comm, reviews]) => {
      const avg = Number(reviews.data?.summary?.avg_rating ?? 0)
      setStats({
        listings: listings.data?.pagination?.total ?? listings.data?.listings?.length ?? 0,
        orders: orders.data?.pagination?.total ?? orders.data?.orders?.length ?? 0,
        commission: (comm.data?.commissions || []).reduce(
          (s, c) => s + Number(c.commission_amount || 0),
          0,
        ),
        rating: avg > 0 ? Math.round(avg * 10) / 10 : 0,
      })
    })
  }, [])

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Listings</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{stats.listings}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Orders</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{stats.orders}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Commissions</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">KES {stats.commission.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Star className="h-4 w-4" /> Rating</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.rating > 0 ? stats.rating : '—'}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href="/dashboard/marketplace"><Package className="h-4 w-4 mr-2" />Listings</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/orders">Orders</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/commerce/payouts"><Wallet className="h-4 w-4 mr-2" />Payouts</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/commerce/reviews">Reviews</Link></Button>
      </div>
    </DashboardPageLayout>
  )
}

