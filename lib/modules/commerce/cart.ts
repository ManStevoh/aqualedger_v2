import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import type { CartAddItemInput } from './schemas'

export interface CommerceCartRow {
  id: string
  tenant_id: string
  user_id: string
  status: string
  currency: string
  created_at: string
  updated_at: string
}

export interface CommerceCartItemRow {
  id: string
  cart_id: string
  listing_id: string | null
  product_id: string | null
  quantity_kg: number
  unit_price: number
  line_total: number
  notes: string | null
  created_at: string
  listing_title?: string | null
  product_name?: string | null
}

export interface CartWithItems {
  cart: CommerceCartRow
  items: CommerceCartItemRow[]
  subtotal: number
  itemCount: number
}

export async function getOrCreateCart(
  tenantId: string,
  userId: string,
): Promise<CommerceCartRow> {
  const existing = await queryOne<CommerceCartRow>(
    `SELECT * FROM commerce_carts
     WHERE ${tenantWhere()} AND user_id = ? AND status = 'active'`,
    [tenantId, userId],
  )
  if (existing) return existing

  const id = generateId()
  await execute(
    `INSERT INTO commerce_carts (id, tenant_id, user_id, status, currency)
     VALUES (?, ?, ?, 'active', 'KES')`,
    [id, tenantId, userId],
  )

  const cart = await queryOne<CommerceCartRow>(
    'SELECT * FROM commerce_carts WHERE id = ?',
    [id],
  )
  if (!cart) throw new Error('Failed to create cart')
  return cart
}

export async function listCart(tenantId: string, userId: string): Promise<CartWithItems> {
  const cart = await getOrCreateCart(tenantId, userId)

  const items = await query<CommerceCartItemRow>(
    `SELECT ci.*,
            COALESCE(fl.fish_type, fs.name) as listing_title,
            pc.name as product_name
     FROM commerce_cart_items ci
     LEFT JOIN fish_listings fl ON ci.listing_id = fl.id
     LEFT JOIN fish_species fs ON fl.species_id = fs.id
     LEFT JOIN product_catalog pc ON ci.product_id = pc.id
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at ASC`,
    [cart.id],
  )

  const subtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0)

  return {
    cart,
    items,
    subtotal,
    itemCount: items.length,
  }
}

async function resolveItemPricing(
  tenantId: string,
  input: CartAddItemInput,
): Promise<{ unitPrice: number; listingId: string | null; productId: string | null }> {
  if (input.listingId) {
    const listing = await queryOne<{
      id: string
      price_per_kg: number
      available_quantity_kg: number
      status: string
    }>(
      `SELECT id, price_per_kg, available_quantity_kg, status
       FROM fish_listings
       WHERE id = ? AND ${tenantWhere()}`,
      [input.listingId, tenantId],
    )
    if (!listing) throw notFound('Listing not found')
    if (listing.status !== 'available') throw conflict('Listing is not available')
    if (Number(listing.available_quantity_kg) < input.quantityKg) {
      throw conflict('Insufficient quantity available')
    }
    return {
      unitPrice: Number(listing.price_per_kg),
      listingId: input.listingId,
      productId: null,
    }
  }

  const product = await queryOne<{ id: string; base_price: number; status: string }>(
    `SELECT id, base_price, status FROM product_catalog
     WHERE id = ? AND ${tenantWhere()}`,
    [input.productId!, tenantId],
  )
  if (!product) throw notFound('Product not found')
  if (product.status !== 'active') throw conflict('Product is not available')

  return {
    unitPrice: Number(product.base_price),
    listingId: null,
    productId: input.productId!,
  }
}

export async function addItem(
  tenantId: string,
  userId: string,
  input: CartAddItemInput,
): Promise<CartWithItems> {
  const cart = await getOrCreateCart(tenantId, userId)
  const { unitPrice, listingId, productId } = await resolveItemPricing(tenantId, input)
  const lineTotal = Math.round(unitPrice * input.quantityKg * 100) / 100

  const existing = await queryOne<{ id: string; quantity_kg: number }>(
    `SELECT id, quantity_kg FROM commerce_cart_items
     WHERE cart_id = ?
       AND ((listing_id IS NOT NULL AND listing_id = ?) OR (product_id IS NOT NULL AND product_id = ?))`,
    [cart.id, listingId, productId],
  )

  if (existing) {
    const newQty = Number(existing.quantity_kg) + input.quantityKg
    const newLineTotal = Math.round(unitPrice * newQty * 100) / 100
    await execute(
      `UPDATE commerce_cart_items
       SET quantity_kg = ?, line_total = ?, notes = COALESCE(?, notes)
       WHERE id = ?`,
      [newQty, newLineTotal, input.notes ?? null, existing.id],
    )
  } else {
    await execute(
      `INSERT INTO commerce_cart_items (
        id, cart_id, listing_id, product_id, quantity_kg, unit_price, line_total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        cart.id,
        listingId,
        productId,
        input.quantityKg,
        unitPrice,
        lineTotal,
        input.notes ?? null,
      ],
    )
  }

  await execute(
    `UPDATE commerce_carts SET updated_at = NOW() WHERE id = ? AND ${tenantWhere()}`,
    [cart.id, tenantId],
  )

  return listCart(tenantId, userId)
}

export async function removeItem(
  tenantId: string,
  userId: string,
  itemId: string,
): Promise<CartWithItems> {
  const cart = await getOrCreateCart(tenantId, userId)

  const item = await queryOne<{ id: string }>(
    `SELECT ci.id FROM commerce_cart_items ci
     INNER JOIN commerce_carts cc ON ci.cart_id = cc.id
     WHERE ci.id = ? AND ci.cart_id = ? AND cc.user_id = ? AND ${tenantWhere('cc')}`,
    [itemId, cart.id, userId, tenantId],
  )
  if (!item) throw notFound('Cart item not found')

  await execute('DELETE FROM commerce_cart_items WHERE id = ?', [itemId])
  await execute(
    `UPDATE commerce_carts SET updated_at = NOW() WHERE id = ? AND ${tenantWhere()}`,
    [cart.id, tenantId],
  )

  return listCart(tenantId, userId)
}
