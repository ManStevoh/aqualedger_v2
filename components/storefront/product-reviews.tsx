'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { publicApiFetch } from '@/lib/client-api'

interface ReviewRow {
  id: string
  rating: number
  comment: string | null
  user_name: string | null
  created_at: string
}

interface ProductReviewsProps {
  storeSlug: string
  productId: string
}

export function ProductReviews({ storeSlug, productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApiFetch(`/store/${storeSlug}/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setReviews(data.data.reviews || [])
          setAvgRating(Number(data.data.avgRating ?? 0))
          setCount(Number(data.data.count ?? 0))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug, productId])

  if (loading) {
    return <p className="mt-8 text-sm text-[var(--sf-text-muted)]">Loading reviews…</p>
  }

  if (count === 0) {
    return (
      <section className="mt-10 border-t border-[var(--sf-border)] pt-8" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-lg font-semibold">Customer reviews</h2>
        <p className="mt-2 text-sm text-[var(--sf-text-muted)]">No reviews yet for this product.</p>
      </section>
    )
  }

  return (
    <section className="mt-10 border-t border-[var(--sf-border)] pt-8" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="reviews-heading" className="text-lg font-semibold">Customer reviews</h2>
        <div className="flex items-center gap-1 text-sm">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-4 w-4 ${n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--sf-text-muted)]/30'}`}
            />
          ))}
          <span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
          <span className="text-[var(--sf-text-muted)]">({count})</span>
        </div>
      </div>
      <ul className="mt-4 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-[var(--sf-radius)] border border-[var(--sf-border)] p-4 bg-[var(--sf-surface)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{r.user_name?.trim() || 'Verified buyer'}</span>
              <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--sf-text-muted)]/30'}`}
                  />
                ))}
              </div>
            </div>
            {r.comment && <p className="mt-2 text-sm text-[var(--sf-text-muted)]">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
