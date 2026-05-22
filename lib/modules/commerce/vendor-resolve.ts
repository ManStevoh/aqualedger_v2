import type { Connection } from 'mysql2/promise'
import { queryOne } from '@/lib/db'
import { conflict } from '@/lib/api-handler'

export interface ResolvedVendor {
  vendorId: string
  userId: string
  commissionRate: number
}

export function parseVendorIdFromMetadata(metadata: unknown): string | null {
  if (!metadata) return null
  try {
    const meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
    if (meta && typeof meta === 'object' && typeof meta.vendor_id === 'string') {
      return meta.vendor_id
    }
  } catch {
    /* ignore */
  }
  return null
}

async function loadVendorById(
  conn: Connection | null,
  tenantId: string,
  vendorId: string,
): Promise<ResolvedVendor | null> {
  const sql = `SELECT id, user_id, commission_rate FROM marketplace_vendors
     WHERE id = ? AND tenant_id = ? AND status = 'active'`
  if (conn) {
    const [rows] = await conn.execute(sql, [vendorId, tenantId])
    const row = (rows as { id: string; user_id: string; commission_rate: number }[])[0]
    if (!row) return null
    return {
      vendorId: row.id,
      userId: row.user_id,
      commissionRate: Number(row.commission_rate),
    }
  }
  const row = await queryOne<{ id: string; user_id: string; commission_rate: number }>(sql, [
    vendorId,
    tenantId,
  ])
  if (!row) return null
  return {
    vendorId: row.id,
    userId: row.user_id,
    commissionRate: Number(row.commission_rate),
  }
}

export async function resolveDefaultVendor(
  conn: Connection | null,
  tenantId: string,
): Promise<ResolvedVendor | null> {
  const sql = `SELECT id, user_id, commission_rate FROM marketplace_vendors
     WHERE tenant_id = ? AND status = 'active' ORDER BY created_at ASC LIMIT 1`
  if (conn) {
    const [rows] = await conn.execute(sql, [tenantId])
    const row = (rows as { id: string; user_id: string; commission_rate: number }[])[0]
    if (!row) return null
    return {
      vendorId: row.id,
      userId: row.user_id,
      commissionRate: Number(row.commission_rate),
    }
  }
  const row = await queryOne<{ id: string; user_id: string; commission_rate: number }>(sql, [tenantId])
  if (!row) return null
  return {
    vendorId: row.id,
    userId: row.user_id,
    commissionRate: Number(row.commission_rate),
  }
}

export async function resolveProductVendor(
  conn: Connection | null,
  tenantId: string,
  productId: string,
): Promise<ResolvedVendor | null> {
  const sql = `SELECT vendor_id, metadata FROM product_catalog WHERE id = ? AND tenant_id = ?`
  let vendorId: string | null = null
  let metadata: unknown = null

  if (conn) {
    const [rows] = await conn.execute(sql, [productId, tenantId])
    const row = (rows as { vendor_id: string | null; metadata: unknown }[])[0]
    if (!row) return null
    vendorId = row.vendor_id
    metadata = row.metadata
  } else {
    const row = await queryOne<{ vendor_id: string | null; metadata: unknown }>(sql, [
      productId,
      tenantId,
    ])
    if (!row) return null
    vendorId = row.vendor_id
    metadata = row.metadata
  }

  const fromMeta = parseVendorIdFromMetadata(metadata)
  const resolvedId = vendorId || fromMeta
  if (resolvedId) {
    const vendor = await loadVendorById(conn, tenantId, resolvedId)
    if (vendor) return vendor
  }
  return resolveDefaultVendor(conn, tenantId)
}

export interface VendorLineShare {
  vendor: ResolvedVendor
  lineTotal: number
}

export function groupCartLinesByVendor(
  lines: { productId: string; lineTotal: number; vendor: ResolvedVendor }[],
): VendorLineShare[] {
  const map = new Map<string, VendorLineShare>()
  for (const line of lines) {
    const cur = map.get(line.vendor.vendorId) || {
      vendor: line.vendor,
      lineTotal: 0,
    }
    cur.lineTotal += line.lineTotal
    map.set(line.vendor.vendorId, cur)
  }
  return [...map.values()]
}

export function pickPrimarySeller(shares: VendorLineShare[]): ResolvedVendor {
  if (shares.length === 0) throw conflict('No active vendor for checkout')
  return shares.reduce((a, b) => (b.lineTotal > a.lineTotal ? b : a)).vendor
}

export function allocateVendorCommissions(
  shares: VendorLineShare[],
  orderSubtotal: number,
  orderTotal: number,
): { vendor: ResolvedVendor; orderAmount: number; commissionAmount: number }[] {
  if (orderSubtotal <= 0) return []
  return shares.map((share) => {
    const ratio = share.lineTotal / orderSubtotal
    const orderAmount = Math.round(orderTotal * ratio * 100) / 100
    const commissionAmount =
      Math.round(orderAmount * (share.vendor.commissionRate / 100) * 100) / 100
    return {
      vendor: share.vendor,
      orderAmount,
      commissionAmount,
    }
  })
}
