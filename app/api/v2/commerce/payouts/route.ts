import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  payoutCreateSchema,
  payoutListQuerySchema,
  payoutMarkPaidSchema,
} from '@/lib/modules/commerce/schemas'
import {
  listPayouts,
  createPayout,
  markPayoutPaid,
} from '@/lib/modules/commerce/commissions'
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

  const query = payoutListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    vendorId,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listPayouts(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/commerce/payouts')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.payouts.write')
  const body = payoutCreateSchema.parse(await request.json())
  const payout = await createPayout(ctx.tenantId, body)
  return jsonOk({ payout }, 201)
}, 'v2/commerce/payouts')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.payouts.write')
  const body = payoutMarkPaidSchema.parse(await request.json())
  const payout = await markPayoutPaid(ctx.tenantId, body.payoutId)
  return jsonOk({ payout })
}, 'v2/commerce/payouts')
