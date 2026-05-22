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
import { Loader2 } from 'lucide-react'
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

  return (
    <ObjectPageShell
      title={title}
      subtitle={`${order.buyer_name ?? 'Buyer'} → ${order.seller_name ?? 'Seller'}`}
      status={order.status}
      backHref="/dashboard/orders"
      actions={statusActions(order)}
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
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={order.payment_status} />
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>KES {Number(order.total).toLocaleString()}</span>
                  </div>
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
