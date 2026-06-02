import { query, queryOne, execute, generateId, buildPagination, transaction } from '@/lib/db'
import { notFound, conflict } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'
import { resolveTenantId } from '@/lib/tenant'

export interface SalesContractRow {
  id: string
  tenant_id: string
  contract_number: string
  buyer_name: string
  buyer_email: string | null
  buyer_phone: string | null
  customer_id: string | null
  species_id: string | null
  price_per_kg: number
  contracted_kg: number
  delivered_kg: number
  currency: string
  status: string
  start_date: string
  end_date: string
  payment_terms: string | null
  notes: string | null
  created_at: string
  updated_at: string
  species_name?: string | null
}

function contractNumber(): string {
  return `CON-${Date.now().toString(36).toUpperCase()}`
}

export async function listSalesContracts(
  tenantId: string,
  opts: { status?: string; page?: number; limit?: number; customerId?: string } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('c')]
  const params: unknown[] = [tid]
  if (opts.status) {
    conditions.push('c.status = ?')
    params.push(opts.status)
  }
  if (opts.customerId) {
    conditions.push('c.customer_id = ?')
    params.push(opts.customerId)
  }
  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM sales_contracts c ${where}`,
    params,
  )
  const contracts = await query<SalesContractRow>(
    `SELECT c.*, fs.name as species_name
     FROM sales_contracts c
     LEFT JOIN fish_species fs ON c.species_id = fs.id
     ${where}
     ORDER BY c.created_at DESC
     ${pagination.clause}`,
    params,
  )
  return {
    contracts,
    pagination: {
      page,
      limit,
      total: countRow?.total ?? 0,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit) || 1,
    },
  }
}

export async function createSalesContract(
  tenantId: string,
  input: {
    buyerName: string
    buyerEmail?: string | null
    buyerPhone?: string | null
    customerId?: string | null
    speciesId?: string | null
    pricePerKg: number
    contractedKg: number
    currency?: string
    status?: 'draft' | 'active'
    startDate: string
    endDate: string
    paymentTerms?: string | null
    notes?: string | null
  },
): Promise<SalesContractRow> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()
  const number = contractNumber()
  await execute(
    `INSERT INTO sales_contracts (
      id, tenant_id, contract_number, buyer_name, buyer_email, buyer_phone, customer_id,
      species_id, price_per_kg, contracted_kg, currency, status, start_date, end_date,
      payment_terms, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      number,
      input.buyerName,
      input.buyerEmail ?? null,
      input.buyerPhone ?? null,
      input.customerId ?? null,
      input.speciesId ?? null,
      input.pricePerKg,
      input.contractedKg,
      input.currency ?? 'KES',
      input.status ?? 'draft',
      input.startDate,
      input.endDate,
      input.paymentTerms ?? null,
      input.notes ?? null,
    ],
  )
  const row = await queryOne<SalesContractRow>(
    `SELECT c.*, fs.name as species_name FROM sales_contracts c
     LEFT JOIN fish_species fs ON c.species_id = fs.id WHERE c.id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to create contract')
  return row
}

export async function recordContractFulfillment(
  tenantId: string,
  contractId: string,
  input: { quantityKg: number; tripId?: string | null; orderId?: string | null; notes?: string | null },
): Promise<SalesContractRow> {
  const tid = resolveTenantId(tenantId)

  return transaction(async (conn) => {
    const [contractRows] = await conn.execute(
      `SELECT * FROM sales_contracts WHERE id = ? AND ${tenantWhere()} FOR UPDATE`,
      [contractId, tid],
    )
    const contract = (contractRows as SalesContractRow[])[0]
    if (!contract) throw notFound('Contract not found')
    if (contract.status === 'cancelled') throw conflict('Contract is cancelled')

    const qty = Number(input.quantityKg)
    if (qty <= 0) throw conflict('Quantity must be positive')

    const newDelivered = Number(contract.delivered_kg) + qty
    if (newDelivered > Number(contract.contracted_kg) * 1.05) {
      throw conflict('Fulfillment exceeds contracted volume')
    }

    await conn.execute(
      `INSERT INTO sales_contract_fulfillments (id, tenant_id, contract_id, quantity_kg, fulfilled_at, trip_id, order_id, notes)
       VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [generateId(), tid, contractId, qty, input.tripId ?? null, input.orderId ?? null, input.notes ?? null],
    )

    const newStatus = newDelivered >= Number(contract.contracted_kg) ? 'fulfilled' : 'active'
    await conn.execute(
      `UPDATE sales_contracts SET delivered_kg = ?, status = ?, updated_at = NOW() WHERE id = ?`,
      [newDelivered, newStatus, contractId],
    )

    const [updated] = await conn.execute(
      `SELECT c.*, fs.name as species_name FROM sales_contracts c
       LEFT JOIN fish_species fs ON c.species_id = fs.id WHERE c.id = ?`,
      [contractId],
    )
    return (updated as SalesContractRow[])[0]
  })
}

export async function updateSalesContractStatus(
  tenantId: string,
  contractId: string,
  status: 'draft' | 'active' | 'fulfilled' | 'cancelled',
): Promise<SalesContractRow> {
  const tid = resolveTenantId(tenantId)
  const result = await execute(
    `UPDATE sales_contracts SET status = ?, updated_at = NOW() WHERE id = ? AND ${tenantWhere()}`,
    [status, contractId, tid],
  )
  if (result.affectedRows === 0) throw notFound('Contract not found')
  const row = await queryOne<SalesContractRow>(
    `SELECT c.*, fs.name as species_name FROM sales_contracts c
     LEFT JOIN fish_species fs ON c.species_id = fs.id WHERE c.id = ?`,
    [contractId],
  )
  if (!row) throw notFound('Contract not found')
  return row
}

export async function getSalesContractSummary(tenantId: string, customerId?: string) {
  const tid = resolveTenantId(tenantId)
  const conditions = [tenantWhere()]
  const params = [tid]
  if (customerId) {
    conditions.push('customer_id = ?')
    params.push(customerId)
  }
  const [row] = await query<{
    active: number
    draft: number
    total_value: number
    open_kg: number
  }>(
    `SELECT
      SUM(status = 'active') as active,
      SUM(status = 'draft') as draft,
      COALESCE(SUM((contracted_kg - delivered_kg) * price_per_kg), 0) as total_value,
      COALESCE(SUM(GREATEST(contracted_kg - delivered_kg, 0)), 0) as open_kg
     FROM sales_contracts WHERE ${conditions.join(' AND ')} AND status IN ('draft', 'active')`,
    params,
  )
  return {
    active: Number(row?.active ?? 0),
    draft: Number(row?.draft ?? 0),
    openKg: Number(row?.open_kg ?? 0),
    openValueKes: Number(row?.total_value ?? 0),
  }
}
