import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { queryOne } from '@/lib/db'
import { withApiPermissionAny } from '@/lib/platform/api-auth'

export async function GET() {
  try {
    const auth = await withApiPermissionAny(['crm.customers.read', 'accounting.wallet.read'])
    const row = await queryOne(
      `SELECT cs.*, u.first_name, u.last_name
       FROM credit_scores cs
       JOIN users u ON cs.user_id = u.id
       WHERE cs.user_id = ?`,
      [auth.userId]
    )

    if (!row) {
      return NextResponse.json({
        success: true,
        data: {
          score: 300,
          grade: 'E',
          userId: auth.userId,
          breakdown: {},
        },
      })
    }

    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    return handleApiError(error, 'v2/credit-score')
  }
}
