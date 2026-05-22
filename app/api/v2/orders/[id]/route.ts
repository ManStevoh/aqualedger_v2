import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { assertTenantMatch } from '@/lib/tenant-scope'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await withApiPermission('commerce.orders.read')
    const { id } = await params

    const order = await queryOne<Record<string, unknown>>(
      `SELECT o.*,
              CONCAT(buyer.first_name, ' ', buyer.last_name) as buyer_name,
              buyer.phone as buyer_phone,
              buyer.email as buyer_email,
              CONCAT(seller.first_name, ' ', seller.last_name) as seller_name,
              seller.phone as seller_phone
       FROM orders o
       LEFT JOIN users buyer ON o.buyer_id = buyer.id
       LEFT JOIN users seller ON o.seller_id = seller.id
       WHERE o.id = ?`,
      [id],
    )

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    assertTenantMatch(order.tenant_id as string, auth.tenantId)

    if (!hasFullSystemAccess(auth.role)) {
      const buyerId = String(order.buyer_id)
      const sellerId = String(order.seller_id)
      if (auth.userId !== buyerId && auth.userId !== sellerId) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
    }

    const items = await query<Record<string, unknown>>(
      `SELECT oi.*, fl.fish_type, fs.name as species_name
       FROM order_items oi
       LEFT JOIN fish_listings fl ON oi.listing_id = fl.id
       LEFT JOIN fish_species fs ON fl.species_id = fs.id
       WHERE oi.order_id = ?`,
      [id],
    )

    const statusHistory = await query<Record<string, unknown>>(
      `SELECT id, status, notes, created_at, created_by
       FROM order_status_history
       WHERE order_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [id],
    ).catch(() => [] as Record<string, unknown>[])

    return NextResponse.json({
      success: true,
      data: {
        order: { ...order, items },
        statusHistory,
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/orders/[id]')
  }
}
