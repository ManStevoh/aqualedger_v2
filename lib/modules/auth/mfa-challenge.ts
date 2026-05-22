import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

export interface MfaChallengePayload {
  userId: string
  rememberMe: boolean
  purpose: 'mfa_pending'
}

export function signMfaChallengeToken(userId: string, rememberMe: boolean): string {
  const payload: MfaChallengePayload = { userId, rememberMe, purpose: 'mfa_pending' }
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '5m' })
}

export function verifyMfaChallengeToken(token: string): MfaChallengePayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as MfaChallengePayload
    if (decoded.purpose !== 'mfa_pending' || !decoded.userId) return null
    return decoded
  } catch {
    return null
  }
}
