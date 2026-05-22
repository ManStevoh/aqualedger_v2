import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { resolveTenantId, tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import type {
  ProductCatalogCreateInput,
  ProductCatalogUpdateInput,
  CouponCreateInput,
  ProductVariantCreateInput,
  ProductVariantUpdateInput,
  MarketplaceReviewCreateInput,
  LoyaltyAccountUpsertInput,
} from './schemas'

export interface ProductCatalogRow {
  id: string
  tenant_id: string
  sku: string
  name: string
  species_id: string | null
  category: string | null
  unit: string
  base_price: number
  tax_code: string | null
  hs_code: string | null
  status: string
  metadata: string | null
  created_at: string
  updated_at: string
}

export interface CouponRow {
  id: string
  tenant_id: string
  code: string
  discount_type: string
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  uses_count: number
  valid_from: string | null
  valid_to: string | null
  status: string
  created_at: string
}

export interface MarketplaceVendorRow {
  id: string
  tenant_id: string
  user_id: string
  shop_name: string
  commission_rate: number
  status: string
  created_at: string
}

export async function listProductCatalog(
  tenantId?: string | null,
  opts: { status?: string; sku?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('pc')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('pc.status = ?')
    params.push(opts.status)
  }
  if (opts.sku) {
    conditions.push('pc.sku LIKE ?')
    params.push(`%${opts.sku}%`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM product_catalog pc ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const products = await query<ProductCatalogRow>(
    `SELECT pc.* FROM product_catalog pc ${where} ORDER BY pc.name ASC ${pagination.clause}`,
    params,
  )

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createProductCatalog(
  tenantId: string | null | undefined,
  input: ProductCatalogCreateInput,
): Promise<ProductCatalogRow> {
  const tid = resolveTenantId(tenantId)

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM product_catalog WHERE tenant_id = ? AND sku = ?`,
    [tid, input.sku],
  )
  if (existing) {
    throw conflict('SKU already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO product_catalog (
      id, tenant_id, sku, name, species_id, category, unit,
      base_price, tax_code, hs_code, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.sku,
      input.name,
      input.speciesId ?? null,
      input.category ?? null,
      input.unit,
      input.basePrice,
      input.taxCode ?? null,
      input.hsCode ?? null,
      input.status,
    ],
  )

  const product = await queryOne<ProductCatalogRow>(
    'SELECT * FROM product_catalog WHERE id = ?',
    [id],
  )
  if (!product) throw new Error('Failed to create product')
  return product
}

export async function updateProductCatalog(
  tenantId: string | null | undefined,
  input: ProductCatalogUpdateInput,
): Promise<ProductCatalogRow> {
  const tid = resolveTenantId(tenantId)
  const existing = await queryOne<ProductCatalogRow>(
    `SELECT * FROM product_catalog WHERE id = ? AND tenant_id = ?`,
    [input.id, tid],
  )
  if (!existing) {
    throw notFound('Product not found')
  }

  if (input.sku && input.sku !== existing.sku) {
    const dup = await queryOne<{ id: string }>(
      `SELECT id FROM product_catalog WHERE tenant_id = ? AND sku = ? AND id != ?`,
      [tid, input.sku, input.id],
    )
    if (dup) throw conflict('SKU already exists')
  }

  await execute(
    `UPDATE product_catalog SET
      sku = COALESCE(?, sku),
      name = COALESCE(?, name),
      species_id = COALESCE(?, species_id),
      category = COALESCE(?, category),
      unit = COALESCE(?, unit),
      base_price = COALESCE(?, base_price),
      tax_code = COALESCE(?, tax_code),
      hs_code = COALESCE(?, hs_code),
      status = COALESCE(?, status),
      updated_at = NOW()
     WHERE id = ? AND tenant_id = ?`,
    [
      input.sku ?? null,
      input.name ?? null,
      input.speciesId !== undefined ? input.speciesId : null,
      input.category !== undefined ? input.category : null,
      input.unit ?? null,
      input.basePrice ?? null,
      input.taxCode !== undefined ? input.taxCode : null,
      input.hsCode !== undefined ? input.hsCode : null,
      input.status ?? null,
      input.id,
      tid,
    ],
  )

  const product = await queryOne<ProductCatalogRow>(
    'SELECT * FROM product_catalog WHERE id = ?',
    [input.id],
  )
  if (!product) throw new Error('Failed to update product')
  return product
}

export async function listCoupons(
  tenantId?: string | null,
  opts: { status?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('c')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('c.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM coupons c ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const coupons = await query<CouponRow>(
    `SELECT c.* FROM coupons c ${where} ORDER BY c.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    coupons,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createCoupon(
  tenantId: string | null | undefined,
  input: CouponCreateInput,
): Promise<CouponRow> {
  const tid = resolveTenantId(tenantId)
  const code = input.code.toUpperCase()

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM coupons WHERE tenant_id = ? AND code = ?`,
    [tid, code],
  )
  if (existing) {
    throw conflict('Coupon code already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO coupons (
      id, tenant_id, code, discount_type, discount_value,
      min_order_amount, max_uses, valid_from, valid_to, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      code,
      input.discountType,
      input.discountValue,
      input.minOrderAmount,
      input.maxUses ?? null,
      input.validFrom || null,
      input.validTo || null,
      input.status,
    ],
  )

  const coupon = await queryOne<CouponRow>('SELECT * FROM coupons WHERE id = ?', [id])
  if (!coupon) throw new Error('Failed to create coupon')
  return coupon
}

export async function listMarketplaceVendors(
  tenantId?: string | null,
  opts: { status?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('mv')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('mv.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM marketplace_vendors mv ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const vendors = await query<MarketplaceVendorRow>(
    `SELECT mv.* FROM marketplace_vendors mv ${where} ORDER BY mv.shop_name ASC ${pagination.clause}`,
    params,
  )

  return {
    vendors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export interface ProductVariantRow {
  id: string
  product_id: string
  tenant_id: string
  sku: string
  name: string
  grade: string | null
  weight_kg: number | null
  price: number
  stock_kg: number
  status: string
  created_at: string
}

export interface MarketplaceReviewRow {
  id: string
  tenant_id: string
  listing_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  user_name?: string | null
  listing_title?: string | null
}

export interface LoyaltyAccountRow {
  id: string
  tenant_id: string
  customer_id: string
  points: number
  tier: string
  updated_at: string
  customer_name?: string | null
}

export async function listProductVariants(
  tenantId: string,
  productId: string,
  opts: { page?: number; limit?: number; status?: string } = {},
) {
  const product = await queryOne<{ id: string }>(
    `SELECT id FROM product_catalog WHERE id = ? AND tenant_id = ?`,
    [productId, tenantId],
  )
  if (!product) throw notFound('Product not found')

  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = ['pv.product_id = ?', tenantWhere('pv')]
  const params: unknown[] = [productId, tenantId]

  if (opts.status) {
    conditions.push('pv.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM product_variants pv ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const variants = await query<ProductVariantRow>(
    `SELECT pv.* FROM product_variants pv ${where} ORDER BY pv.sku ASC ${pagination.clause}`,
    params,
  )

  return {
    variants,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createProductVariant(
  tenantId: string,
  productId: string,
  input: ProductVariantCreateInput,
): Promise<ProductVariantRow> {
  const product = await queryOne<{ id: string }>(
    `SELECT id FROM product_catalog WHERE id = ? AND tenant_id = ?`,
    [productId, tenantId],
  )
  if (!product) throw notFound('Product not found')

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM product_variants WHERE tenant_id = ? AND sku = ?`,
    [tenantId, input.sku],
  )
  if (existing) throw conflict('Variant SKU already exists')

  const id = generateId()
  await execute(
    `INSERT INTO product_variants (
      id, product_id, tenant_id, sku, name, grade, weight_kg, price, stock_kg, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      productId,
      tenantId,
      input.sku,
      input.name,
      input.grade ?? null,
      input.weightKg ?? null,
      input.price,
      input.stockKg ?? 0,
      input.status ?? 'active',
    ],
  )

  const variant = await queryOne<ProductVariantRow>(
    'SELECT * FROM product_variants WHERE id = ?',
    [id],
  )
  if (!variant) throw new Error('Failed to create variant')
  return variant
}

export async function updateProductVariant(
  tenantId: string,
  productId: string,
  input: ProductVariantUpdateInput,
): Promise<ProductVariantRow> {
  const existing = await queryOne<ProductVariantRow>(
    `SELECT * FROM product_variants WHERE id = ? AND product_id = ? AND tenant_id = ?`,
    [input.id, productId, tenantId],
  )
  if (!existing) throw notFound('Variant not found')

  if (input.sku && input.sku !== existing.sku) {
    const dup = await queryOne<{ id: string }>(
      `SELECT id FROM product_variants WHERE tenant_id = ? AND sku = ? AND id != ?`,
      [tenantId, input.sku, input.id],
    )
    if (dup) throw conflict('Variant SKU already exists')
  }

  await execute(
    `UPDATE product_variants SET
      sku = COALESCE(?, sku),
      name = COALESCE(?, name),
      grade = COALESCE(?, grade),
      weight_kg = COALESCE(?, weight_kg),
      price = COALESCE(?, price),
      stock_kg = COALESCE(?, stock_kg),
      status = COALESCE(?, status)
     WHERE id = ? AND product_id = ? AND tenant_id = ?`,
    [
      input.sku ?? null,
      input.name ?? null,
      input.grade !== undefined ? input.grade : null,
      input.weightKg !== undefined ? input.weightKg : null,
      input.price ?? null,
      input.stockKg ?? null,
      input.status ?? null,
      input.id,
      productId,
      tenantId,
    ],
  )

  const variant = await queryOne<ProductVariantRow>(
    'SELECT * FROM product_variants WHERE id = ?',
    [input.id],
  )
  if (!variant) throw new Error('Failed to update variant')
  return variant
}

export async function listMarketplaceReviews(
  tenantId: string,
  opts: { page?: number; limit?: number; listingId?: string } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('mr')]
  const params: unknown[] = [tenantId]

  if (opts.listingId) {
    conditions.push('mr.listing_id = ?')
    params.push(opts.listingId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM marketplace_reviews mr ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const reviews = await query<MarketplaceReviewRow>(
    `SELECT mr.*,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            COALESCE(fl.fish_type, fs.name) as listing_title
     FROM marketplace_reviews mr
     LEFT JOIN users u ON mr.user_id = u.id
     LEFT JOIN fish_listings fl ON mr.listing_id = fl.id
     LEFT JOIN fish_species fs ON fl.species_id = fs.id
     ${where}
     ORDER BY mr.created_at DESC
     ${pagination.clause}`,
    params,
  )

  const [summary] = await query<{ avg_rating: number; review_count: number }>(
    `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as review_count
     FROM marketplace_reviews mr ${where}`,
    params,
  )

  return {
    reviews,
    summary: summary ?? { avg_rating: 0, review_count: 0 },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createMarketplaceReview(
  tenantId: string,
  userId: string,
  input: MarketplaceReviewCreateInput,
): Promise<MarketplaceReviewRow> {
  const listing = await queryOne<{ id: string }>(
    `SELECT id FROM fish_listings WHERE id = ? AND tenant_id = ?`,
    [input.listingId, tenantId],
  )
  if (!listing) throw notFound('Listing not found')

  const id = generateId()
  await execute(
    `INSERT INTO marketplace_reviews (id, tenant_id, listing_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, tenantId, input.listingId, userId, input.rating, input.comment ?? null],
  )

  const review = await queryOne<MarketplaceReviewRow>(
    `SELECT mr.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
     FROM marketplace_reviews mr
     LEFT JOIN users u ON mr.user_id = u.id
     WHERE mr.id = ?`,
    [id],
  )
  if (!review) throw new Error('Failed to create review')
  return review
}

export async function listLoyaltyAccounts(
  tenantId: string,
  opts: { page?: number; limit?: number; tier?: string; customerId?: string } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('la')]
  const params: unknown[] = [tenantId]

  if (opts.tier) {
    conditions.push('la.tier = ?')
    params.push(opts.tier)
  }
  if (opts.customerId) {
    conditions.push('la.customer_id = ?')
    params.push(opts.customerId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM loyalty_accounts la ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const accounts = await query<LoyaltyAccountRow>(
    `SELECT la.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name
     FROM loyalty_accounts la
     LEFT JOIN users u ON la.customer_id = u.id
     ${where}
     ORDER BY la.points DESC
     ${pagination.clause}`,
    params,
  )

  return {
    accounts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

function tierFromPoints(points: number): string {
  if (points >= 10000) return 'platinum'
  if (points >= 5000) return 'gold'
  if (points >= 1000) return 'silver'
  return 'bronze'
}

export async function upsertLoyaltyAccount(
  tenantId: string,
  input: LoyaltyAccountUpsertInput,
): Promise<LoyaltyAccountRow> {
  const customer = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE id = ?`,
    [input.customerId],
  )
  if (!customer) throw notFound('Customer not found')

  const existing = await queryOne<LoyaltyAccountRow>(
    `SELECT * FROM loyalty_accounts WHERE tenant_id = ? AND customer_id = ?`,
    [tenantId, input.customerId],
  )

  if (existing) {
    let newPoints = existing.points
    if (input.points !== undefined) {
      newPoints = input.points
    } else if (input.pointsDelta !== undefined) {
      newPoints = Math.max(0, existing.points + input.pointsDelta)
    }
    const tier = input.tier ?? tierFromPoints(newPoints)

    await execute(
      `UPDATE loyalty_accounts SET points = ?, tier = ?, updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [newPoints, tier, existing.id, tenantId],
    )

    const account = await queryOne<LoyaltyAccountRow>(
      `SELECT la.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name
       FROM loyalty_accounts la
       LEFT JOIN users u ON la.customer_id = u.id
       WHERE la.id = ?`,
      [existing.id],
    )
    if (!account) throw new Error('Failed to update loyalty account')
    return account
  }

  const points = input.points ?? (input.pointsDelta ? Math.max(0, input.pointsDelta) : 0)
  const tier = input.tier ?? tierFromPoints(points)
  const id = generateId()

  await execute(
    `INSERT INTO loyalty_accounts (id, tenant_id, customer_id, points, tier)
     VALUES (?, ?, ?, ?, ?)`,
    [id, tenantId, input.customerId, points, tier],
  )

  const account = await queryOne<LoyaltyAccountRow>(
    `SELECT la.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name
     FROM loyalty_accounts la
     LEFT JOIN users u ON la.customer_id = u.id
     WHERE la.id = ?`,
    [id],
  )
  if (!account) throw new Error('Failed to create loyalty account')
  return account
}
