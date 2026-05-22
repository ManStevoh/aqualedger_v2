import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { purgeTenant } from '@/lib/modules/platform/tenant-purge'

const postSchema = z.object({
  confirmSlug: z.string().min(1),
})

export const POST = apiHandler(async (request: NextRequest, context) => {
  const admin = await requireSuperAdmin()
  const params = await context?.params
  const id = params?.id as string
  const body = postSchema.parse(await request.json())
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
  const ua = request.headers.get('user-agent') || undefined
  const result = await purgeTenant(id, body.confirmSlug, {
    userId: admin.userId,
    ipAddress: ip,
    userAgent: ua,
  })
  return jsonOk(result)
}, 'v2/platform/tenants/[id]/purge')
