'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { ExportCsvButton } from '@/components/dashboard/export-csv-button'
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
import { MessageSquare, Star } from 'lucide-react'
import { toast } from 'sonner'

interface Review {
  id: string
  listing_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  user_name?: string | null
  listing_title?: string | null
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export default function CommerceReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listingFilter, setListingFilter] = useState('')

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (listingFilter.trim()) params.set('listingId', listingFilter.trim())
      const res = await authFetchJson<{
        success: boolean
        data?: { reviews: Review[]; summary: { avg_rating: number; review_count: number } }
      }>(`/api/v2/commerce/reviews?${params}`)
      if (res.success && res.data) {
        setReviews(res.data.reviews)
        setAvgRating(Number(res.data.summary?.avg_rating ?? 0))
      } else {
        setReviews([])
        setAvgRating(0)
      }
    } catch {
      setReviews([])
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [listingFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return (
    <DashboardPageLayout
      title="Marketplace Reviews"
      description="Buyer feedback on fish listings"
    >
            <StatCardGrid>
        <StatCard
          title="Total reviews"
          value={reviews.length}
          loading={loading}
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Average rating"
          value={avgRating.toFixed(1)}
          loading={loading}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          description="Out of 5 stars"
        />
      </StatCardGrid>

      <Card>
        <CardHeader>
          <CardTitle>All reviews</CardTitle>
          <CardDescription>Tenant-scoped from `marketplace_reviews`</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              className="max-w-xs"
              placeholder="Filter by listing ID"
              value={listingFilter}
              onChange={(e) => setListingFilter(e.target.value)}
            />
            <Button variant="secondary" size="sm" onClick={fetchReviews}>Apply</Button>
            <ExportCsvButton
              data={reviews.map((r) => ({
                listing: r.listing_title || r.listing_id,
                reviewer: r.user_name || 'Anonymous',
                rating: r.rating,
                comment: r.comment ?? '',
                date: new Date(r.created_at).toLocaleString(),
              }))}
              filename="marketplace-reviews"
              columns={[
                { key: 'listing', label: 'Listing' },
                { key: 'reviewer', label: 'Reviewer' },
                { key: 'rating', label: 'Rating' },
                { key: 'comment', label: 'Comment' },
                { key: 'date', label: 'Date' },
              ]}
            />
          </div>

          <DataTable
            loading={loading}
            data={reviews}
            emptyMessage="No reviews yet"
            columns={[
              {
                key: 'listing_title',
                header: 'Listing',
                cell: (r) => r.listing_title || r.listing_id.slice(0, 8),
              },
              {
                key: 'user_name',
                header: 'Reviewer',
                cell: (r) => r.user_name || 'Anonymous',
              },
              {
                key: 'rating',
                header: 'Rating',
                cell: (r) => <StarRating value={r.rating} />,
              },
              {
                key: 'comment',
                header: 'Comment',
                cell: (r) => (
                  <span className="line-clamp-2 max-w-md text-muted-foreground">
                    {r.comment || '—'}
                  </span>
                ),
              },
              {
                key: 'created_at',
                header: 'Date',
                cell: (r) => new Date(r.created_at).toLocaleDateString(),
              },
            ]}
          />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
