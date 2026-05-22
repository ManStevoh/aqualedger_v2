import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  loyaltyAccountListQuerySchema,
  loyaltyAccountUpsertSchema,
} from '@/lib/modules/commerce/schemas'
import {
  listLoyaltyAccounts,
  upsertLoyaltyAccount,
} from '@/lib/modules/commerce/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.loyalty.read')
  const { searchParams } = new URL(request.url)
  const query = loyaltyAccountListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    tier: searchParams.get('tier') ?? undefined,
    customerId: searchParams.get('customerId') ?? undefined,
  })

  const data = await listLoyaltyAccounts(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/commerce/loyalty')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.loyalty.write')
  const body = loyaltyAccountUpsertSchema.parse(await request.json())
  const account = await upsertLoyaltyAccount(ctx.tenantId, body)
  return jsonOk({ account })
}, 'v2/commerce/loyalty')
