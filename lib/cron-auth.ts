import type { NextRequest } from 'next/server'

/** Validates cron calls via x-cron-secret or Authorization: Bearer (Vercel Cron). */
export function isValidCronRequest(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET?.trim()
  if (!expected) return false

  const headerSecret = request.headers.get('x-cron-secret')?.trim()
  if (headerSecret && headerSecret === expected) return true

  const auth = request.headers.get('authorization')?.trim()
  if (auth === `Bearer ${expected}`) return true

  return false
}
