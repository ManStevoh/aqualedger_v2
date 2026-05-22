import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, unauthorized } from '@/lib/api-handler'
import { isValidCronRequest } from '@/lib/cron-auth'
import { processPendingExports } from '@/lib/modules/platform/scheduled-export'

export const runtime = 'nodejs'

const bodySchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
})

async function runExportCron(request: NextRequest) {
  if (!isValidCronRequest(request)) {
    throw unauthorized('Invalid cron secret')
  }

  let limit = 10
  if (request.method === 'POST') {
    const body = bodySchema.parse(await request.json().catch(() => ({})))
    limit = body.limit ?? 10
  } else {
    const q = request.nextUrl.searchParams.get('limit')
    if (q) limit = Math.min(20, Math.max(1, Number(q)))
  }

  const processed = await processPendingExports(limit)
  return jsonOk({ processed })
}

/** Cron: GET (Vercel) or POST with x-cron-secret / Authorization: Bearer CRON_SECRET */
export const GET = apiHandler(runExportCron, 'v2/platform/exports/process')
export const POST = apiHandler(runExportCron, 'v2/platform/exports/process')
