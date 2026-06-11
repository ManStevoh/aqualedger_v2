import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { resolveTenantId, tenantWhere } from '@/lib/tenant'
import { conflict } from '@/lib/api-handler'
import { notFound } from '@/lib/api-handler'
import type {
  SupplierCreateInput,
  SupplierUpdateInput,
  PurchaseOrderCreateInput,
  PurchaseRequestCreateInput,
  RfqCreateInput,
  GoodsReceiptCreateInput,
} from './schemas'

export interface SupplierRow {
  id: string
  tenant_id: string
  code: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  country_code: string
  rating: number
  status: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  is_vendor?: boolean | number
}

export interface PurchaseOrderRow {
  id: string
  tenant_id: string
  supplier_id: string
  po_number: string
  status: string
  currency: string
  subtotal: number
  tax_amount: number
  total_amount: number
  expected_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  supplier_name?: string
  lines?: PurchaseOrderLineRow[]
}

export interface PurchaseOrderLineRow {
  id: string
  purchase_order_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  line_total: number
}

export interface RatingHistoryEntry {
  rating: number
  recordedAt: string
  note?: string
}

function parseRatingHistory(notes: string | null): RatingHistoryEntry[] {
  if (!notes) return []
  try {
    const parsed = JSON.parse(notes) as { ratingHistory?: RatingHistoryEntry[] }
    if (Array.isArray(parsed.ratingHistory)) return parsed.ratingHistory
  } catch {
    /* legacy plain-text notes */
  }
  return []
}

function appendRatingHistory(
  notes: string | null,
  rating: number,
  note?: string,
): string {
  let base: { ratingHistory?: RatingHistoryEntry[]; text?: string } = {}
  if (notes) {
    try {
      base = JSON.parse(notes) as { ratingHistory?: RatingHistoryEntry[]; text?: string }
      if (!Array.isArray(base.ratingHistory)) {
        base = { text: notes, ratingHistory: [] }
      }
    } catch {
      base = { text: notes, ratingHistory: [] }
    }
  }
  const history = base.ratingHistory ?? []
  history.unshift({
    rating,
    recordedAt: new Date().toISOString(),
    note,
  })
  return JSON.stringify({ ...base, ratingHistory: history.slice(0, 20) })
}

export async function listSuppliers(
  tenantId?: string | null,
  opts: {
    status?: string
    search?: string
    minRating?: number
    page?: number
    limit?: number
    type?: 'all' | 'vendor' | 'standard'
  } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('s')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('s.status = ?')
    params.push(opts.status)
  }
  if (opts.search) {
    conditions.push('(s.name LIKE ? OR s.code LIKE ? OR s.email LIKE ?)')
    const term = `%${opts.search}%`
    params.push(term, term, term)
  }
  if (opts.minRating !== undefined) {
    conditions.push('s.rating >= ?')
    params.push(opts.minRating)
  }
  if (opts.type === 'vendor') {
    conditions.push('EXISTS (SELECT 1 FROM marketplace_vendors mv WHERE mv.id = s.id)')
  } else if (opts.type === 'standard') {
    conditions.push('NOT EXISTS (SELECT 1 FROM marketplace_vendors mv WHERE mv.id = s.id)')
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM suppliers s ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const suppliers = await query<SupplierRow>(
    `SELECT s.*, 
            (SELECT COUNT(*) FROM marketplace_vendors mv WHERE mv.id = s.id) > 0 AS is_vendor
     FROM suppliers s ${where} ORDER BY s.rating DESC, s.name ASC ${pagination.clause}`,
    params,
  )

  const withHistory = suppliers.map((s) => ({
    ...s,
    is_vendor: !!s.is_vendor,
    ratingHistory: parseRatingHistory(s.notes),
  }))

  return {
    suppliers: withHistory,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createSupplier(
  tenantId: string | null | undefined,
  input: SupplierCreateInput,
  createdBy?: string,
): Promise<SupplierRow> {
  const tid = resolveTenantId(tenantId)

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM suppliers WHERE tenant_id = ? AND code = ?`,
    [tid, input.code],
  )
  if (existing) {
    throw conflict('Supplier code already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO suppliers (id, tenant_id, code, name, contact_name, email, phone, country_code, rating, status, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.code,
      input.name,
      input.contactName || null,
      input.email || null,
      input.phone || null,
      input.countryCode,
      input.rating ?? 0,
      input.status,
      input.notes || null,
      createdBy || null,
    ],
  )

  const supplier = await queryOne<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', [id])
  if (!supplier) throw new Error('Failed to create supplier')
  return supplier
}

export async function listPurchaseOrders(
  tenantId?: string | null,
  opts: { status?: string; supplierId?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('po')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('po.status = ?')
    params.push(opts.status)
  }
  if (opts.supplierId) {
    conditions.push('po.supplier_id = ?')
    params.push(opts.supplierId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM purchase_orders po ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const orders = await query<PurchaseOrderRow>(
    `SELECT po.*, s.name as supplier_name
     FROM purchase_orders po
     JOIN suppliers s ON po.supplier_id = s.id
     ${where}
     ORDER BY po.created_at DESC
     ${pagination.clause}`,
    params,
  )

  if (orders.length > 0) {
    const ids = orders.map((o) => o.id)
    const placeholders = ids.map(() => '?').join(', ')
    const lines = await query<PurchaseOrderLineRow>(
      `SELECT * FROM purchase_order_lines WHERE purchase_order_id IN (${placeholders})`,
      ids,
    )
    const byOrder = new Map<string, PurchaseOrderLineRow[]>()
    for (const line of lines) {
      const list = byOrder.get(line.purchase_order_id) || []
      list.push(line)
      byOrder.set(line.purchase_order_id, list)
    }
    for (const order of orders) {
      order.lines = byOrder.get(order.id) || []
    }
  }

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createPurchaseOrder(
  tenantId: string | null | undefined,
  input: PurchaseOrderCreateInput,
  createdBy?: string,
): Promise<PurchaseOrderRow> {
  const tid = resolveTenantId(tenantId)

  const supplier = await queryOne<{ id: string }>(
    `SELECT id FROM suppliers WHERE id = ? AND tenant_id = ?`,
    [input.supplierId, tid],
  )
  if (!supplier) {
    throw conflict('Supplier not found for this tenant')
  }

  const poNumber =
    input.poNumber || `PO-${Date.now().toString(36).toUpperCase()}`

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM purchase_orders WHERE tenant_id = ? AND po_number = ?`,
    [tid, poNumber],
  )
  if (existing) {
    throw conflict('Purchase order number already exists')
  }

  const subtotal = input.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  )
  const taxAmount = input.taxAmount ?? 0
  const totalAmount = subtotal + taxAmount

  const id = generateId()

  await execute(
    `INSERT INTO purchase_orders (id, tenant_id, supplier_id, po_number, status, currency, subtotal, tax_amount, total_amount, expected_date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.supplierId,
      poNumber,
      input.status,
      input.currency,
      subtotal,
      taxAmount,
      totalAmount,
      input.expectedDate || null,
      input.notes || null,
      createdBy || null,
    ],
  )

  for (const line of input.lines) {
    const lineTotal = line.quantity * line.unitPrice
    await execute(
      `INSERT INTO purchase_order_lines (id, purchase_order_id, description, quantity, unit, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        id,
        line.description,
        line.quantity,
        line.unit,
        line.unitPrice,
        lineTotal,
      ],
    )
  }

  const order = await queryOne<PurchaseOrderRow>(
    `SELECT po.*, s.name as supplier_name
     FROM purchase_orders po
     JOIN suppliers s ON po.supplier_id = s.id
     WHERE po.id = ?`,
    [id],
  )
  if (!order) throw new Error('Failed to create purchase order')

  order.lines = await query<PurchaseOrderLineRow>(
    'SELECT * FROM purchase_order_lines WHERE purchase_order_id = ?',
    [id],
  )
  return order
}

export interface PurchaseRequestRow {
  id: string
  tenant_id: string
  pr_number: string
  requested_by: string | null
  department: string | null
  status: string
  needed_by: string | null
  notes: string | null
  created_at: string
}

export interface RfqRow {
  id: string
  tenant_id: string
  rfq_number: string
  title: string
  status: string
  closing_date: string | null
  created_at: string
}

export interface GoodsReceiptRow {
  id: string
  tenant_id: string
  purchase_order_id: string
  grn_number: string
  received_date: string
  received_by: string | null
  status: string
  notes: string | null
  created_at: string
  po_number?: string
}

export async function updateSupplier(
  tenantId: string | null | undefined,
  supplierId: string,
  input: SupplierUpdateInput,
): Promise<SupplierRow & { ratingHistory: RatingHistoryEntry[] }> {
  const tid = resolveTenantId(tenantId)
  const existing = await queryOne<SupplierRow>(
    `SELECT * FROM suppliers WHERE id = ? AND tenant_id = ?`,
    [supplierId, tid],
  )
  if (!existing) {
    throw notFound('Supplier not found')
  }

  const sets: string[] = []
  const params: unknown[] = []
  let notes = existing.notes

  if (input.code !== undefined) {
    sets.push('code = ?')
    params.push(input.code)
  }
  if (input.name !== undefined) {
    sets.push('name = ?')
    params.push(input.name)
  }
  if (input.contactName !== undefined) {
    sets.push('contact_name = ?')
    params.push(input.contactName)
  }
  if (input.email !== undefined) {
    sets.push('email = ?')
    params.push(input.email || null)
  }
  if (input.phone !== undefined) {
    sets.push('phone = ?')
    params.push(input.phone)
  }
  if (input.countryCode !== undefined) {
    sets.push('country_code = ?')
    params.push(input.countryCode)
  }
  if (input.status !== undefined) {
    sets.push('status = ?')
    params.push(input.status)
  }
  if (input.rating !== undefined) {
    sets.push('rating = ?')
    params.push(input.rating)
    notes = appendRatingHistory(input.notes !== undefined ? input.notes : existing.notes, input.rating)
  } else if (input.notes !== undefined) {
    notes = input.notes
  }
  if (input.notes !== undefined || input.rating !== undefined) {
    sets.push('notes = ?')
    params.push(notes)
  }

  if (sets.length > 0) {
    sets.push('updated_at = NOW()')
    params.push(supplierId, tid)
    await execute(
      `UPDATE suppliers SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
      params,
    )

    // Sync to marketplace_vendors and users tables if this supplier is a marketplace vendor
    const vendorRow = await queryOne<{ user_id: string }>(
      `SELECT user_id FROM marketplace_vendors WHERE id = ?`,
      [supplierId],
    )
    if (vendorRow) {
      const setsVendor: string[] = []
      const paramsVendor: unknown[] = []
      if (input.name !== undefined) {
        setsVendor.push('shop_name = ?')
        paramsVendor.push(input.name)
      }
      if (input.status !== undefined) {
        setsVendor.push('status = ?')
        paramsVendor.push(input.status === 'active' ? 'active' : 'suspended')
      }
      if (setsVendor.length > 0) {
        paramsVendor.push(supplierId)
        await execute(
          `UPDATE marketplace_vendors SET ${setsVendor.join(', ')} WHERE id = ?`,
          paramsVendor,
        )
      }

      const setsUser: string[] = []
      const paramsUser: unknown[] = []
      if (input.email !== undefined) {
        setsUser.push('email = ?')
        paramsUser.push(input.email || null)
      }
      if (input.phone !== undefined) {
        setsUser.push('phone = ?')
        paramsUser.push(input.phone || null)
      }
      if (input.contactName !== undefined) {
        const nameParts = (input.contactName || '').trim().split(/\s+/)
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        setsUser.push('first_name = ?, last_name = ?')
        paramsUser.push(firstName, lastName)
      }
      if (setsUser.length > 0) {
        paramsUser.push(vendorRow.user_id)
        await execute(
          `UPDATE users SET ${setsUser.join(', ')} WHERE id = ?`,
          paramsUser,
        )
      }
    }
  }

  const supplier = await queryOne<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', [supplierId])
  if (!supplier) throw new Error('Failed to update supplier')
  return { ...supplier, ratingHistory: parseRatingHistory(supplier.notes) }
}

/** @deprecated Use updateSupplier */
export async function updateSupplierRating(
  tenantId: string | null | undefined,
  supplierId: string,
  input: SupplierUpdateInput,
): Promise<SupplierRow> {
  const updated = await updateSupplier(tenantId, supplierId, input)
  return updated
}

export async function approvePurchaseRequest(
  tenantId: string | null | undefined,
  requestId: string,
  status: 'approved' | 'rejected' = 'approved',
): Promise<PurchaseRequestRow> {
  const tid = resolveTenantId(tenantId)
  const existing = await queryOne<PurchaseRequestRow>(
    `SELECT * FROM purchase_requests WHERE id = ? AND tenant_id = ?`,
    [requestId, tid],
  )
  if (!existing) {
    throw notFound('Purchase request not found')
  }
  if (!['draft', 'submitted'].includes(existing.status)) {
    throw conflict(`Cannot ${status} a request in status "${existing.status}"`)
  }

  await execute(
    `UPDATE purchase_requests SET status = ? WHERE id = ? AND tenant_id = ?`,
    [status, requestId, tid],
  )

  const row = await queryOne<PurchaseRequestRow>(
    'SELECT * FROM purchase_requests WHERE id = ?',
    [requestId],
  )
  if (!row) throw new Error('Failed to update purchase request')
  return row
}

export async function listPurchaseRequests(
  tenantId?: string | null,
  opts: { status?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('pr')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('pr.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM purchase_requests pr ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const requests = await query<PurchaseRequestRow>(
    `SELECT pr.* FROM purchase_requests pr ${where} ORDER BY pr.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createPurchaseRequest(
  tenantId: string | null | undefined,
  input: PurchaseRequestCreateInput,
  requestedBy?: string,
): Promise<PurchaseRequestRow> {
  const tid = resolveTenantId(tenantId)
  const prNumber = input.prNumber || `PR-${Date.now().toString(36).toUpperCase()}`

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM purchase_requests WHERE tenant_id = ? AND pr_number = ?`,
    [tid, prNumber],
  )
  if (existing) {
    throw conflict('Purchase request number already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO purchase_requests (id, tenant_id, pr_number, requested_by, department, status, needed_by, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      prNumber,
      requestedBy || null,
      input.department || null,
      input.status,
      input.neededBy || null,
      input.notes || null,
    ],
  )

  const row = await queryOne<PurchaseRequestRow>(
    'SELECT * FROM purchase_requests WHERE id = ?',
    [id],
  )
  if (!row) throw new Error('Failed to create purchase request')
  return row
}

export async function listRfqs(
  tenantId?: string | null,
  opts: { status?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('r')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('r.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM rfqs r ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const rfqs = await query<RfqRow>(
    `SELECT r.* FROM rfqs r ${where} ORDER BY r.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    rfqs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createRfq(
  tenantId: string | null | undefined,
  input: RfqCreateInput,
): Promise<RfqRow> {
  const tid = resolveTenantId(tenantId)
  const rfqNumber = input.rfqNumber || `RFQ-${Date.now().toString(36).toUpperCase()}`

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM rfqs WHERE tenant_id = ? AND rfq_number = ?`,
    [tid, rfqNumber],
  )
  if (existing) {
    throw conflict('RFQ number already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO rfqs (id, tenant_id, rfq_number, title, status, closing_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, tid, rfqNumber, input.title, input.status, input.closingDate || null],
  )

  const row = await queryOne<RfqRow>('SELECT * FROM rfqs WHERE id = ?', [id])
  if (!row) throw new Error('Failed to create RFQ')
  return row
}

export async function listGoodsReceipts(
  tenantId?: string | null,
  opts: { purchaseOrderId?: string; status?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('gr')]
  const params: unknown[] = [tid]

  if (opts.purchaseOrderId) {
    conditions.push('gr.purchase_order_id = ?')
    params.push(opts.purchaseOrderId)
  }
  if (opts.status) {
    conditions.push('gr.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM goods_receipts gr ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const receipts = await query<GoodsReceiptRow>(
    `SELECT gr.*, po.po_number
     FROM goods_receipts gr
     JOIN purchase_orders po ON gr.purchase_order_id = po.id
     ${where}
     ORDER BY gr.received_date DESC, gr.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return {
    receipts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createGoodsReceipt(
  tenantId: string | null | undefined,
  input: GoodsReceiptCreateInput,
  receivedBy?: string,
): Promise<GoodsReceiptRow> {
  const tid = resolveTenantId(tenantId)

  const po = await queryOne<{ id: string; status: string }>(
    `SELECT id, status FROM purchase_orders WHERE id = ? AND tenant_id = ?`,
    [input.purchaseOrderId, tid],
  )
  if (!po) {
    throw notFound('Purchase order not found')
  }

  const grnNumber = input.grnNumber || `GRN-${Date.now().toString(36).toUpperCase()}`
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM goods_receipts WHERE tenant_id = ? AND grn_number = ?`,
    [tid, grnNumber],
  )
  if (existing) {
    throw conflict('GRN number already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO goods_receipts (id, tenant_id, purchase_order_id, grn_number, received_date, received_by, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.purchaseOrderId,
      grnNumber,
      input.receivedDate,
      receivedBy || null,
      input.status,
      input.notes || null,
    ],
  )

  if (input.status === 'posted') {
    await execute(
      `UPDATE purchase_orders SET status = 'received', updated_at = NOW() WHERE id = ? AND tenant_id = ?`,
      [input.purchaseOrderId, tid],
    )
  }

  const receipt = await queryOne<GoodsReceiptRow>(
    `SELECT gr.*, po.po_number
     FROM goods_receipts gr
     JOIN purchase_orders po ON gr.purchase_order_id = po.id
     WHERE gr.id = ?`,
    [id],
  )
  if (!receipt) throw new Error('Failed to create goods receipt')
  return receipt
}
