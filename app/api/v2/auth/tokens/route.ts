import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listApiTokens, createApiToken, revokeApiToken } from '@/lib/modules/auth/service'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('auth.tokens.read')
  const tokens = await listApiTokens(ctx.tenantId, ctx.userId)
  return jsonOk({ tokens })
}, 'v2/auth/tokens')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('auth.tokens.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const token = await createApiToken(
    ctx.tenantId,
    ctx.userId,
    input.name,
    input.scopes,
    input.expiresAt,
  )
  return jsonOk({ token }, 201)
}, 'v2/auth/tokens')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('auth.tokens.write')
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    throw new Error('Token id is required')
  }
  await revokeApiToken(ctx.tenantId, id, ctx.userId)
  return jsonOk({ revoked: true })
}, 'v2/auth/tokens')
