import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listBoatCrew, addBoatCrew, removeBoatCrew } from '@/lib/modules/fishing-ops/crew'

const addSchema = z.object({
  boatId: z.string().min(1),
  crewMemberId: z.string().min(1),
  role: z.enum(['captain', 'engineer', 'deckhand', 'nets_officer']).optional(),
  joinedDate: z.string().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.crew.read')
  const { searchParams } = new URL(request.url)
  const boatId = searchParams.get('boatId') || undefined
  const crew = await listBoatCrew(ctx.tenantId, boatId)
  return jsonOk({ crew })
}, 'v2/fishing-ops/crew')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.crew.write')
  const body = addSchema.parse(await request.json())
  const member = await addBoatCrew(ctx.tenantId, body)
  return jsonOk({ member }, 201)
}, 'v2/fishing-ops/crew')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.crew.write')
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) throw new Error('Crew assignment id is required')
  await removeBoatCrew(ctx.tenantId, id)
  return jsonOk({ removed: true })
}, 'v2/fishing-ops/crew')
