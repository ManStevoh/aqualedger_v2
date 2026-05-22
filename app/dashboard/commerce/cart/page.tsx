'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

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
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

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
    setCheckingOut(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { checkout: { orderNumber: string; total: number } }
        error?: string
      }>('/api/v2/commerce/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.cart.id,
          couponCode: couponCode.trim() || null,
          deliveryAddress: deliveryAddress.trim() || null,
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Checkout failed')
        return
      }
      const orderNumber = res.data?.checkout.orderNumber
      const total = res.data?.checkout.total
      toast.success(
        orderNumber
          ? `Order ${orderNumber} placed — KES ${Number(total).toLocaleString()}`
          : 'Order placed',
      )
      setCouponCode('')
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
    <DashboardPageLayout
      title="Shopping cart"
      description="Review items and complete checkout. Add listings from Marketplace."
    >
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
            <CardDescription>Apply a coupon and confirm your order</CardDescription>
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
              <CreditCard className="h-4 w-4" />
              {checkingOut ? 'Processing…' : 'Checkout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
