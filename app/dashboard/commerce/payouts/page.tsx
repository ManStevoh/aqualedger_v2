import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { CheckCircle, Plus, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface Commission {
  id: string
  vendor_id: string
  order_id: string
  order_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  created_at: string
  vendor_name?: string | null
  order_number?: string | null
}

interface Payout {
  id: string
  vendor_id: string
  payout_number: string
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
  vendor_name?: string | null
}

interface Vendor {
  id: string
  shop_name: string
}

export default function CommercePayoutsPage() {
  const meta = useDashboardPageMeta()

  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('payable')
  const [showDialog, setShowDialog] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const commissionParams = new URLSearchParams({ limit: '100' })
      if (statusFilter) commissionParams.set('status', statusFilter)

      const [commRes, payoutRes, vendorRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { commissions: Commission[] } }>(
          `/api/v2/commerce/commissions?${commissionParams}`,
        ),
        authFetchJson<{ success: boolean; data?: { payouts: Payout[] } }>(
          '/api/v2/commerce/payouts?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { vendors: Vendor[] } }>(
          '/api/v2/commerce/vendors?limit=100&status=active',
        ),
      ])

      setCommissions(commRes.success && commRes.data?.commissions ? commRes.data.commissions : [])
      setPayouts(payoutRes.success && payoutRes.data?.payouts ? payoutRes.data.payouts : [])
      setVendors(vendorRes.success && vendorRes.data?.vendors ? vendorRes.data.vendors : [])
    } catch {
      toast.error('Failed to load payout data')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const payableTotal = commissions
    .filter((c) => c.status === 'payable')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0)

  const handleCreatePayout = async () => {
    if (!vendorId) {
      toast.error('Select a vendor')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/commerce/payouts',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to create payout')
        return
      }
      toast.success('Payout created')
      setShowDialog(false)
      setVendorId('')
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkPaid = async (payoutId: string) => {
    setMarkingId(payoutId)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/commerce/payouts',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payoutId }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to mark paid')
        return
      }
      toast.success('Payout marked paid')
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<StatCardGrid>
        <StatCard
          title="Payable commissions"
          value={`KES ${payableTotal.toLocaleString()}`}
          description={`${commissions.filter((c) => c.status === 'payable').length} records`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Payouts"
          value={String(payouts.length)}
          description="All payout batches"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Commissions
          </CardTitle>
          <CardDescription>Earned from confirmed orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="filter-control">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payable">Payable</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4" />
              Create payout
            </Button>
          </div>

          <DataTable
            loading={loading}
            data={commissions}
            emptyMessage="No commissions for this filter"
            columns={[
              { key: 'vendor_name', header: 'Vendor', cell: (row) => row.vendor_name || row.vendor_id },
              { key: 'order_number', header: 'Order', cell: (row) => row.order_number || row.order_id },
              {
                key: 'order_amount',
                header: 'Order total',
                cell: (row) => `KES ${Number(row.order_amount).toLocaleString()}`,
              },
              {
                key: 'commission_amount',
                header: 'Commission',
                cell: (row) =>
                  `${Number(row.commission_rate).toFixed(1)}% — KES ${Number(row.commission_amount).toLocaleString()}`,
              },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => <Badge variant="secondary">{row.status}</Badge>,
              },
              {
                key: 'created_at',
                header: 'Created',
                cell: (row) => new Date(row.created_at).toLocaleDateString(),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout batches</CardTitle>
          <CardDescription>Processing and paid vendor payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            data={payouts}
            emptyMessage="No payouts yet"
            columns={[
              { key: 'payout_number', header: 'Payout #' },
              { key: 'vendor_name', header: 'Vendor', cell: (row) => row.vendor_name || row.vendor_id },
              {
                key: 'amount',
                header: 'Amount',
                cell: (row) => `${row.currency} ${Number(row.amount).toLocaleString()}`,
              },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => (
                  <Badge variant={row.status === 'paid' ? 'default' : 'secondary'}>
                    {row.status}
                  </Badge>
                ),
              },
              {
                key: 'paid_at',
                header: 'Paid at',
                cell: (row) =>
                  row.paid_at ? new Date(row.paid_at).toLocaleString() : '—',
              },
              {
                key: 'actions',
                header: '',
                cell: (row) =>
                  row.status !== 'paid' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={markingId === row.id}
                      onClick={() => handleMarkPaid(row.id)}
                    >
                      Mark paid
                    </Button>
                  ) : null,
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create payout</DialogTitle>
            <DialogDescription>
              Bundles all payable commissions for the selected vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.shop_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value="KES" disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayout} disabled={submitting}>
              Create payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

