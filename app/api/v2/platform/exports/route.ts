import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import {
  listTenantExports,
  processPendingExports,
  queueAllTenantExports,
  queueTenantExport,
} from '@/lib/modules/platform/scheduled-export'

export const GET = apiHandler(async (request: NextRequest) => {
  await requireSuperAdmin()
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50
  const exports = await listTenantExports(limit)
  return jsonOk({ exports })
}, 'v2/platform/exports')

const postSchema = z.object({
  tenantId: z.string().min(1).optional(),
  processLimit: z.number().int().min(1).max(20).optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const admin = await requireSuperAdmin()
  const body = postSchema.parse(await request.json().catch(() => ({})))
  const processLimit = body.processLimit ?? 10

  let queuedIds: string[]
  if (body.tenantId) {
    const id = await queueTenantExport(body.tenantId, admin.userId)
    queuedIds = [id]
  } else {
    queuedIds = await queueAllTenantExports(admin.userId)
  }

  const processed = await processPendingExports(processLimit)
  const exports = await listTenantExports(50)

  return jsonOk({ queued: queuedIds.length, queuedIds, processed, exports }, 201)
}, 'v2/platform/exports')
