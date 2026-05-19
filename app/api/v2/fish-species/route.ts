import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
    const rows = await query<{ id: string; name: string; market_price_per_kg: number }>(
      `SELECT id, name, market_price_per_kg FROM fish_species WHERE status = 'active' ORDER BY name ASC`,
    )
    return NextResponse.json({ success: true, data: { species: rows } })
  } catch (error) {
    return handleApiError(error, 'v2/fish-species')
  }
}
