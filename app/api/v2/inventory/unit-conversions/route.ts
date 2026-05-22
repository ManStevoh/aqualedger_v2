import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { convertWeight, listUnitConversions } from '@/lib/modules/inventory/unit-conversion'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.stock.read')
  const { searchParams } = new URL(request.url)
  const quantity = searchParams.get('quantity')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (quantity && from && to) {
    const result = await convertWeight(ctx.tenantId, Number(quantity), from, to)
    return jsonOk(result)
  }

  const conversions = await listUnitConversions(ctx.tenantId)
  return jsonOk({ conversions })
}, 'v2/inventory/unit-conversions')
