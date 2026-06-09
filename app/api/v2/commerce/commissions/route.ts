import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { commissionListQuerySchema } from '@/lib/modules/commerce/schemas'
import { listCommissions } from '@/lib/modules/commerce/commissions'
import { queryOne } from '@/lib/db'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.payouts.read')
  const { searchParams } = new URL(request.url)
  let vendorId = searchParams.get('vendorId') ?? undefined

  if (ctx.memberRole === 'vendor') {
    const vendor = await queryOne<{ id: string }>(
      `SELECT id FROM marketplace_vendors WHERE tenant_id = ? AND user_id = ?`,
      [ctx.tenantId, ctx.userId]
    )
    vendorId = vendor?.id ?? 'none'
  }

  const query = commissionListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    vendorId,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listCommissions(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/commerce/commissions')
