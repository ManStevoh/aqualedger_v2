'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { ShoppingCart, Trash2, Smartphone, Banknote } from 'lucide-react'
import { toast } from 'sonner'

type PaymentMethod = 'mpesa' | 'cod' | 'paystack'

interface CartItem {
  id: string
  listing_id: string | null
  product_id: string | null
  quantity_kg: number
  unit_price: number
  line_total: number
  notes: string | null
  listing_title?: string | null
  product_name?: string | null
}

interface CartData {
  cart: { id: string; currency: string; status: string }
  items: CartItem[]
  subtotal: number
  itemCount: number
}

export default function CommerceCartPage() {
  const meta = useDashboardPageMeta()

  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

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

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: CartData }>(
        '/api/v2/commerce/cart',
      )
      if (res.success && res.data) {
        setCart(res.data)
      } else {
        setCart(null)
      }
    } catch {
      setCart(null)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId)
    try {
      const res = await authFetchJson<{ success: boolean; data?: CartData; error?: string }>(
        `/api/v2/commerce/cart?itemId=${itemId}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to remove item')
        return
      }
      if (res.data) setCart(res.data)
      toast.success('Item removed')
    } catch {
      toast.error('Network error')
    } finally {
      setRemovingId(null)
    }
  }

  const handleCheckout = async () => {
    if (!cart?.cart.id || cart.items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    if (paymentMethod === 'mpesa' && !phoneNumber.trim()) {
      toast.error('Enter M-Pesa phone (2547XXXXXXXX)')
      return
    }
    setCheckingOut(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: {
          checkout: {
            orderNumber: string
            orderId: string
            total: number
            paymentIntentId?: string
            paymentPending?: boolean
            paymentSimulated?: boolean
            checkoutUrl?: string
          }
        }
        error?: string
      }>('/api/v2/commerce/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.cart.id,
          couponCode: couponCode.trim() || null,
          deliveryAddress: deliveryAddress.trim() || null,
          paymentMethod,
          phoneNumber: paymentMethod === 'mpesa' ? phoneNumber.trim() : undefined,
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Checkout failed')
        return
      }
      const checkout = res.data?.checkout
      if (!checkout) {
        toast.error('Checkout failed')
        return
      }

      if (checkout.paymentIntentId && paymentMethod === 'mpesa') {
        toast.message('Approve M-Pesa on your phone', {
          description: 'Waiting for payment confirmation…',
        })
        const paid = await pollPayment(checkout.paymentIntentId)
        if (!paid) {
          toast.error('Payment not confirmed yet. Open the order to retry or check status.')
          window.location.href = `/dashboard/orders/${checkout.orderId}`
          return
        }
      }

      toast.success(
        checkout.paymentSimulated
          ? `Order ${checkout.orderNumber} paid (sandbox)`
          : `Order ${checkout.orderNumber} placed — KES ${Number(checkout.total).toLocaleString()}`,
      )
      setCouponCode('')
      setPhoneNumber('')
      if (checkout.orderId) {
        window.location.href = `/dashboard/orders/${checkout.orderId}`
        return
      }
      await fetchCart()
    } catch {
      toast.error('Network error')
    } finally {
      setCheckingOut(false)
    }
  }

  const itemLabel = (row: CartItem) =>
    row.listing_title || row.product_name || row.listing_id || row.product_id || 'Item'

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart items
            </CardTitle>
            <CardDescription>Tenant-scoped cart for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              loading={loading}
              data={cart?.items ?? []}
              emptyMessage="Your cart is empty"
              columns={[
                {
                  key: 'name',
                  header: 'Item',
                  cell: (row) => itemLabel(row),
                },
                {
                  key: 'quantity_kg',
                  header: 'Qty (kg)',
                  cell: (row) => Number(row.quantity_kg).toFixed(2),
                },
                {
                  key: 'unit_price',
                  header: 'Unit price',
                  cell: (row) => `KES ${Number(row.unit_price).toLocaleString()}`,
                },
                {
                  key: 'line_total',
                  header: 'Line total',
                  cell: (row) => `KES ${Number(row.line_total).toLocaleString()}`,
                },
                {
                  key: 'actions',
                  header: '',
                  cell: (row) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={removingId === row.id}
                      onClick={() => handleRemove(row.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>M-Pesa STK or pay on delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  KES {Number(cart?.subtotal ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <Badge variant="secondary">{cart?.itemCount ?? 0}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (16%)</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                  className="gap-2 text-xs"
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  <Smartphone className="h-4 w-4" />
                  M-Pesa
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'paystack' ? 'default' : 'outline'}
                  className="gap-2 text-xs"
                  onClick={() => setPaymentMethod('paystack')}
                >
                  Paystack
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'cod' ? 'default' : 'outline'}
                  className="gap-2 text-xs"
                  onClick={() => setPaymentMethod('cod')}
                >
                  <Banknote className="h-4 w-4" />
                  COD
                </Button>
              </div>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone">M-Pesa phone</Label>
                <Input
                  id="mpesa-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="2547XXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">STK push to your phone after placing the order</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon code</Label>
              <Input
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery address</Label>
              <Input
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <Button
              className="w-full gap-2"
              disabled={checkingOut || loading || !cart?.items.length}
              onClick={handleCheckout}
            >
              <Smartphone className="h-4 w-4" />
              {checkingOut ? 'Processing…' : paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Place order'}
            </Button>
            <Button variant="link" className="w-full p-0 h-auto" asChild>
              <Link href="/dashboard/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
