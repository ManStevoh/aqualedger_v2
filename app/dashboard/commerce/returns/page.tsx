'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function OrderReturnsPage() {
  const [returns, setReturns] = useState<Record<string, unknown>[]>([])
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('quality')
  const [refund, setRefund] = useState('')

  const load = () => {
    authFetchJson<{ success: boolean; data?: { returns: Record<string, unknown>[] } }>(
      '/api/v2/commerce/returns',
    ).then((res) => {
      if (res.success && res.data?.returns) setReturns(res.data.returns)
    })
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    const res = await authFetchJson<{ success: boolean }>('/api/v2/commerce/returns', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        reason,
        refundAmount: refund ? Number(refund) : undefined,
      }),
    })
    if (res.success) {
      toast.success('Return requested')
      load()
    }
  }

  const setStatus = async (returnId: string, status: string) => {
    await authFetchJson('/api/v2/commerce/returns', {
      method: 'PATCH',
      body: JSON.stringify({ returnId, status }),
    })
    toast.success(`Status: ${status}`)
    load()
  }

  return (
    <DashboardPageLayout
      title="Returns & refunds"
      description="Create return requests and approve refunds for commerce orders"
    >
      <Card>
        <CardHeader><CardTitle>New return</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Order ID</Label><Input value={orderId} onChange={(e) => setOrderId(e.target.value)} /></div>
          <div>
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="spoiled">Spoiled</SelectItem>
                <SelectItem value="wrong_item">Wrong item</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="late_delivery">Late delivery</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Refund (KES, optional)</Label><Input type="number" value={refund} onChange={(e) => setRefund(e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={create}>Submit return</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Return requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {returns.map((r) => (
            <div key={String(r.id)} className="flex flex-wrap justify-between gap-2 border-b py-2">
              <div>
                <p className="font-medium">{String(r.return_number)} · Order {String(r.order_number)}</p>
                <p className="text-sm text-muted-foreground">{String(r.reason)} — KES {Number(r.refund_amount).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{String(r.status)}</Badge>
                {r.status === 'requested' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setStatus(String(r.id), 'approved')}>Approve</Button>
                    <Button size="sm" onClick={() => setStatus(String(r.id), 'refunded')}>Refund</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
