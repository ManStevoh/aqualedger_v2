import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface StorefrontProductReview {
  id: string
  rating: number
  comment: string | null
  user_name: string | null
  created_at: string
}

export async function listStorefrontProductReviews(
  tenantId: string,
  productId: string,
  limit = 20,
): Promise<{ reviews: StorefrontProductReview[]; avgRating: number; count: number }> {
  const cap = Math.min(Math.max(limit, 1), 50)
  const reviews = await query<StorefrontProductReview>(
    `SELECT mr.id, mr.rating, mr.comment, mr.created_at,
            CONCAT(u.first_name, ' ', u.last_name) as user_name
     FROM marketplace_reviews mr
     LEFT JOIN users u ON mr.user_id = u.id
     WHERE ${tenantWhere('mr')} AND mr.listing_id = ?
     ORDER BY mr.created_at DESC
     LIMIT ${cap}`,
    [tenantId, productId],
  )

  const [summary] = await query<{ avg_rating: number; review_count: number }>(
    `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as review_count
     FROM marketplace_reviews mr
     WHERE ${tenantWhere('mr')} AND mr.listing_id = ?`,
    [tenantId, productId],
  )

  return {
    reviews,
    avgRating: Number(summary?.avg_rating ?? 0),
    count: Number(summary?.review_count ?? 0),
  }
}
