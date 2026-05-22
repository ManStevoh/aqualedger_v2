import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { listPlatformUsers } from '@/lib/modules/platform/users-admin'

export const GET = apiHandler(async (request: NextRequest) => {
  await requireSuperAdmin()
  const { searchParams } = new URL(request.url)
  const result = await listPlatformUsers({
    search: searchParams.get('search') || undefined,
    limit: Number(searchParams.get('limit') || 50),
    page: Number(searchParams.get('page') || 1),
  })
  return jsonOk(result)
}, 'v2/platform/users')
