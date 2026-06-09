'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authFetchJson } from '@/lib/api'
import { Package, ShoppingCart } from 'lucide-react'

export default function VendorDashboardPage() {
  const meta = useDashboardPageMeta({
    title: 'Vendor dashboard',
    description: 'Manage your listings and orders in one place.',
  })

  const [stats, setStats] = useState({ listings: 0, orders: 0 })

  useEffect(() => {
    Promise.all([
      authFetchJson<{
        success: boolean
        data?: { listings?: unknown[]; pagination?: { total: number } }
      }>('/api/v2/marketplace?limit=1'),
      authFetchJson<{
        success: boolean
        data?: { orders?: unknown[]; pagination?: { total: number } }
      }>('/api/v2/orders?role=seller&limit=1'),
    ]).then(([listings, orders]) => {
      setStats({
        listings: listings.data?.pagination?.total ?? listings.data?.listings?.length ?? 0,
        orders: orders.data?.pagination?.total ?? orders.data?.orders?.length ?? 0,
      })
    })
  }, [])

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-500" />
              Listings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.listings}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.orders}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Button asChild>
          <Link href="/dashboard/marketplace">
            <Package className="h-4 w-4 mr-2" />
            Manage Listings
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Orders
          </Link>
        </Button>
      </div>
    </DashboardPageLayout>
  )
}
