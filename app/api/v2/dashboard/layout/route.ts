import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  getUserDashboardLayout,
  saveUserDashboardLayout,
} from '@/lib/modules/dashboard/layout'

const widgetSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.number().int().min(0),
  visible: z.boolean(),
})

const saveSchema = z.object({
  widgets: z.array(widgetSchema).min(1),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('dashboard.layout.read')
  const layout = await getUserDashboardLayout(ctx.tenantId, ctx.userId)
  return jsonOk({ layout })
}, 'v2/dashboard/layout')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('dashboard.layout.write')
  const body = await request.json()
  const { widgets } = saveSchema.parse(body)
  const layout = await saveUserDashboardLayout(ctx.tenantId, ctx.userId, widgets)
  return jsonOk({ layout })
}, 'v2/dashboard/layout')
