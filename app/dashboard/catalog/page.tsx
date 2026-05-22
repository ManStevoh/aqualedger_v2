'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
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
    <DashboardPageLayout
      title="Catalog"
      description="GS1 product catalog, species reference, and marketplace"
    >
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
