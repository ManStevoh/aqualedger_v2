import { query, queryOne, execute, generateId } from '@/lib/db'
import { notFound, conflict } from '@/lib/api-handler'

export interface GuestCartItem {
  id: string
  product_id: string
  quantity_kg: number
  unit_price: number
  line_total: number
  product_name?: string
  image_url?: string | null
  category?: string | null
}

export interface GuestCartView {
  cartId: string
  sessionToken: string
  items: GuestCartItem[]
  subtotal: number
  itemCount: number
}

export async function resolveTenantIdBySlug(slug: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM tenants WHERE slug = ? AND status = 'active'`,
    [slug],
  )
  return row?.id ?? null
}

export async function getOrCreateGuestCart(
  tenantId: string,
  sessionToken: string,
): Promise<{ id: string; session_token: string }> {
  const existing = await queryOne<{ id: string; session_token: string }>(
    `SELECT id, session_token FROM commerce_guest_carts
     WHERE tenant_id = ? AND session_token = ? AND status = 'active'`,
    [tenantId, sessionToken],
  )
  if (existing) return existing

  const id = generateId()
  await execute(
    `INSERT INTO commerce_guest_carts (id, tenant_id, session_token, status, currency)
     VALUES (?, ?, ?, 'active', 'KES')`,
    [id, tenantId, sessionToken],
  )
  return { id, session_token: sessionToken }
}

export async function getGuestCartView(
  tenantId: string,
  sessionToken: string,
): Promise<GuestCartView> {
  const cart = await getOrCreateGuestCart(tenantId, sessionToken)
  const items = await query<GuestCartItem>(
    `SELECT ci.*, pc.name as product_name, pc.image_url, pc.category
     FROM commerce_guest_cart_items ci
     JOIN product_catalog pc ON ci.product_id = pc.id
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at ASC`,
    [cart.id],
  )
  const subtotal = items.reduce((s, i) => s + Number(i.line_total), 0)
  return {
    cartId: cart.id,
    sessionToken,
    items,
    subtotal,
    itemCount: items.length,
  }
}

export async function addGuestCartItem(
  tenantId: string,
  sessionToken: string,
  productId: string,
  quantityKg: number,
): Promise<GuestCartView> {
  const product = await queryOne<{ id: string; base_price: number; status: string; name: string }>(
    `SELECT id, base_price, status, name FROM product_catalog
     WHERE id = ? AND tenant_id = ?`,
    [productId, tenantId],
  )
  if (!product) throw notFound('Product not found')
  if (product.status !== 'active') throw conflict('Product is not available')

  const cart = await getOrCreateGuestCart(tenantId, sessionToken)
  const unitPrice = Number(product.base_price)
  const lineTotal = Math.round(unitPrice * quantityKg * 100) / 100

  const existing = await queryOne<{ id: string; quantity_kg: number }>(
    `SELECT id, quantity_kg FROM commerce_guest_cart_items
     WHERE cart_id = ? AND product_id = ?`,
    [cart.id, productId],
  )

  if (existing) {
    const newQty = Number(existing.quantity_kg) + quantityKg
    const newLine = Math.round(unitPrice * newQty * 100) / 100
    await execute(
      `UPDATE commerce_guest_cart_items
       SET quantity_kg = ?, line_total = ?, unit_price = ?
       WHERE id = ?`,
      [newQty, newLine, unitPrice, existing.id],
    )
  } else {
    await execute(
      `INSERT INTO commerce_guest_cart_items (id, cart_id, product_id, quantity_kg, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [generateId(), cart.id, productId, quantityKg, unitPrice, lineTotal],
    )
  }

  return getGuestCartView(tenantId, sessionToken)
}

export async function removeGuestCartItem(
  tenantId: string,
  sessionToken: string,
  itemId: string,
): Promise<GuestCartView> {
  const cart = await getOrCreateGuestCart(tenantId, sessionToken)
  await execute(
    `DELETE FROM commerce_guest_cart_items WHERE id = ? AND cart_id = ?`,
    [itemId, cart.id],
  )
  return getGuestCartView(tenantId, sessionToken)
}
