import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  getCommunicationSettings,
  upsertCommunicationSettings,
} from '@/lib/modules/communications/settings'
import { getEmailProviderStatus } from '@/lib/channels/email'

const upsertSchema = z.object({
  brandName: z.string().max(150).optional(),
  replyToEmail: z.string().email().optional().or(z.literal('')),
  defaultReportEmails: z.array(z.string().email()).optional(),
  defaultReportPhones: z.array(z.string().min(8)).optional(),
  defaultBccEmails: z.array(z.string().email()).optional(),
  emailFooterHtml: z.string().max(5000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('communications.read')
  const settings = await getCommunicationSettings(ctx.tenantId)
  const emailStatus = getEmailProviderStatus()
  return jsonOk({ settings, emailStatus })
}, 'v2/communications/settings')

export const PUT = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('communications.write')
  const body = upsertSchema.parse(await request.json())
  const settings = await upsertCommunicationSettings(ctx.tenantId, {
    brandName: body.brandName,
    replyToEmail: body.replyToEmail || undefined,
    defaultReportEmails: body.defaultReportEmails,
    defaultReportPhones: body.defaultReportPhones,
    defaultBccEmails: body.defaultBccEmails,
    emailFooterHtml: body.emailFooterHtml,
    logoUrl: body.logoUrl || undefined,
  })
  return jsonOk({ settings })
}, 'v2/communications/settings')
