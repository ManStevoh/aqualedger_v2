import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listStripeCustomerInvoices } from '@/lib/modules/integrations/stripe-billing'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')
  const invoices = await listStripeCustomerInvoices(ctx.tenantId)
  return jsonOk({ invoices })
}, 'v2/tenant/billing/invoices')
