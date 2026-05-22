import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listExportDocuments,
  createExportDocument,
  updateExportDocument,
  deleteExportDocument,
  type ExportDocType,
  type ExportDocStatus,
} from '@/lib/modules/export/service'

const docTypeEnum = z.enum([
  'certificate_of_origin',
  'health_certificate',
  'catch_certificate',
  'customs_declaration',
  'invoice',
])

const createSchema = z.object({
  orderId: z.string().optional(),
  lotCode: z.string().max(80).optional(),
  docType: docTypeEnum,
  docNumber: z.string().min(1).max(80),
  issuingAuthority: z.string().max(200).optional(),
  destinationCountry: z.string().length(2).optional(),
  hsCode: z.string().max(20).optional(),
  status: z.enum(['draft', 'issued', 'submitted', 'approved', 'rejected']).optional(),
  payload: z.record(z.unknown()).optional(),
  issuedAt: z.string().optional(),
})

const updateSchema = createSchema.partial().extend({
  docNumber: z.string().min(1).max(80).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('export.documents.read')
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const docType = searchParams.get('docType') as ExportDocType | null
  const status = searchParams.get('status') as ExportDocStatus | null
  const lotCode = searchParams.get('lotCode') || undefined

  const { documents, total } = await listExportDocuments(ctx.tenantId, {
    page,
    limit,
    docType: docType || undefined,
    status: status || undefined,
    lotCode,
  })

  return jsonOk({
    documents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  })
}, 'v2/export/documents')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('export.documents.write')
  const body = createSchema.parse(await request.json())
  const document = await createExportDocument(ctx.tenantId, {
    ...body,
    createdBy: ctx.userId,
  })
  return jsonOk({ document }, 201)
}, 'v2/export/documents')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('export.documents.write')
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) throw new Error('Document id is required')
  const body = updateSchema.parse(await request.json())
  const document = await updateExportDocument(ctx.tenantId, id, body)
  return jsonOk({ document })
}, 'v2/export/documents')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('export.documents.write')
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) throw new Error('Document id is required')
  await deleteExportDocument(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/export/documents')
