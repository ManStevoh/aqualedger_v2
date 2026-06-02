import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, ApiError } from '@/lib/api-handler'
import { getAuthContext } from '@/lib/platform/access'
import { queryOne, execute, generateId, transaction, query } from '@/lib/db'
import { recordContractFulfillment } from '@/lib/modules/commerce/sales-contracts'

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await getAuthContext()
  const { id: invoiceId } = await (context?.params ?? Promise.resolve({ id: '' }))

  // 1. Fetch Invoice
  const invoice = await queryOne<{
    id: string
    tenant_id: string
    customer_id: string | null
    order_id: string | null
    invoice_number: string
    total_amount: number
    status: string
  }>(
    `SELECT * FROM ar_invoices WHERE id = ? AND tenant_id = ?`,
    [invoiceId, ctx.tenantId]
  )

  if (!invoice) {
    throw new ApiError('Invoice not found', 404, 'NOT_FOUND')
  }

  let customerId = invoice.customer_id

  // 2. Enforce Customer Isolation Check
  if (ctx.memberRole === 'customer') {
    const cust = await queryOne<{ id: string }>(
      `SELECT id FROM crm_customers WHERE tenant_id = ? AND user_id = ?`,
      [ctx.tenantId, ctx.userId]
    )
    if (!cust || cust.id !== invoice.customer_id) {
      throw new ApiError('Forbidden', 403, 'FORBIDDEN')
    }
    customerId = cust.id
  }

  // 3. Check Invoice Status
  if (invoice.status === 'paid') {
    throw new ApiError('Invoice is already paid', 400, 'BAD_REQUEST')
  }
  if (invoice.status === 'void') {
    throw new ApiError('Invoice is void', 400, 'BAD_REQUEST')
  }

  const invoiceAmount = Number(invoice.total_amount)

  // 4. Process Payment inside a database transaction
  const txnResult = await transaction(async (conn) => {
    // Lock the buyer's wallet
    const [walletRows] = await conn.execute(
      `SELECT id, balance, status FROM wallets WHERE user_id = ? AND tenant_id = ? FOR UPDATE`,
      [ctx.userId, ctx.tenantId]
    )
    const wallet = (walletRows as { id: string; balance: number; status: string }[])[0]

    if (!wallet) {
      throw new Error('Buyer wallet not found')
    }
    if (wallet.status !== 'active') {
      throw new Error('Buyer wallet is inactive')
    }
    if (Number(wallet.balance) < invoiceAmount) {
      throw new Error('Insufficient wallet balance')
    }

    const balanceBefore = Number(wallet.balance)
    const balanceAfter = balanceBefore - invoiceAmount
    const transactionId = generateId()
    const txnReference = `PAY-${invoice.invoice_number.replace('INV-', '')}`

    // Deduct wallet balance
    await conn.execute(
      `UPDATE wallets SET balance = ?, last_transaction_at = NOW() WHERE id = ?`,
      [balanceAfter, wallet.id]
    )

    // Record wallet transaction
    await conn.execute(
      `INSERT INTO transactions (
        id, wallet_id, type, amount, fee, balance_before, balance_after,
        status, reference, description
      ) VALUES (?, ?, 'payment', ?, 0, ?, ?, 'completed', ?, ?)`,
      [
        transactionId,
        wallet.id,
        invoiceAmount,
        balanceBefore,
        balanceAfter,
        txnReference,
        `Paid invoice ${invoice.invoice_number}`
      ]
    )

    // Update AR Invoice status to paid
    await conn.execute(
      `UPDATE ar_invoices SET status = 'paid', updated_at = NOW() WHERE id = ?`,
      [invoice.id]
    )

    // Update Order payment status if order_id is present
    if (invoice.order_id) {
      await conn.execute(
        `UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = ?`,
        [invoice.order_id]
      )
    }

    // Log CRM Activity
    if (customerId) {
      await conn.execute(
        `INSERT INTO crm_activities (
          id, tenant_id, customer_id, activity_type, subject, body, completed_at, created_by
        ) VALUES (?, ?, ?, 'email', ?, ?, NOW(), ?)`,
        [
          generateId(),
          ctx.tenantId,
          customerId,
          `Invoice Paid: ${invoice.invoice_number}`,
          `Paid invoice ${invoice.invoice_number} of total amount KES ${invoiceAmount.toLocaleString()} via Wallet.`,
          ctx.userId
        ]
      )
    }

    return { transactionId, reference: txnReference, balanceAfter }
  })

  // 5. Automatic Forward Sales Contract Fulfillment (ERP Integration)
  if (invoice.order_id && customerId) {
    try {
      // Find species and quantities from order items
      const orderItems = await query<{ species_id: string; quantity_kg: number }>(
        `SELECT species_id, quantity_kg FROM order_items WHERE order_id = ?`,
        [invoice.order_id]
      )

      for (const item of orderItems) {
        if (!item.species_id || !item.quantity_kg) continue

        // Look for any active forward contract for this customer and species
        const contract = await queryOne<{ id: string }>(
          `SELECT id FROM sales_contracts 
           WHERE tenant_id = ? AND customer_id = ? AND species_id = ? AND status = 'active'
           LIMIT 1`,
          [ctx.tenantId, customerId, item.species_id]
        )

        if (contract) {
          await recordContractFulfillment(ctx.tenantId, contract.id, {
            quantityKg: Number(item.quantity_kg),
            orderId: invoice.order_id,
            notes: `Auto-fulfilled via paid order ${invoice.order_id}`
          })
        }
      }
    } catch (err) {
      console.error('Failed to auto-fulfill forward contracts:', err)
      // Non-blocking for the payment response
    }
  }

  return jsonOk({
    message: 'Invoice paid successfully via wallet',
    data: txnResult
  })
}, 'v2/accounting/ar/[id]/pay')
