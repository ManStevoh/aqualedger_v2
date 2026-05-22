'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
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
    <DashboardPageLayout
      title="Vendor payouts"
      description="Commission ledger and payout processing for marketplace vendors"
    >
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