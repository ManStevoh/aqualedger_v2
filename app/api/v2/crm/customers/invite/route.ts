import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { inviteClientPortalUser } from '@/lib/modules/crm/customer-portal'

const bodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(128).optional(),
  phone: z.string().max(20).optional(),
  customerId: z.string().uuid().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.write')
  const body = bodySchema.parse(await request.json())
  const result = await inviteClientPortalUser(ctx.tenantId, body)
  return jsonOk(
    {
      ...result,
      message: result.createdUser
        ? 'Client account created — they can log in at /login'
        : 'Existing user linked as client — they can log in at /login',
    },
    201,
  )
}, 'v2/crm/customers/invite')
