import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getFisheriesGovApiUrl } from '@/lib/config/external-apis'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { queryOne } from '@/lib/db'

const lookupSchema = z.object({
  vesselId: z.string().optional(),
  licenseNumber: z.string().optional(),
  landingSiteCode: z.string().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.read')
  const { searchParams } = new URL(request.url)
  const input = lookupSchema.parse({
    vesselId: searchParams.get('vesselId') ?? undefined,
    licenseNumber: searchParams.get('licenseNumber') ?? undefined,
    landingSiteCode: searchParams.get('landingSiteCode') ?? undefined,
  })

  const apiUrl = getFisheriesGovApiUrl()
  const apiKey = process.env.FISHERIES_GOV_API_KEY

  if (apiUrl && apiKey) {
    try {
      const url = new URL(apiUrl)
      if (input.licenseNumber) url.searchParams.set('license', input.licenseNumber)
      if (input.vesselId) url.searchParams.set('vessel', input.vesselId)
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      })
      if (res.ok) {
        const external = await res.json()
        return jsonOk({ source: 'government_api', data: external })
      }
    } catch {
      /* fall through to local */
    }
  }

  if (input.licenseNumber) {
    const license = await queryOne<Record<string, unknown>>(
      `SELECT * FROM fishing_licenses
       WHERE tenant_id = ? AND license_number = ? LIMIT 1`,
      [ctx.tenantId, input.licenseNumber],
    )
    if (license) return jsonOk({ source: 'local_registry', data: license })
  }

  if (input.vesselId) {
    const boat = await queryOne<Record<string, unknown>>(
      `SELECT id, name, registration_number, status FROM boats
       WHERE tenant_id = ? AND id = ?`,
      [ctx.tenantId, input.vesselId],
    )
    if (boat) return jsonOk({ source: 'local_fleet', data: boat })
  }

  return jsonOk({
    source: 'stub',
    message: 'Configure FISHERIES_GOV_API_URL and FISHERIES_GOV_API_KEY for live government registry lookup.',
    data: { compliant: true, checkedAt: new Date().toISOString() },
  })
}, 'v2/integrations/fisheries')
