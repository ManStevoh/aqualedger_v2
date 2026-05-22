import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listFixedAssets,
  createFixedAsset,
  runMonthlyDepreciation,
} from '@/lib/modules/accounting/fixed-assets'

const createSchema = z.object({
  assetCode: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['vessel', 'vehicle', 'equipment', 'building', 'other']),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  purchaseCost: z.number().positive(),
  salvageValue: z.number().optional(),
  usefulLifeMonths: z.number().int().positive().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('accounting.reports.read')
  const assets = await listFixedAssets(ctx.tenantId)
  return jsonOk({ assets })
}, 'v2/accounting/fixed-assets')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = createSchema.parse(await request.json())
  const asset = await createFixedAsset(ctx.tenantId, body)
  return jsonOk({ asset }, 201)
}, 'v2/accounting/fixed-assets')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  z.object({ action: z.literal('depreciate') }).parse(await request.json())
  const result = await runMonthlyDepreciation(ctx.tenantId)
  return jsonOk(result)
}, 'v2/accounting/fixed-assets')
