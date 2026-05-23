'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
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
import { Plus, Ticket } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  min_order_amount: number
  uses_count: number
  max_uses: number | null
  valid_from: string | null
  valid_to: string | null
  status: string
}

export default function CouponsPage() {
  const meta = useDashboardPageMeta()

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrder, setMinOrder] = useState('0')
  const [validTo, setValidTo] = useState('')

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { coupons: Coupon[] }
      }>('/api/v2/commerce/coupons?limit=100')
      if (data.success && data.data?.coupons) {
        setCoupons(data.data.coupons)
      } else {
        setCoupons([])
      }
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const handleCreate = async () => {
    if (!code.trim() || !discountValue) {
      toast.error('Code and discount value are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/commerce/coupons',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim(),
            discountType,
            discountValue: parseFloat(discountValue),
            minOrderAmount: parseFloat(minOrder) || 0,
            validTo: validTo || null,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to create coupon')
        return
      }
      toast.success('Coupon created')
      setShowDialog(false)
      setCode('')
      setDiscountValue('')
      await fetchCoupons()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDiscount = (c: Coupon) =>
    c.discount_type === 'percent'
      ? `${c.discount_value}%`
      : `KES ${Number(c.discount_value).toLocaleString()}`

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Active promotions
          </CardTitle>
          <CardDescription>Tenant-scoped coupon codes</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            data={coupons}
            emptyMessage="No coupons yet"
            actions={
              <Button className="gap-2" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4" />
                New coupon
              </Button>
            }
            columns={[
              { key: 'code', header: 'Code' },
              {
                key: 'discount_value',
                header: 'Discount',
                cell: (row) => formatDiscount(row),
              },
              {
                key: 'min_order_amount',
                header: 'Min order',
                cell: (row) => `KES ${Number(row.min_order_amount).toLocaleString()}`,
              },
              {
                key: 'uses_count',
                header: 'Uses',
                cell: (row) =>
                  `${row.uses_count}${row.max_uses != null ? ` / ${row.max_uses}` : ''}`,
              },
              {
                key: 'valid_to',
                header: 'Valid to',
                cell: (row) =>
                  row.valid_to ? new Date(row.valid_to).toLocaleDateString() : '—',
              },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => (
                  <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                    {row.status}
                  </Badge>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
            <DialogDescription>Codes are stored uppercase per tenant</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={discountType}
                  onValueChange={(v) => setDiscountType(v as 'percent' | 'fixed')}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="fixed">Fixed (KES)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Min order (KES)</Label>
              <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valid to</Label>
              <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

