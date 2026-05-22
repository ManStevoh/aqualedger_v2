import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'

export interface WishlistRow {
  id: string
  tenant_id: string
  user_id: string
  listing_id: string
  created_at: string
  listing_title?: string | null
  price_per_kg?: number | null
  available_quantity_kg?: number | null
  listing_status?: string | null
}

export async function listWishlist(tenantId: string, userId: string): Promise<WishlistRow[]> {
  return query<WishlistRow>(
    `SELECT w.*,
            COALESCE(fl.fish_type, fs.name) as listing_title,
            fl.price_per_kg,
            fl.available_quantity_kg,
            fl.status as listing_status
     FROM wishlists w
     LEFT JOIN fish_listings fl ON w.listing_id = fl.id
     LEFT JOIN fish_species fs ON fl.species_id = fs.id
     WHERE ${tenantWhere('w')} AND w.user_id = ?
     ORDER BY w.created_at DESC`,
    [tenantId, userId],
  )
}

export async function addToWishlist(
  tenantId: string,
  userId: string,
  listingId: string,
): Promise<WishlistRow> {
  const listing = await queryOne<{ id: string }>(
    `SELECT id FROM fish_listings WHERE id = ? AND ${tenantWhere()}`,
    [listingId, tenantId],
  )
  if (!listing) throw notFound('Listing not found')

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM wishlists WHERE ${tenantWhere()} AND user_id = ? AND listing_id = ?`,
    [tenantId, userId, listingId],
  )
  if (existing) throw conflict('Listing already in wishlist')

  const id = generateId()
  await execute(
    `INSERT INTO wishlists (id, tenant_id, user_id, listing_id) VALUES (?, ?, ?, ?)`,
    [id, tenantId, userId, listingId],
  )

  const row = await queryOne<WishlistRow>(
    `SELECT w.*,
            COALESCE(fl.fish_type, fs.name) as listing_title,
            fl.price_per_kg,
            fl.available_quantity_kg,
            fl.status as listing_status
     FROM wishlists w
     LEFT JOIN fish_listings fl ON w.listing_id = fl.id
     LEFT JOIN fish_species fs ON fl.species_id = fs.id
     WHERE w.id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to add to wishlist')
  return row
}

export async function removeFromWishlist(
  tenantId: string,
  userId: string,
  opts: { listingId?: string; id?: string },
): Promise<void> {
  const conditions = [tenantWhere('w'), 'w.user_id = ?']
  const params: unknown[] = [tenantId, userId]

  if (opts.id) {
    conditions.push('w.id = ?')
    params.push(opts.id)
  } else if (opts.listingId) {
    conditions.push('w.listing_id = ?')
    params.push(opts.listingId)
  } else {
    throw notFound('Wishlist item not found')
  }

  const row = await queryOne<{ id: string }>(
    `SELECT w.id FROM wishlists w WHERE ${conditions.join(' AND ')}`,
    params,
  )
  if (!row) throw notFound('Wishlist item not found')

  await execute('DELETE FROM wishlists WHERE id = ?', [row.id])
}
