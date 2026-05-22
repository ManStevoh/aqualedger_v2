import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'

export async function GET() {
  try {
    const auth = await withApiPermission('commerce.catalog.read')
    const rows = await query<{ id: string; name: string; market_price_per_kg: number }>(
      `SELECT id, name, market_price_per_kg FROM fish_species
       WHERE status = 'active' AND (tenant_id IS NULL OR tenant_id = ?)
       ORDER BY name ASC`,
      [auth.tenantId],
    )
    return NextResponse.json({ success: true, data: { species: rows } })
  } catch (error) {
    return handleApiError(error, 'v2/fish-species')
  }
}
