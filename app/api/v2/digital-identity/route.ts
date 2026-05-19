import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiHandler } from '@/lib/api-handler'

/** KYC / digital identity derived from user profile */
export const GET = apiHandler(async () => {
  const auth = await requireAuth()

  const user = await queryOne<{
    id: string
    email: string
    first_name: string
    last_name: string
    phone: string | null
    county: string | null
    role: string
    kyc_verified: boolean
    email_verified: boolean
    status: string
    created_at: Date
  }>(
    `SELECT id, email, first_name, last_name, phone, county, role, kyc_verified, email_verified, status, created_at
     FROM users WHERE id = ?`,
    [auth.userId],
  )

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  const credit = await queryOne<{ score: number; grade: string }>(
    'SELECT score, grade FROM credit_scores WHERE user_id = ?',
    [auth.userId],
  )

  return NextResponse.json({
    success: true,
    data: {
      identity: {
        userId: user.id,
        fullName: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.phone,
        county: user.county,
        role: user.role,
        memberSince: user.created_at,
        verification: {
          email: user.email_verified,
          kyc: user.kyc_verified,
          status: user.status,
        },
        creditScore: credit?.score ?? null,
        creditGrade: credit?.grade ?? null,
        digitalId: `AQ-${user.id.slice(0, 8).toUpperCase()}`,
      },
    },
  })
}, 'v2/digital-identity')
