'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { 
  ArrowLeftRight, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Plus,
  HelpCircle,
  FileText
} from 'lucide-react'

interface ReturnOrderOption {
  id: string
  order_number: string
  buyerName: string
  totalAmount: number
  status: string
  createdAt?: string
}

interface ReturnRequest {
  id: string
  order_id: string
  return_number: string
  reason: 'spoiled' | 'wrong_item' | 'quality' | 'late_delivery' | 'other'
  reason_detail?: string
  refund_amount: number
  status: 'requested' | 'approved' | 'rejected' | 'refunded' | 'closed'
  created_at: string
  order_number: string
  order_total?: number
  buyer_name?: string
  buyer_email?: string
}

export default function ReturnsPricingPage() {
  const meta = useDashboardPageMeta({ title: 'Returns & refunds' })

  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [orders, setOrders] = useState<ReturnOrderOption[]>([])
  
  // Form state
  const [orderId, setOrderId] = useState<string>('none')
  const [reason, setReason] = useState<'spoiled' | 'wrong_item' | 'quality' | 'late_delivery' | 'other'>('quality')
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [reasonDetail, setReasonDetail] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [returnsRes, ordersRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { returns: ReturnRequest[] } }>('/api/v2/commerce/returns'),
        authFetchJson<{ success: boolean; data?: { items: ReturnOrderOption[] } }>('/api/v2/orders?limit=100'),
      ])
      
      if (returnsRes.success && returnsRes.data?.returns) {
        setReturns(returnsRes.data.returns)
      } else {
        setReturns([])
      }
      
      if (ordersRes.success && ordersRes.data?.items) {
        setOrders(ordersRes.data.items)
      }
    } catch {
      toast.error('Failed to load returns and orders data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle order selection to pre-fill amount
  const handleOrderChange = (id: string) => {
    setOrderId(id)
    if (id === 'none') {
      setRefundAmount('')
      return
    }
    const selectedOrder = orders.find(o => o.id === id)
    if (selectedOrder) {
      setRefundAmount(String(selectedOrder.totalAmount))
    }
  }

  const submitReturn = async () => {
    if (orderId === 'none') {
      toast.error('Please select an order to initiate return')
      return
    }
    if (!refundAmount || Number(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount')
      return
    }

    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/commerce/returns', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          reason,
          reasonDetail: reasonDetail.trim() || null,
          refundAmount: Number(refundAmount),
        }),
      })
      if (res.success) {
        toast.success('Return request initiated successfully')
        setOrderId('none')
        setRefundAmount('')
        setReasonDetail('')
        loadData()
      } else {
        toast.error('Failed to process return request')
      }
    } catch {
      toast.error('Failed to process return request')
    } finally {
      setSubmitting(false)
    }
  }

  const resolveReturn = async (id: string, status: 'approved' | 'rejected' | 'refunded' | 'closed') => {
    setUpdatingId(id)
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/commerce/returns', {
        method: 'PATCH',
        body: JSON.stringify({
          returnId: id,
          status,
        }),
      })
      if (res.success) {
        toast.success(`Return request marked as ${status}`)
        loadData()
      } else {
        toast.error('Failed to update return status')
      }
    } catch {
      toast.error('Failed to update return status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Stats calculations
  const totalReturnsCount = returns.length
  const pendingCount = returns.filter(r => r.status === 'requested').length
  const completedRefunded = returns.filter(r => r.status === 'refunded').length
  const totalRefundOutflow = returns
    .filter(r => r.status === 'refunded')
    .reduce((sum, r) => sum + Number(r.refund_amount), 0)

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'requested':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Requested</Badge>
      case 'approved':
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">Approved</Badge>
      case 'refunded':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Refunded</Badge>
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>
      case 'closed':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Closed</Badge>
      default:
        return <Badge variant="outline">{s}</Badge>
    }
  }

  const getReasonLabel = (r: string) => {
    switch (r) {
      case 'spoiled':
        return 'Spoiled Catch'
      case 'wrong_item':
        return 'Wrong Item'
      case 'quality':
        return 'Quality Issues'
      case 'late_delivery':
        return 'Late Delivery'
      default:
        return 'Other Reason'
    }
  }

  return (
    <DashboardPageLayout
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild disabled={returns.length === 0}>
            <a href={`/api/v2/analytics/export?type=commerce-orders&format=csv`} download>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </a>
          </Button>
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Return Log Requests"
          value={totalReturnsCount}
          icon={<ArrowLeftRight className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          loading={loading}
        />
        <StatCard
          title="Refunds Paid"
          value={completedRefunded}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          loading={loading}
        />
        <StatCard
          title="Total Capital Refunded"
          value={`KES ${totalRefundOutflow.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Initiate Return</CardTitle>
            <CardDescription>File a new customer return request for processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-selector">Customer Order Reference</Label>
              <Select value={orderId} onValueChange={handleOrderChange}>
                <SelectTrigger id="order-selector">
                  <SelectValue placeholder="Select completed order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose from recent sales</SelectItem>
                  {orders.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      ORD-{o.order_number || o.id.slice(0, 8)} ({o.buyerName || 'Buyer'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="reason-selector">Claim Reason</Label>
                <Select value={reason} onValueChange={setReason as any}>
                  <SelectTrigger id="reason-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Quality Issues</SelectItem>
                    <SelectItem value="spoiled">Spoiled Product</SelectItem>
                    <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                    <SelectItem value="late_delivery">Late Delivery</SelectItem>
                    <SelectItem value="other">Other/Damage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund-input">Refund Amount (KES)</Label>
                <Input 
                  id="refund-input"
                  type="number"
                  placeholder="e.g. 2500"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details-notes">Return Details &amp; Claims</Label>
              <Input 
                id="details-notes"
                placeholder="Details of spoilage, batch codes, delivery delay remarks..."
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
              />
            </div>

            <Button onClick={submitReturn} className="w-full gap-2 mt-2" disabled={submitting}>
              <Plus className="h-4 w-4" />
              {submitting ? 'Initiating...' : 'File Return Request'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Return Requests Log</CardTitle>
            <CardDescription>Review and resolve refund claims and product returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Return Ref / Date</th>
                    <th className="text-left py-3 px-4 font-medium">Order Ref &amp; Buyer</th>
                    <th className="text-left py-3 px-4 font-medium">Claim Details</th>
                    <th className="text-right py-3 px-4 font-medium">Refund Amount</th>
                    <th className="text-center py-3 px-4 font-medium">Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-xs text-indigo-600">
                          {r.return_number}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-xs">
                          ORD-{r.order_number || r.order_id.slice(0, 8)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.buyer_name || 'Customer'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-xs">
                          {getReasonLabel(r.reason)}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {r.reason_detail || 'No description.'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        KES {Number(r.refund_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1.5">
                          {getStatusBadge(r.status)}
                          {r.status === 'requested' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-6 px-1.5 text-[10px]"
                                disabled={updatingId === r.id}
                                onClick={() => resolveReturn(r.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-6 px-1.5 text-[10px]"
                                disabled={updatingId === r.id}
                                onClick={() => resolveReturn(r.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {r.status === 'approved' && (
                            <Button 
                              size="sm" 
                              className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                              disabled={updatingId === r.id}
                              onClick={() => resolveReturn(r.id, 'refunded')}
                            >
                              Pay Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {returns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {loading ? 'Loading returns data...' : 'No active return requests logged. Use the form to file your first claim.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
