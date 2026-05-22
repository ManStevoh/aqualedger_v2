import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, unauthorized } from '@/lib/api-handler'
import { processPendingExports } from '@/lib/modules/platform/scheduled-export'

const bodySchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
})

/** Cron: POST with header x-cron-secret matching CRON_SECRET in .env */
export const POST = apiHandler(async (request: NextRequest) => {
  const expected = process.env.CRON_SECRET
  const provided = request.headers.get('x-cron-secret')
  if (!expected || !provided || provided !== expected) {
    throw unauthorized('Invalid cron secret')
  }

  const body = bodySchema.parse(await request.json().catch(() => ({})))
  const processed = await processPendingExports(body.limit ?? 10)
  return jsonOk({ processed })
}, 'v2/platform/exports/process')
