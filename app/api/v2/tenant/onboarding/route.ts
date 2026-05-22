import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { getAuthContext } from '@/lib/platform/access'
import { getOnboarding, updateOnboardingStep } from '@/lib/modules/tenant/onboarding'

const patchSchema = z.object({
  step: z.number().int().min(1).max(3).optional(),
  completeStep: z.number().int().min(1).max(3).optional(),
  finish: z.boolean().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await getAuthContext()
  const onboarding = await getOnboarding(ctx.tenantId)

  if (!onboarding) {
    return jsonOk({
      isComplete: true,
      onboarding: null,
    })
  }

  return jsonOk({
    isComplete: onboarding.isComplete,
    onboarding,
  })
}, 'v2/tenant/onboarding')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await getAuthContext()
  const body = await request.json()
  const input = patchSchema.parse(body)
  const onboarding = await updateOnboardingStep(ctx.tenantId, input)

  return jsonOk({
    isComplete: onboarding.isComplete,
    onboarding,
  })
}, 'v2/tenant/onboarding')
