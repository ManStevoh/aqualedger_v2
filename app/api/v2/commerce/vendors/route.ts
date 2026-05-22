import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { marketplaceVendorListQuerySchema } from '@/lib/modules/commerce/schemas'
import { listMarketplaceVendors } from '@/lib/modules/commerce/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.vendors.read')
  const { searchParams } = new URL(request.url)
  const query = marketplaceVendorListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listMarketplaceVendors(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/commerce/vendors')
