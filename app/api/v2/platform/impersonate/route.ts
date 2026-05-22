import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, forbidden } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { requireAuth } from '@/lib/auth'
import { startImpersonation, endImpersonation } from '@/lib/modules/platform/impersonation'

const postSchema = z.object({
  userId: z.string().min(1),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const admin = await requireSuperAdmin()
  const body = postSchema.parse(await request.json())
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
  const ua = request.headers.get('user-agent') || undefined
  const result = await startImpersonation(admin.userId, body.userId, {
    ipAddress: ip,
    userAgent: ua,
  })
  return jsonOk(result)
}, 'v2/platform/impersonate')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const auth = await requireAuth()
  if (!auth.impersonatedBy) {
    throw forbidden('Not in an impersonation session')
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
  const ua = request.headers.get('user-agent') || undefined
  const result = await endImpersonation(auth.impersonatedBy, {
    ipAddress: ip,
    userAgent: ua,
  })
  return jsonOk(result)
}, 'v2/platform/impersonate')
