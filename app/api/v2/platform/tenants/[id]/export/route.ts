import { NextResponse } from 'next/server'
import { apiHandler, notFound } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { exportTenantData } from '@/lib/modules/platform/tenant-export'

export const GET = apiHandler(async (_request, context) => {
  await requireSuperAdmin()
  const params = await context?.params
  const id = params?.id as string
  const data = await exportTenantData(id)
  if (!data) {
    throw notFound('Tenant not found')
  }
  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="tenant-${id.slice(0, 8)}-export.json"`,
    },
  })
}, 'v2/platform/tenants/[id]/export')
