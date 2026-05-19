import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const conditions: string[] = []
    const params: unknown[] = []
    if (status && status !== 'all') {
      conditions.push('ip.status = ?')
      params.push(status)
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query<
      Record<string, unknown> & { funded_amount: number }
    >(
      `SELECT ip.*,
        COALESCE((
          SELECT SUM(amount) FROM investments inv
          WHERE inv.package_id = ip.id AND inv.status = 'active'
        ), 0) AS funded_amount
       FROM investment_packages ip
       ${where}
       ORDER BY ip.created_at DESC`,
      params
    )

    return NextResponse.json({ success: true, data: { packages: rows } })
  } catch (error) {
    return handleApiError(error, 'v2/investment-packages')
  }
}
