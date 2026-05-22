import { apiHandler, jsonOk } from '@/lib/api-handler'
import { getRecaptchaConfig, toPublicConfig } from '@/lib/modules/security/recaptcha'

/** Public site key + feature flags for login/register pages (no secrets). */
export const GET = apiHandler(async () => {
  const config = await getRecaptchaConfig(true)
  const publicConfig = toPublicConfig(config)
  return jsonOk({ recaptcha: publicConfig })
}, 'public/recaptcha/config')
