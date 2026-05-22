'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ObjectPageShell } from '@/components/dashboard/object-page-shell'
import { COMMERCE_WORKSPACE_NAV } from '@/components/dashboard/workspace-nav'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { authFetchJson, updateOrderStatus } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, FileText, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

type OrderDetail = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  subtotal: number
  delivery_fee: number
  tax: number
  delivery_address: string | null
  buyer_name?: string | null
  seller_name?: string | null
  created_at: string
  items?: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    fish_type?: string | null
    species_name?: string | null
  }>
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [invoicing, setInvoicing] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [paying, setPaying] = useState(false)

  const loadOrder = useCallback(
    (opts?: { silent?: boolean }) => {
      if (!id) return
      if (!opts?.silent) setLoading(true)
      authFetchJson<{ success: boolean; data?: { order: OrderDetail }; error?: string }>(
        `/api/v2/orders/${id}`,
      )
        .then((res) => {
          if (!res.success || !res.data?.order) {
            setError(res.error || 'Order not found')
            setOrder(null)
            return
          }
          setOrder(res.data.order)
          setError(null)
        })
        .catch(() => setError('Failed to load order'))
        .finally(() => {
          if (!opts?.silent) setLoading(false)
        })
    },
    [id],
  )

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const runStatusUpdate = async (action: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await updateOrderStatus(order.id, action)
      if (!res.success) {
        toast.error(res.error || 'Update failed')
        return
      }
      toast.success(`Order ${action}`)
      loadOrder({ silent: true })
    } finally {
      setUpdating(false)
    }
  }

  const pollPayment = useCallback(async (intentId: string, attempts = 0): Promise<boolean> => {
    if (attempts > 30) return false
    const res = await authFetchJson<{
      success: boolean
      data?: { intent?: { status: string } }
    }>(`/api/v2/payments/mpesa?id=${encodeURIComponent(intentId)}`)
    if (res.success && res.data?.intent?.status === 'completed') return true
    if (res.data?.intent?.status === 'failed') return false
    await new Promise((r) => setTimeout(r, 2500))
    return pollPayment(intentId, attempts + 1)
  }, [])

  const payWithMpesa = async () => {
    if (!order || !mpesaPhone.trim()) {
      toast.error('Enter M-Pesa phone (2547XXXXXXXX)')
      return
    }
    setPaying(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        error?: string
        data?: { paymentIntentId: string; paymentSimulated?: boolean }
      }>(`/api/v2/orders/${order.id}/pay/mpesa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: mpesaPhone.trim() }),
      })
      if (!res.success) {
        toast.error(res.error || 'STK failed')
        return
      }
      const intentId = res.data?.paymentIntentId
      if (!intentId) {
        toast.success('Payment initiated')
        loadOrder({ silent: true })
        return
      }
      toast.message('Approve M-Pesa on your phone')
      const paid = await pollPayment(intentId)
      if (paid) {
        toast.success(res.data?.paymentSimulated ? 'Paid (sandbox)' : 'Payment received')
        loadOrder({ silent: true })
      } else {
        toast.error('Payment not confirmed yet — try again or check your phone')
      }
    } catch {
      toast.error('Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const createInvoice = async () => {
    if (!order) return
    setInvoicing(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        error?: string
        data?: { invoice: { id: string; invoice_number: string } }
      }>('/api/v2/accounting/ar/from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, postToGl: true }),
      })
      if (!res.success) {
        toast.error(res.error || 'Could not create invoice')
        return
      }
      toast.success(`Invoice ${res.data?.invoice.invoice_number} created`)
      window.location.href = '/dashboard/accounting/invoices'
    } catch {
      toast.error('Invoice failed')
    } finally {
      setInvoicing(false)
    }
  }

  const statusActions = (o: OrderDetail) => {
    if (o.status === 'pending') {
      return (
        <>
          <Button size="sm" disabled={updating} onClick={() => runStatusUpdate('confirmed')}>
            Confirm
          </Button>
          <Button size="sm" variant="outline" disabled={updating} onClick={() => runStatusUpdate('cancelled')}>
            Cancel
          </Button>
        </>
      )
    }
    if (o.status === 'confirmed') {
      return (
        <Button size="sm" disabled={updating} onClick={() => runStatusUpdate('shipped')}>
          Mark shipped
        </Button>
      )
    }
    if (o.status === 'shipped') {
      return (
        <Button size="sm" disabled={updating} onClick={() => runStatusUpdate('delivered')}>
          Mark delivered
        </Button>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4 py-8">
        <p className="text-muted-foreground">{error ?? 'Order not found'}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const title = order.order_number || `Order ${order.id.slice(0, 8)}`

  const invoiceActions =
    order.status !== 'cancelled' ? (
      <Button
        size="sm"
        variant="secondary"
        className="gap-2"
        disabled={invoicing}
        onClick={createInvoice}
      >
        {invoicing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        Create invoice
      </Button>
    ) : null

  return (
    <ObjectPageShell
      title={title}
      subtitle={`${order.buyer_name ?? 'Buyer'} → ${order.seller_name ?? 'Seller'}`}
      status={order.status}
      backHref="/dashboard/orders"
      actions={
        <>
          {invoiceActions}
          {statusActions(order)}
        </>
      }
      workspaceNav={COMMERCE_WORKSPACE_NAV}
      breadcrumbs={[
        { label: 'Commerce', href: '/dashboard/commerce/cart' },
        { label: 'Orders', href: '/dashboard/orders' },
        { label: title },
      ]}
      tabs={[
        {
          id: 'summary',
          label: 'Summary',
          content: (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={order.payment_status} />
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>KES {Number(order.total).toLocaleString()}</span>
                  </div>
                  {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                    <div className="pt-2 border-t space-y-2">
                      <Label htmlFor="order-mpesa">M-Pesa phone</Label>
                      <Input
                        id="order-mpesa"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="2547XXXXXXXX"
                      />
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        disabled={paying}
                        onClick={payWithMpesa}
                      >
                        {paying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Smartphone className="h-4 w-4" />
                        )}
                        Pay with M-Pesa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {order.delivery_address || 'No delivery address'}
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: 'items',
          label: 'Line items',
          content: (
            <Card>
              <CardContent className="pt-6">
                {(order.items ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No line items</p>
                ) : (
                  <ul className="divide-y text-sm">
                    {(order.items ?? []).map((item) => (
                      <li key={item.id} className="flex justify-between py-3">
                        <span>
                          {item.species_name || item.fish_type || 'Item'} × {item.quantity} kg
                        </span>
                        <span className="font-medium">
                          KES {Number(item.total_price).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ),
        },
      ]}
    />
  )
}
