import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, transaction, buildPagination, buildOrderBy } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { logAudit } from '@/lib/audit'
import { getUserById } from '@/lib/auth'
import { initiateStkPush } from '@/lib/modules/integrations/mpesa'
import type { Connection } from 'mysql2/promise'

interface Wallet {
  id: string
  user_id: string
  balance: number
  currency: string
  status: string
  last_transaction_at: Date
}

interface Transaction {
  id: string
  wallet_id: string
  type: string
  amount: number
  fee: number
  balance_before: number
  balance_after: number
  status: string
  reference: string
  description: string
  created_at: Date
}

// GET /api/v2/wallet - Get wallet info and transactions
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('accounting.wallet.read')
    const { searchParams } = new URL(request.url)
    
    const action = searchParams.get('action') || 'balance'
    
    if (action === 'balance') {
      // Get wallet balance
      const wallet = await queryOne<Wallet>(
        'SELECT * FROM wallets WHERE user_id = ? AND tenant_id = ?',
        [auth.userId, auth.tenantId]
      )
      
      if (!wallet) {
        // Create wallet if doesn't exist
        const walletId = generateId()
        await query(
          `INSERT INTO wallets (id, tenant_id, user_id, balance, currency, status)
           VALUES (?, ?, ?, 0, 'KES', 'active')`,
          [walletId, auth.tenantId, auth.userId]
        )
        
        return NextResponse.json({
          success: true,
          data: {
            wallet: {
              id: walletId,
              balance: 0,
              currency: 'KES',
              status: 'active',
            },
          },
        })
      }
      
      return NextResponse.json({
        success: true,
        data: { wallet },
      })
    }
    
    if (action === 'transactions') {
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const type = searchParams.get('type')
      const status = searchParams.get('status')
      const startDate = searchParams.get('start_date')
      const endDate = searchParams.get('end_date')
      
      const pagination = buildPagination(page, limit)
      const orderBy = buildOrderBy('created_at', 'desc', ['created_at', 'amount', 'type'])
      
      // Get wallet ID
      const wallet = await queryOne<{ id: string }>(
        'SELECT id FROM wallets WHERE user_id = ? AND tenant_id = ?',
        [auth.userId, auth.tenantId]
      )
      
      if (!wallet) {
        return NextResponse.json({
          success: true,
          data: {
            transactions: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          },
        })
      }
      
      const conditions: string[] = ['wallet_id = ?']
      const params: unknown[] = [wallet.id]
      
      if (type) {
        conditions.push('type = ?')
        params.push(type)
      }
      
      if (status) {
        conditions.push('status = ?')
        params.push(status)
      }
      
      if (startDate) {
        conditions.push('created_at >= ?')
        params.push(startDate)
      }
      
      if (endDate) {
        conditions.push('created_at <= ?')
        params.push(endDate)
      }
      
      const whereClause = `WHERE ${conditions.join(' AND ')}`
      
      // Get total count
      const [countResult] = await query<{ total: number }>(
        `SELECT COUNT(*) as total FROM transactions ${whereClause}`,
        params
      )
      const total = countResult?.total || 0
      
      // Get transactions
      const transactions = await query<Transaction>(
        `SELECT * FROM transactions ${whereClause} ${orderBy} ${pagination.clause}`,
        params
      )
      
      return NextResponse.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      })
    }
    
    if (action === 'summary') {
      // Get wallet summary
      const wallet = await queryOne<{ id: string; balance: number }>(
        'SELECT id, balance FROM wallets WHERE user_id = ? AND tenant_id = ?',
        [auth.userId, auth.tenantId]
      )
      
      if (!wallet) {
        return NextResponse.json({
          success: true,
          data: {
            balance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalEarnings: 0,
            totalSpent: 0,
          },
        })
      }
      
      const [summary] = await query<{
        total_deposits: number
        total_withdrawals: number
        total_earnings: number
        total_spent: number
      }>(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_deposits,
          COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawals,
          COALESCE(SUM(CASE WHEN type IN ('return', 'transfer_in') AND status = 'completed' THEN amount ELSE 0 END), 0) as total_earnings,
          COALESCE(SUM(CASE WHEN type IN ('payment', 'investment') AND status = 'completed' THEN amount ELSE 0 END), 0) as total_spent
         FROM transactions
         WHERE wallet_id = ?`,
        [wallet.id]
      )
      
      return NextResponse.json({
        success: true,
        data: {
          balance: wallet.balance,
          ...summary,
        },
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    return handleApiError(error, 'v2/wallet')
  }
}

// POST /api/v2/wallet - Perform wallet operations
export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('accounting.wallet.write')
    const body = await request.json()
    const { action, amount, description, paymentMethod, reference, phoneNumber } = body
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }
    
    if (['deposit', 'withdraw'].includes(action) && (!amount || amount <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    if (action === 'deposit' && paymentMethod === 'mpesa') {
      const user = await getUserById(auth.userId)
      const phone = (phoneNumber as string | undefined)?.trim() || user?.phone
      if (!phone) {
        return NextResponse.json(
          { success: false, error: 'Phone number required for M-Pesa. Add one in your profile or enter it here.' },
          { status: 400 },
        )
      }
      const stk = await initiateStkPush({
        tenantId: auth.tenantId,
        amount,
        phoneNumber: phone,
        description: description || 'Wallet deposit',
        metadata: {
          purpose: 'wallet_deposit',
          user_id: auth.userId,
        },
      })
      return NextResponse.json({
        success: true,
        message: stk.simulated
          ? 'M-Pesa deposit completed (sandbox simulation)'
          : 'STK push sent — approve on your phone to complete deposit',
        data: { stk, pending: !stk.simulated },
      })
    }
    
    // Process transaction
    const result = await transaction(async (conn: Connection) => {
      // Get wallet with lock
      const [walletRows] = await conn.execute(
        'SELECT * FROM wallets WHERE user_id = ? AND tenant_id = ? FOR UPDATE',
        [auth.userId, auth.tenantId]
      )
      const wallet = (walletRows as Wallet[])[0]
      
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active')
      }
      
      let transactionType: string
      let balanceAfter: number
      let fee = 0
      
      if (action === 'deposit') {
        transactionType = 'deposit'
        balanceAfter = wallet.balance + amount
      } else if (action === 'withdraw') {
        if (wallet.balance < amount) {
          throw new Error('Insufficient balance')
        }
        transactionType = 'withdrawal'
        // Apply withdrawal fee (e.g., 1%)
        fee = amount * 0.01
        balanceAfter = wallet.balance - amount - fee
      } else {
        throw new Error('Invalid action')
      }
      
      // Create transaction record
      const txnId = generateId()
      const txnReference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      await conn.execute(
        `INSERT INTO transactions (
          id, wallet_id, type, amount, fee, balance_before, balance_after,
          status, reference, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        [
          txnId, wallet.id, transactionType, amount, fee,
          wallet.balance, balanceAfter, txnReference,
          description || `${action.charAt(0).toUpperCase() + action.slice(1)}`
        ]
      )
      
      // Update wallet balance
      await conn.execute(
        `UPDATE wallets SET balance = ?, last_transaction_at = NOW() WHERE id = ?`,
        [balanceAfter, wallet.id]
      )
      
      return {
        transactionId: txnId,
        reference: txnReference,
        type: transactionType,
        amount,
        fee,
        balanceBefore: wallet.balance,
        balanceAfter,
      }
    })
    
    await logAudit({
      userId: auth.userId,
      action: action === 'deposit' ? 'wallet.deposit' : 'wallet.withdraw',
      resourceType: 'transaction',
      resourceId: result.transactionId,
      metadata: { amount, reference: result.reference },
    })

    return NextResponse.json({
      success: true,
      message: `${action.charAt(0).toUpperCase() + action.slice(1)} successful`,
      data: result,
    })
  } catch (error) {
    return handleApiError(error, 'v2/wallet')
  }
}
