import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listScheduledReports,
  createScheduledReport,
  updateScheduledReport,
} from '@/lib/modules/analytics/scheduled-reports'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createSchema = z.object({
  reportType: z.string().min(1).max(80),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  recipients: z.array(z.string().email()).min(1),
  phoneRecipients: z.array(z.string().min(8)).optional(),
  deliveryChannels: z.array(z.enum(['email', 'sms', 'whatsapp', 'webhook'])).optional(),
  exportFormat: z.enum(['csv', 'json', 'html']).optional(),
  periodDays: z.coerce.number().int().min(1).max(365).optional(),
  subjectOverride: z.string().max(255).optional(),
  bccRecipients: z.array(z.string().email()).optional(),
  active: z.boolean().optional(),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  reportType: z.string().min(1).max(80).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recipients: z.array(z.string().email()).min(1).optional(),
  active: z.boolean().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('analytics.scheduled.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { reports, total } = await listScheduledReports(ctx.tenantId, parsed.page, parsed.limit)

  return jsonOk({
    reports,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/analytics/scheduled')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('analytics.scheduled.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const report = await createScheduledReport(ctx.tenantId, {
    reportType: input.reportType,
    frequency: input.frequency,
    recipients: input.recipients,
    phoneRecipients: input.phoneRecipients,
    deliveryChannels: input.deliveryChannels,
    exportFormat: input.exportFormat,
    periodDays: input.periodDays,
    subjectOverride: input.subjectOverride,
    bccRecipients: input.bccRecipients,
    active: input.active,
  })
  return jsonOk({ report }, 201)
}, 'v2/analytics/scheduled')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('analytics.scheduled.write')
  const body = await request.json()
  const { id, ...updates } = patchSchema.parse(body)
  const report = await updateScheduledReport(ctx.tenantId, id, updates)
  return jsonOk({ report })
}, 'v2/analytics/scheduled')
