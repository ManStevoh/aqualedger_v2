import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import {
  getRecaptchaConfig,
  updateRecaptchaConfig,
  toAdminView,
  verifyRecaptchaToken,
  RECAPTCHA_TEST_SITE_KEY,
  RECAPTCHA_TEST_SECRET_KEY,
} from '@/lib/modules/security/recaptcha'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const config = await getRecaptchaConfig()
  return jsonOk({
    recaptcha: toAdminView(config),
    testKeys: {
      siteKey: RECAPTCHA_TEST_SITE_KEY,
      secretKey: RECAPTCHA_TEST_SECRET_KEY,
      note: 'Google official test keys — always pass verification (development only).',
    },
  })
}, 'v2/platform/recaptcha')

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  version: z.enum(['v3', 'v2_checkbox']).optional(),
  siteKey: z.string().max(200).optional(),
  secretKey: z.string().max(200).optional(),
  minScore: z.number().min(0).max(1).optional(),
  protectLogin: z.boolean().optional(),
  protectRegister: z.boolean().optional(),
  hostnameAllowlist: z.array(z.string().max(253)).optional(),
})

export const PATCH = apiHandler(async (request: NextRequest) => {
  const auth = await requireSuperAdmin()
  const body = patchSchema.parse(await request.json())
  const config = await updateRecaptchaConfig(body, auth.userId)
  return jsonOk({ recaptcha: toAdminView(config) })
}, 'v2/platform/recaptcha')

const testSchema = z.object({
  token: z.string().min(1, 'Provide a token from the login/register form or Google test flow'),
})

export const POST = apiHandler(async (request: NextRequest) => {
  await requireSuperAdmin()
  const body = testSchema.parse(await request.json())
  const result = await verifyRecaptchaToken({ token: body.token })
  if (!result.ok) {
    return jsonOk({
      verified: false,
      code: result.code,
      error: result.error,
    })
  }
  return jsonOk({
    verified: true,
    score: result.score,
    hostname: result.hostname,
  })
}, 'v2/platform/recaptcha')
