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
import { Tag, Plus, Trash2, Settings, Percent, Download, RefreshCw, ShoppingCart, Info } from 'lucide-react'

interface PriceTier {
  id: string
  product_id: string
  product_name: string
  sku: string
  customer_segment: 'retail' | 'wholesale' | 'export' | 'restaurant' | 'cooperative'
  min_quantity_kg: number
  unit_price: number
  active: number
}

export default function WholesalePricingPage() {
  const meta = useDashboardPageMeta({ title: 'B2B wholesale pricing' })

  const [tiers, setTiers] = useState<PriceTier[]>([])
  const [products, setProducts] = useState<{ id: string; name: string; sku?: string }[]>([])
  
  // Form state
  const [productId, setProductId] = useState('')
  const [segment, setSegment] = useState<'wholesale' | 'export' | 'restaurant' | 'cooperative'>('wholesale')
  const [minKg, setMinKg] = useState('50')
  const [price, setPrice] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { tiers: PriceTier[] } }>(
        '/api/v2/commerce/wholesale-pricing',
      )
      if (res.success && res.data?.tiers) {
        setTiers(res.data.tiers)
      } else {
        setTiers([])
      }
    } catch {
      toast.error('Failed to load pricing tiers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    authFetchJson<{ success: boolean; data?: { products: { id: string; name: string; sku?: string }[] } }>(
      '/api/v2/commerce/products?limit=100',
    ).then((res) => {
      if (res.success && res.data?.products) {
        setProducts(res.data.products)
        if (res.data.products.length > 0) {
          setProductId(res.data.products[0].id)
        }
      }
    }).catch(() => {})
  }, [load])

  const save = async () => {
    if (!productId) {
      toast.error('Please select a product')
      return
    }
    if (!price || Number(price) <= 0) {
      toast.error('Please enter a valid unit price')
      return
    }
    if (!minKg || Number(minKg) < 0) {
      toast.error('Please enter a valid minimum quantity')
      return
    }

    setSaving(true)
    try {
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
        toast.success('Wholesale pricing tier saved successfully')
        setPrice('')
        load()
      } else {
        toast.error('Failed to save tier')
      }
    } catch {
      toast.error('Failed to save pricing tier')
    } finally {
      setSaving(false)
    }
  }

  const deleteTier = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean }>(
        `/api/v2/commerce/wholesale-pricing?id=${id}`,
        { method: 'DELETE' }
      )
      if (res.success) {
        toast.success('Pricing tier deleted successfully')
        load()
      } else {
        toast.error('Failed to delete pricing tier')
      }
    } catch {
      toast.error('Failed to delete pricing tier')
    }
  }

  // Stats calculations
  const totalTiersCount = tiers.length
  const activeSegmentsCount = new Set(tiers.map(t => t.customer_segment)).size
  const lowestWholesaleRate = tiers.length > 0 
    ? Math.min(...tiers.map(t => t.unit_price)) 
    : 0

  const getSegmentBadge = (seg: string) => {
    switch (seg) {
      case 'wholesale':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Wholesale</Badge>
      case 'restaurant':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Restaurant</Badge>
      case 'export':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Export</Badge>
      case 'cooperative':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Cooperative</Badge>
      default:
        return <Badge variant="outline">{seg}</Badge>
    }
  }

  return (
    <DashboardPageLayout
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild disabled={tiers.length === 0}>
            <a href={`/api/v2/analytics/export?type=commerce-orders&format=csv`} download>
              <Download className="mr-2 h-4 w-4" /> Export Config
            </a>
          </Button>
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Pricing Tiers"
          value={totalTiersCount}
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Configured Segments"
          value={activeSegmentsCount}
          icon={<Settings className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Best Wholesale Rate"
          value={lowestWholesaleRate > 0 ? `KES ${lowestWholesaleRate.toLocaleString(undefined, { maximumFractionDigits: 1 })}/kg` : '—'}
          icon={<Percent className="h-4 w-4 text-emerald-500" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configure Tier</CardTitle>
            <CardDescription>Setup dynamic quantity-based discount schedules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-select">Product Catalog Item</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment-select">Customer Target Segment</Label>
              <Select value={segment} onValueChange={setSegment as any}>
                <SelectTrigger id="segment-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesale">Wholesale Buyer</SelectItem>
                  <SelectItem value="restaurant">Restaurant / HORECA</SelectItem>
                  <SelectItem value="export">International Export</SelectItem>
                  <SelectItem value="cooperative">Cooperative Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min-qty-input">Min Volume (KG)</Label>
                <Input 
                  id="min-qty-input"
                  type="number"
                  min={1}
                  value={minKg}
                  onChange={(e) => setMinKg(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price-input">Unit Price (KES/kg)</Label>
                <Input 
                  id="price-input"
                  type="number"
                  min={1}
                  placeholder="e.g. 350"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 p-3 bg-blue-50/50 rounded-lg text-xs text-sky-800 border border-blue-100">
              <Info className="h-4 w-4 shrink-0 text-sky-600" />
              <span>
                When a buyer orders this product in volumes ≥ {minKg || '0'} kg, this custom price replaces the catalog rate.
              </span>
            </div>

            <Button onClick={save} className="w-full gap-2 mt-2" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? 'Saving...' : 'Add Pricing Tier'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wholesale Discount Schedules</CardTitle>
            <CardDescription>Quantity price rules currently active on the B2B portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Product Name &amp; SKU</th>
                    <th className="text-left py-3 px-4 font-medium">Target Segment</th>
                    <th className="text-right py-3 px-4 font-medium">Min Quantity</th>
                    <th className="text-right py-3 px-4 font-medium">Promo Price</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-xs">
                          {t.product_name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          SKU: {t.sku || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getSegmentBadge(t.customer_segment)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {Number(t.min_quantity_kg).toLocaleString()} kg+
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        KES {Number(t.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => deleteTier(t.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {tiers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {loading ? 'Loading tiers data...' : 'No active pricing tiers configured. Use the form to setup your first discount rule.'}
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
