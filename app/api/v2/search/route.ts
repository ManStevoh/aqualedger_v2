import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { pushTenantCondition } from '@/lib/tenant-scope'

const LIMIT = 8

export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('analytics.dashboard.read')
    const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: { results: [] } })
    }

    const like = `%${q}%`
    const results: {
      type: string
      id: string
      title: string
      subtitle?: string
      href: string
    }[] = []

    const orderConditions: string[] = []
    const orderParams: unknown[] = []
    pushTenantCondition(orderConditions, orderParams, 'o', auth.tenantId)
    orderConditions.push('(o.order_number LIKE ? OR o.id LIKE ?)')
    orderParams.push(like, like)

    const orders = await query<{ id: string; order_number: string; status: string }>(
      `SELECT o.id, o.order_number, o.status FROM orders o WHERE ${orderConditions.join(' AND ')} LIMIT ${LIMIT}`,
      orderParams,
    )
    for (const o of orders) {
      results.push({
        type: 'order',
        id: o.id,
        title: o.order_number || o.id,
        subtitle: o.status,
        href: `/dashboard/orders/${o.id}`,
      })
    }

    const custConditions: string[] = []
    const custParams: unknown[] = []
    pushTenantCondition(custConditions, custParams, 'c', auth.tenantId)
    custConditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)')
    custParams.push(like, like, like)

    const customers = await query<{ id: string; name: string; email: string | null }>(
      `SELECT c.id, c.name, c.email FROM crm_customers c WHERE ${custConditions.join(' AND ')} LIMIT ${LIMIT}`,
      custParams,
    ).catch(() => [])
    for (const c of customers) {
      results.push({
        type: 'customer',
        id: c.id,
        title: c.name,
        subtitle: c.email ?? undefined,
        href: `/dashboard/crm/customers`,
      })
    }

    const boatConditions: string[] = []
    const boatParams: unknown[] = []
    pushTenantCondition(boatConditions, boatParams, 'b', auth.tenantId)
    boatConditions.push('(b.name LIKE ? OR b.registration_number LIKE ?)')
    boatParams.push(like, like)

    const boats = await query<{ id: string; name: string; registration_number: string }>(
      `SELECT b.id, b.name, b.registration_number FROM boats b WHERE ${boatConditions.join(' AND ')} LIMIT ${LIMIT}`,
      boatParams,
    ).catch(() => [])
    for (const b of boats) {
      results.push({
        type: 'vessel',
        id: b.id,
        title: b.name,
        subtitle: b.registration_number,
        href: `/dashboard/fleet`,
      })
    }

    const lotConditions: string[] = []
    const lotParams: unknown[] = []
    pushTenantCondition(lotConditions, lotParams, 'ib', auth.tenantId)
    lotConditions.push('(ib.lot_code LIKE ? OR ib.batch_number LIKE ?)')
    lotParams.push(like, like)

    const lots = await query<{ id: string; lot_code: string }>(
      `SELECT ib.id, ib.lot_code FROM inventory_batches ib WHERE ${lotConditions.join(' AND ')} LIMIT ${LIMIT}`,
      lotParams,
    ).catch(() => [])
    for (const l of lots) {
      results.push({
        type: 'lot',
        id: l.id,
        title: l.lot_code,
        subtitle: 'Inventory lot',
        href: `/dashboard/inventory/traceability`,
      })
    }

    return NextResponse.json({ success: true, data: { results: results.slice(0, 20) } })
  } catch (error) {
    return handleApiError(error, 'v2/search')
  }
}
