import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const alerts = await query(
      `SELECT * FROM climate_alerts
       WHERE status = 'active'
       ORDER BY start_time DESC
       LIMIT ${limit}`
    )

    return NextResponse.json({ success: true, data: { alerts } })
  } catch (error) {
    return handleApiError(error, 'v2/climate')
  }
}
