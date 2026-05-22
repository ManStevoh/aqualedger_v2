import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireAuth } from '@/lib/auth'
import {
  getMfaStatus,
  startMfaEnrollment,
  confirmMfaEnrollment,
  disableMfa,
} from '@/lib/modules/auth/mfa'

const confirmSchema = z.object({ token: z.string().min(6).max(8) })

export const GET = apiHandler(async () => {
  const auth = await requireAuth()
  const status = await getMfaStatus(auth.userId)
  return jsonOk({ mfa: status })
}, 'v2/auth/mfa')

export const POST = apiHandler(async (request: NextRequest) => {
  const auth = await requireAuth()
  const body = await request.json().catch(() => ({}))
  const action = (body as { action?: string }).action

  if (action === 'confirm') {
    const { token } = confirmSchema.parse(body)
    const status = await confirmMfaEnrollment(auth.userId, token)
    return jsonOk({ mfa: status, message: 'Two-factor authentication enabled.' })
  }

  const enrollment = await startMfaEnrollment(
    auth.userId,
    auth.email || auth.userId,
  )
  return jsonOk(
    {
      mfa: await getMfaStatus(auth.userId),
      enrollment: {
        secret: enrollment.secret,
        otpauthUri: enrollment.otpauthUri,
        backupCodes: enrollment.backupCodes,
      },
      message: 'Scan the URI in your authenticator app, then confirm with a 6-digit code.',
    },
    201,
  )
}, 'v2/auth/mfa')

export const DELETE = apiHandler(async () => {
  const auth = await requireAuth()
  const status = await disableMfa(auth.userId)
  return jsonOk({ mfa: status })
}, 'v2/auth/mfa')
