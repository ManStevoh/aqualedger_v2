'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function WholesalePricingPage() {
  const [tiers, setTiers] = useState<Record<string, unknown>[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [productId, setProductId] = useState('')
  const [segment, setSegment] = useState('wholesale')
  const [minKg, setMinKg] = useState('50')
  const [price, setPrice] = useState('')

  const load = () => {
    authFetchJson<{ success: boolean; data?: { tiers: Record<string, unknown>[] } }>(
      '/api/v2/commerce/wholesale-pricing',
    ).then((res) => {
      if (res.success && res.data?.tiers) setTiers(res.data.tiers)
    })
  }

  useEffect(() => {
    load()
    authFetchJson<{ success: boolean; data?: { products: { id: string; name: string }[] } }>(
      '/api/v2/commerce/products?limit=100',
    ).then((res) => {
      if (res.success && res.data?.products) setProducts(res.data.products)
    })
  }, [])

  const save = async () => {
    const res = await authFetchJson<{ success: boolean }>('/api/v2/commerce/wholesale-pricing', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        customerSegment: segment,
        minQuantityKg: Number(minKg),
        unitPrice: Number(price),
      }),
    })
    if (res.success) {
      toast.success('Tier saved')
      load()
    }
  }

  return (
    <DashboardPageLayout
      title="B2B wholesale pricing"
      description="Volume tiers by customer segment and minimum order quantity"
    >
      <Card>
        <CardHeader><CardTitle>Add / update tier</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Segment</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="cooperative">Cooperative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Min kg</Label><Input type="number" value={minKg} onChange={(e) => setMinKg(e.target.value)} /></div>
          <div><Label>Unit price (KES)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={save}>Save tier</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Active tiers</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {tiers.map((t) => (
            <div key={String(t.id)} className="flex justify-between border-b py-2">
              <span>{String(t.product_name)} ({String(t.sku)})</span>
              <span>{String(t.customer_segment)} · min {Number(t.min_quantity_kg)} kg · KES {Number(t.unit_price)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
