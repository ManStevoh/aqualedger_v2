'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PortalInviteDialog } from '@/components/dashboard/portal-invite-dialog'
import { authFetchJson } from '@/lib/api'
import { Plus, Settings, Store, UserCheck } from 'lucide-react'

interface VendorRow {
  id: string
  shop_name: string
  commission_rate: number
  status: string
  user_email: string | null
  first_name: string | null
  last_name: string | null
  created_at: string
}

export default function MarketplaceVendorsPage() {
  const meta = useDashboardPageMeta({
    title: 'Marketplace vendors',
    description: 'Seller accounts with portal login and commission rates',
  })

  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { vendors: VendorRow[] } }>(
        '/api/v2/commerce/vendors?limit=100',
      )
      setVendors(res.success && res.data?.vendors ? res.data.vendors : [])
    } catch {
      setVendors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const active = vendors.filter((v) => v.status === 'active').length

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
      <StatCardGrid>
        <StatCard title="Vendors" value={vendors.length} loading={loading} icon={<Store className="h-4 w-4" />} />
        <StatCard title="Active" value={active} loading={loading} icon={<UserCheck className="h-4 w-4" />} />
      </StatCardGrid>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button className="gap-2" onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite vendor
        </Button>
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/dashboard/settings/roles">
            <Settings className="h-4 w-4" />
            Portal permissions
          </Link>
        </Button>
      </div>

      <DataTable
        title="Vendors"
        description="Each vendor can log in at /login with vendor role permissions"
        loading={loading}
        data={vendors}
        emptyMessage="No vendors yet — invite your first seller"
        columns={[
          {
            key: 'shop',
            header: 'Shop',
            cell: (row) => <span className="font-medium">{row.shop_name}</span>,
          },
          {
            key: 'contact',
            header: 'Contact',
            cell: (row) => (
              <div>
                <p className="text-sm">
                  {[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}
                </p>
                <p className="text-xs text-muted-foreground">{row.user_email || '—'}</p>
              </div>
            ),
          },
          {
            key: 'rate',
            header: 'Commission',
            cell: (row) => `${Number(row.commission_rate)}%`,
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge>
            ),
          },
          {
            key: 'joined',
            header: 'Since',
            cell: (row) => row.created_at?.split('T')[0] ?? '—',
          },
        ]}
      />

      <PortalInviteDialog
        kind="vendor"
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={load}
      />
    </DashboardPageLayout>
  )
}
