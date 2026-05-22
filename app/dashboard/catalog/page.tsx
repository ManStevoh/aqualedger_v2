'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
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
import { Fish, Package, Plus, ShoppingCart, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface FishSpecies {
  id: string
  name: string
  market_price_per_kg: number
}

interface ProductCatalogItem {
  id: string
  sku: string
  name: string
  category: string | null
  unit: string
  base_price: number
  status: string
  hs_code: string | null
}

interface MarketplaceStats {
  total_listings: number
  total_available_kg: number
  avg_price: number
}

export default function CatalogPage() {
  const meta = useDashboardPageMeta()

  const [species, setSpecies] = useState<FishSpecies[]>([])
  const [products, setProducts] = useState<ProductCatalogItem[]>([])
  const [stats, setStats] = useState<MarketplaceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [unit, setUnit] = useState('kg')

  const fetchProducts = useCallback(async () => {
    const data = await authFetchJson<{
      success: boolean
      data?: { products: ProductCatalogItem[] }
    }>('/api/v2/commerce/products?limit=100')
    if (data.success && data.data?.products) {
      setProducts(data.data.products)
    } else {
      setProducts([])
    }
  }, [])

  useEffect(() => {
    Promise.all([
      authFetchJson<{ success: boolean; data?: { species: FishSpecies[] } }>('/api/v2/fish-species'),
      authFetchJson<{ success: boolean; data?: { stats: MarketplaceStats } }>(
        '/api/v2/marketplace?limit=1&status=available',
      ),
      fetchProducts(),
    ])
      .then(([speciesRes, marketRes]) => {
        if (speciesRes.success && speciesRes.data?.species) {
          setSpecies(speciesRes.data.species)
        }
        if (marketRes.success && marketRes.data?.stats) {
          setStats(marketRes.data.stats)
        }
      })
      .catch(() => {
        setSpecies([])
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [fetchProducts])

  const handleCreateProduct = async () => {
    if (!sku.trim() || !name.trim()) {
      toast.error('SKU and name are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/commerce/products',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: sku.trim(),
            name: name.trim(),
            category: category.trim() || null,
            basePrice: parseFloat(basePrice) || 0,
            unit,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to add product')
        return
      }
      toast.success('Product added to catalog')
      setShowDialog(false)
      setSku('')
      setName('')
      setCategory('')
      setBasePrice('')
      await fetchProducts()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button asChild variant="outline">
          <Link href="/dashboard/marketplace">View marketplace</Link>
        </Button></>}>
<StatCardGrid>
        <StatCard
          title="Products"
          value={products.length}
          loading={loading}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Species"
          value={species.length}
          loading={loading}
          icon={<Fish className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active listings"
          value={stats?.total_listings ?? 0}
          loading={loading}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg price/kg"
          value={`KES ${Number(stats?.avg_price ?? 0).toFixed(0)}`}
          loading={loading}
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <DataTable
        title="Product catalog"
        description="Tenant product_catalog â€” SKU, pricing, export HS codes"
        loading={loading}
        data={products}
        emptyMessage="No products in catalog â€” add your first SKU"
        actions={
          <Button className="gap-2" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        }
        columns={[
          { key: 'sku', header: 'SKU' },
          { key: 'name', header: 'Name' },
          {
            key: 'category',
            header: 'Category',
            cell: (row) => row.category || 'â€”',
          },
          {
            key: 'base_price',
            header: 'Base price',
            cell: (row) => `KES ${Number(row.base_price).toLocaleString()} / ${row.unit}`,
          },
          {
            key: 'hs_code',
            header: 'HS code',
            cell: (row) => row.hs_code || 'â€”',
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge>{row.status}</Badge>,
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Fish species reference</CardTitle>
          <CardDescription>Species master data from fish_species</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            data={species}
            emptyMessage="No species in catalog"
            columns={[
              { key: 'name', header: 'Species' },
              {
                key: 'market_price_per_kg',
                header: 'Reference price/kg',
                cell: (row) => `KES ${Number(row.market_price_per_kg).toLocaleString()}`,
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add product</DialogTitle>
            <DialogDescription>Register a SKU in product_catalog</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="FSH-TIL-001" />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="crate">crate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Base price (KES)</Label>
                <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateProduct} disabled={submitting}>Add product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

