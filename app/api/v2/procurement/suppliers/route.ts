import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  supplierCreateSchema,
  supplierListQuerySchema,
  supplierUpdateSchema,
} from '@/lib/modules/procurement/schemas'
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
} from '@/lib/modules/procurement/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.suppliers.read')
  const { searchParams } = new URL(request.url)
  const query = supplierListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    minRating: searchParams.get('minRating') ?? undefined,
    type: searchParams.get('type') ?? undefined,
  })

  const data = await listSuppliers(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/procurement/suppliers')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.suppliers.write')
  const body = supplierCreateSchema.parse(await request.json())
  const supplier = await createSupplier(ctx.tenantId, body, ctx.userId)
  return jsonOk({ supplier }, 201)
}, 'v2/procurement/suppliers')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.suppliers.write')
  const body = await request.json()
  const supplierId = body.supplierId as string
  if (!supplierId) {
    throw new Error('supplierId is required')
  }
  const parsed = supplierUpdateSchema.parse(body)
  const supplier = await updateSupplier(ctx.tenantId, supplierId, parsed)
  return jsonOk({ supplier })
}, 'v2/procurement/suppliers')
