import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { broadcastToTenantOwners } from '@/lib/modules/platform/broadcast'

const postSchema = z.object({
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const admin = await requireSuperAdmin()
  const body = postSchema.parse(await request.json())
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
  const ua = request.headers.get('user-agent') || undefined
  const result = await broadcastToTenantOwners(
    { subject: body.subject, body: body.body, channel: 'email' },
    { userId: admin.userId, ipAddress: ip, userAgent: ua },
  )
  return jsonOk(result)
}, 'v2/platform/broadcast')
