import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { inviteMarketplaceVendor } from '@/lib/modules/commerce/vendor-portal'

const bodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  shopName: z.string().min(1).max(200),
  commissionRate: z.number().min(0).max(100).optional(),
  password: z.string().min(8).max(128).optional(),
  phone: z.string().max(20).optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.vendors.write')
  const body = bodySchema.parse(await request.json())
  const result = await inviteMarketplaceVendor(ctx.tenantId, body)
  return jsonOk(
    {
      ...result,
      message: result.createdUser
        ? 'Vendor account created — they can log in at /login'
        : 'Existing user linked as vendor — they can log in at /login',
    },
    201,
  )
}, 'v2/commerce/vendors/invite')
