import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export type ExportDocType =
  | 'certificate_of_origin'
  | 'health_certificate'
  | 'catch_certificate'
  | 'customs_declaration'
  | 'invoice'

export type ExportDocStatus = 'draft' | 'issued' | 'submitted' | 'approved' | 'rejected'

export interface ExportDocument {
  id: string
  tenant_id: string
  order_id: string | null
  lot_code: string | null
  doc_type: ExportDocType
  doc_number: string
  issuing_authority: string | null
  destination_country: string | null
  hs_code: string | null
  status: ExportDocStatus
  payload: unknown
  issued_at: string | null
  created_by: string | null
  created_at: string
}

export interface CreateExportDocumentInput {
  orderId?: string
  lotCode?: string
  docType: ExportDocType
  docNumber: string
  issuingAuthority?: string
  destinationCountry?: string
  hsCode?: string
  status?: ExportDocStatus
  payload?: Record<string, unknown>
  issuedAt?: string
  createdBy?: string
}

export interface UpdateExportDocumentInput {
  orderId?: string | null
  lotCode?: string | null
  docType?: ExportDocType
  docNumber?: string
  issuingAuthority?: string | null
  destinationCountry?: string | null
  hsCode?: string | null
  status?: ExportDocStatus
  payload?: Record<string, unknown> | null
  issuedAt?: string | null
}

export async function listExportDocuments(
  tenantId: string,
  opts: {
    page?: number
    limit?: number
    docType?: ExportDocType
    status?: ExportDocStatus
    lotCode?: string
  } = {},
): Promise<{ documents: ExportDocument[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.docType) {
    conditions.push('doc_type = ?')
    params.push(opts.docType)
  }
  if (opts.status) {
    conditions.push('status = ?')
    params.push(opts.status)
  }
  if (opts.lotCode) {
    conditions.push('lot_code LIKE ?')
    params.push(`%${opts.lotCode}%`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM export_documents ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const documents = await query<ExportDocument>(
    `SELECT * FROM export_documents ${where}
     ORDER BY created_at DESC ${pagination.clause}`,
    params,
  )

  return { documents, total }
}

export async function getExportDocument(
  tenantId: string,
  id: string,
): Promise<ExportDocument | null> {
  return queryOne<ExportDocument>(
    `SELECT * FROM export_documents WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
}

export async function createExportDocument(
  tenantId: string,
  input: CreateExportDocumentInput,
): Promise<ExportDocument> {
  const id = generateId()
  await execute(
    `INSERT INTO export_documents (
      id, tenant_id, order_id, lot_code, doc_type, doc_number,
      issuing_authority, destination_country, hs_code, status, payload, issued_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.orderId || null,
      input.lotCode || null,
      input.docType,
      input.docNumber,
      input.issuingAuthority || null,
      input.destinationCountry || null,
      input.hsCode || null,
      input.status || 'draft',
      input.payload ? JSON.stringify(input.payload) : null,
      input.issuedAt || null,
      input.createdBy || null,
    ],
  )

  const doc = await getExportDocument(tenantId, id)
  if (!doc) throw new Error('Failed to create export document')
  return doc
}

export async function updateExportDocument(
  tenantId: string,
  id: string,
  input: UpdateExportDocumentInput,
): Promise<ExportDocument> {
  const existing = await getExportDocument(tenantId, id)
  if (!existing) throw notFound('Export document not found')

  const sets: string[] = []
  const params: unknown[] = []

  if (input.orderId !== undefined) {
    sets.push('order_id = ?')
    params.push(input.orderId)
  }
  if (input.lotCode !== undefined) {
    sets.push('lot_code = ?')
    params.push(input.lotCode)
  }
  if (input.docType !== undefined) {
    sets.push('doc_type = ?')
    params.push(input.docType)
  }
  if (input.docNumber !== undefined) {
    sets.push('doc_number = ?')
    params.push(input.docNumber)
  }
  if (input.issuingAuthority !== undefined) {
    sets.push('issuing_authority = ?')
    params.push(input.issuingAuthority)
  }
  if (input.destinationCountry !== undefined) {
    sets.push('destination_country = ?')
    params.push(input.destinationCountry)
  }
  if (input.hsCode !== undefined) {
    sets.push('hs_code = ?')
    params.push(input.hsCode)
  }
  if (input.status !== undefined) {
    sets.push('status = ?')
    params.push(input.status)
  }
  if (input.payload !== undefined) {
    sets.push('payload = ?')
    params.push(input.payload ? JSON.stringify(input.payload) : null)
  }
  if (input.issuedAt !== undefined) {
    sets.push('issued_at = ?')
    params.push(input.issuedAt)
  }

  if (sets.length > 0) {
    params.push(id, tenantId)
    await execute(
      `UPDATE export_documents SET ${sets.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const doc = await getExportDocument(tenantId, id)
  if (!doc) throw notFound('Export document not found')
  return doc
}

export async function deleteExportDocument(tenantId: string, id: string): Promise<void> {
  const result = await execute(
    `DELETE FROM export_documents WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    throw notFound('Export document not found')
  }
}
