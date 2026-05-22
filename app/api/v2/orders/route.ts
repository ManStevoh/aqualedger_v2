import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, transaction, buildPagination, buildOrderBy } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'
import type { Connection } from 'mysql2/promise'

interface Order {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  status: string
  subtotal: number
  delivery_fee: number
  tax: number
  total: number
  payment_status: string
  delivery_address: string
  created_at: Date
}

type OrderListRow = Order & {
  buyer_name?: string | null
  buyer_phone?: string | null
  seller_name?: string | null
  seller_phone?: string | null
}

interface OrderItemRow {
  order_id: string
  [key: string]: unknown
}

// GET /api/v2/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.orders.read')
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('payment_status')
    const role = searchParams.get('role') || 'buyer' // buyer or seller
    
    const pagination = buildPagination(page, limit)
    const orderBy = buildOrderBy(
      searchParams.get('sort_by') || 'created_at',
      (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      ['created_at', 'total', 'status']
    )
    
    const conditions: string[] = []
    const params: unknown[] = []
    pushTenantCondition(conditions, params, 'o', auth.tenantId)

    // Filter by user role in order
    if (!hasFullSystemAccess(auth.role)) {
      if (role === 'seller') {
        conditions.push('o.seller_id = ?')
      } else {
        conditions.push('o.buyer_id = ?')
      }
      params.push(auth.userId)
    }
    
    if (status) {
      conditions.push('o.status = ?')
      params.push(status)
    }
    
    if (paymentStatus) {
      conditions.push('o.payment_status = ?')
      params.push(paymentStatus)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Get total count
    const [countResult] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    )
    const total = countResult?.total || 0
    
    // Get orders with related data
    const orders = await query<OrderListRow>(
      `SELECT o.*,
              CONCAT(buyer.first_name, ' ', buyer.last_name) as buyer_name,
              buyer.phone as buyer_phone,
              CONCAT(seller.first_name, ' ', seller.last_name) as seller_name,
              seller.phone as seller_phone
       FROM orders o
       LEFT JOIN users buyer ON o.buyer_id = buyer.id
       LEFT JOIN users seller ON o.seller_id = seller.id
       ${whereClause}
       ${orderBy}
       ${pagination.clause}`,
      params
    )
    
    // Get order items for each order
    const orderIds = orders.map((o) => o.id)
    let orderItems: OrderItemRow[] = []
    
    if (orderIds.length > 0) {
      orderItems = await query<OrderItemRow>(
        `SELECT oi.*, fl.fish_type, fs.name as species_name
         FROM order_items oi
         LEFT JOIN fish_listings fl ON oi.listing_id = fl.id
         LEFT JOIN fish_species fs ON fl.species_id = fs.id
         WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      )
    }
    
    // Attach items to orders
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: orderItems.filter((item) => item.order_id === order.id),
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/orders')
  }
}

// POST /api/v2/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.orders.write')
    const body = await request.json()
    
    const { items, deliveryAddress, deliveryNotes } = body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      )
    }
    
    // Process order in transaction
    const result = await transaction(async (conn: Connection) => {
      let subtotal = 0
      const orderItems: { listingId: string; quantity: number; unitPrice: number; totalPrice: number; sellerId: string }[] = []
      let sellerId: string | null = null
      
      // Validate all items and calculate totals
      for (const item of items) {
        const [listingRows] = await conn.execute(
          `SELECT * FROM fish_listings WHERE id = ? AND status = 'available' AND tenant_id = ? FOR UPDATE`,
          [item.listingId, auth.tenantId]
        )
        const listing = (listingRows as { id: string; seller_id: string; available_quantity_kg: number; price_per_kg: number }[])[0]
        
        if (!listing) {
          throw new Error(`Listing ${item.listingId} not found or unavailable`)
        }
        
        if (listing.available_quantity_kg < item.quantity) {
          throw new Error(`Insufficient quantity for listing ${item.listingId}`)
        }
        
        // Ensure all items are from same seller
        if (sellerId === null) {
          sellerId = listing.seller_id
        } else if (sellerId !== listing.seller_id) {
          throw new Error('All items must be from the same seller')
        }
        
        const totalPrice = item.quantity * listing.price_per_kg
        subtotal += totalPrice
        
        orderItems.push({
          listingId: item.listingId,
          quantity: item.quantity,
          unitPrice: listing.price_per_kg,
          totalPrice,
          sellerId: listing.seller_id,
        })
        
        // Update listing available quantity
        const newQuantity = listing.available_quantity_kg - item.quantity
        await conn.execute(
          `UPDATE fish_listings SET 
            available_quantity_kg = ?,
            status = CASE WHEN ? <= 0 THEN 'sold' ELSE status END
          WHERE id = ?`,
          [newQuantity, newQuantity, item.listingId]
        )
      }
      
      // Calculate fees
      const deliveryFee = 0 // Could be calculated based on distance
      const tax = subtotal * 0.16 // 16% VAT
      const total = subtotal + deliveryFee + tax
      
      // Create order
      const orderId = generateId()
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      await conn.execute(
        `INSERT INTO orders (
          id, tenant_id, order_number, buyer_id, seller_id, status, subtotal,
          delivery_fee, tax, total, payment_status, delivery_address, delivery_notes
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          orderId, auth.tenantId, orderNumber, auth.userId, sellerId, subtotal,
          deliveryFee, tax, total, deliveryAddress || null, deliveryNotes || null
        ]
      )
      
      // Create order items
      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items (id, order_id, listing_id, quantity_kg, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), orderId, item.listingId, item.quantity, item.unitPrice, item.totalPrice]
        )
      }
      
      return {
        orderId,
        orderNumber,
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount: orderItems.length,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: result,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/orders')
  }
}

// PUT /api/v2/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.orders.write')
    const body = await request.json()
    const { id, action, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Get order
    const order = await queryOne<Order & { tenant_id: string }>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    )
    assertTenantMatch(order, auth.tenantId, 'Order')

    // Verify access
    const canUpdate = hasFullSystemAccess(auth.role) ||
                      order.buyer_id === auth.userId || 
                      order.seller_id === auth.userId
    
    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Handle actions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'shipped', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    }
    
    if (action && action !== order.status) {
      if (!validTransitions[order.status]?.includes(action)) {
        return NextResponse.json(
          { success: false, error: `Cannot transition from ${order.status} to ${action}` },
          { status: 400 }
        )
      }
      
      await execute(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [action, id]
      )
      
      // Handle cancellation - restore listing quantities
      if (action === 'cancelled') {
        const orderItems = await query<{ listing_id: string; quantity_kg: number }>(
          'SELECT listing_id, quantity_kg FROM order_items WHERE order_id = ?',
          [id]
        )
        
        for (const item of orderItems) {
          await execute(
            `UPDATE fish_listings SET 
              available_quantity_kg = available_quantity_kg + ?,
              status = 'available'
            WHERE id = ?`,
            [item.quantity_kg, item.listing_id]
          )
        }
      }
    }
    
    // Update payment status if provided
    if (updates.paymentStatus) {
      await execute(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        [updates.paymentStatus, id]
      )
    }
    
    const updatedOrder = await queryOne<Order>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder },
    })
  } catch (error) {
    return handleApiError(error, 'v2/orders')
  }
}
