'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { authFetchJson } from '@/lib/api'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface WishlistItem {
  id: string
  listing_id: string
  created_at: string
  listing_title?: string | null
  price_per_kg?: number | null
  available_quantity_kg?: number | null
  listing_status?: string | null
}

export default function CommerceWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)

  const fetchWishlist = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { items: WishlistItem[] }
      }>('/api/v2/commerce/wishlist')
      if (res.success && res.data?.items) {
        setItems(res.data.items)
      } else {
        setItems([])
      }
    } catch {
      setItems([])
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (listingId: string, id: string) => {
    setRemovingId(id)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/commerce/wishlist?listingId=${listingId}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to remove')
        return
      }
      toast.success('Removed from wishlist')
      await fetchWishlist()
    } catch {
      toast.error('Network error')
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = async (item: WishlistItem) => {
    if (item.listing_status !== 'available') {
      toast.error('Listing is not available')
      return
    }
    setAddingId(item.id)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/commerce/cart',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: item.listing_id,
            quantityKg: 1,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to add to cart')
        return
      }
      toast.success('Added to cart')
    } catch {
      toast.error('Network error')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <DashboardPageLayout
      title="Wishlist"
      description="Saved listings for quick reorder"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Saved listings
          </CardTitle>
          <CardDescription>Tenant-scoped wishlist for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            data={items}
            emptyMessage="No saved listings yet"
            columns={[
              {
                key: 'listing_title',
                header: 'Listing',
                cell: (row) => row.listing_title || row.listing_id,
              },
              {
                key: 'price_per_kg',
                header: 'Price/kg',
                cell: (row) =>
                  row.price_per_kg != null
                    ? `KES ${Number(row.price_per_kg).toLocaleString()}`
                    : '—',
              },
              {
                key: 'available_quantity_kg',
                header: 'Available',
                cell: (row) =>
                  row.available_quantity_kg != null
                    ? `${Number(row.available_quantity_kg).toFixed(1)} kg`
                    : '—',
              },
              {
                key: 'listing_status',
                header: 'Status',
                cell: (row) => (
                  <Badge variant={row.listing_status === 'available' ? 'default' : 'secondary'}>
                    {row.listing_status || 'unknown'}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: '',
                cell: (row) => (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={addingId === row.id || row.listing_status !== 'available'}
                      onClick={() => handleAddToCart(row)}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removingId === row.id}
                      onClick={() => handleRemove(row.listing_id, row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
