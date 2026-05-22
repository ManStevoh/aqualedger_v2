import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getPaymentStats, listPaymentIntents } from '@/lib/modules/platform/payments-monitor'

export const GET = apiHandler(async (request) => {
  await requireSuperAdmin()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? undefined
  const provider = searchParams.get('provider') ?? undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined
  const includeStats = searchParams.get('stats') !== '0'

  const payments = await listPaymentIntents({ status, provider, limit, page })
  const stats = includeStats ? await getPaymentStats() : undefined

  return jsonOk({ payments, stats })
}, 'v2/platform/payments')
