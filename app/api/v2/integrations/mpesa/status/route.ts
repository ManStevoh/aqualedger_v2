import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { mpesaConfigured } from '@/lib/modules/integrations/mpesa'
import { absolutePublicApiUrl } from '@/lib/config/urls'

export const GET = apiHandler(async () => {
  await requirePermission('integrations.read')
  const configured = mpesaConfigured()
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL || absolutePublicApiUrl('/payments/mpesa/callback')
  const stubAutoComplete = process.env.MPESA_STUB_AUTO_COMPLETE !== 'false'

  return jsonOk({
    mode: configured ? 'daraja' : 'stub',
    configured,
    env: process.env.MPESA_ENV || 'sandbox',
    callbackUrl,
    stubAutoComplete,
    testPhone: process.env.MPESA_TEST_PHONE || null,
    testAmount: Number(process.env.MPESA_TEST_AMOUNT || 1),
    docsUrl: '/docs/MPESA_SANDBOX.md',
  })
}, 'v2/integrations/mpesa/status')
