import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, generateId, transaction } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import type { Connection } from 'mysql2/promise'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const { searchParams } = new URL(request.url)
    const investorId = searchParams.get('investor_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    const conditions: string[] = []
    const params: unknown[] = []

    if (hasFullSystemAccess(auth.role) && investorId) {
      conditions.push('i.user_id = ?')
      params.push(investorId)
    } else if (!hasFullSystemAccess(auth.role)) {
      conditions.push('i.user_id = ?')
      params.push(auth.userId)
    }

    if (status) {
      conditions.push('i.status = ?')
      params.push(status)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM investments i ${where}`,
      params
    )
    const total = countRow?.total || 0

    const investments = await query(
      `SELECT i.*, ip.name as package_name,
        0 AS dividends_paid
       FROM investments i
       JOIN investment_packages ip ON i.package_id = ip.id
       ${where}
       ORDER BY i.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    )

    return NextResponse.json({
      success: true,
      data: {
        investments,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/investments')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['investor', 'super_admin'])
    const body = await request.json()
    const packageId = body.packageId as string
    const amount = Number(body.amount)
    const targetInvestorId = (body.investorId as string) || auth.userId

    if (!packageId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Package and positive amount required' }, { status: 400 })
    }

    if (!hasFullSystemAccess(auth.role) && targetInvestorId !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const pkg = await queryOne<{
      id: string
      min_investment: number
      max_investment: number | null
      expected_return_rate: number
      duration_months: number
      status: string
    }>('SELECT * FROM investment_packages WHERE id = ?', [packageId])

    if (!pkg || pkg.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Package not available' }, { status: 404 })
    }

    if (amount < Number(pkg.min_investment)) {
      return NextResponse.json(
        { success: false, error: `Minimum investment is KES ${Number(pkg.min_investment).toLocaleString()}` },
        { status: 400 }
      )
    }

    if (pkg.max_investment != null && amount > Number(pkg.max_investment)) {
      return NextResponse.json(
        { success: false, error: `Maximum per investment is KES ${Number(pkg.max_investment).toLocaleString()}` },
        { status: 400 }
      )
    }

    const start = new Date()
    const end = new Date(start)
    end.setMonth(end.getMonth() + pkg.duration_months)

    const expectedReturn = amount * (1 + Number(pkg.expected_return_rate) / 100)

    const result = await transaction(async (conn: Connection) => {
      const [walletRows] = await conn.execute(
        'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
        [targetInvestorId]
      )
      const wallet = (walletRows as { id: string; balance: number }[])[0]
      if (!wallet) throw new Error('Wallet not found')
      if (Number(wallet.balance) < amount) throw new Error('Insufficient wallet balance')

      const newBalance = Number(wallet.balance) - amount
      const ref = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

      await conn.execute(
        `INSERT INTO transactions (
          id, wallet_id, type, amount, fee, balance_before, balance_after, status, reference, description
        ) VALUES (?, ?, 'investment', ?, 0, ?, ?, 'completed', ?, ?)`,
        [generateId(), wallet.id, amount, wallet.balance, newBalance, ref, `Investment in package ${packageId}`]
      )

      await conn.execute('UPDATE wallets SET balance = ?, last_transaction_at = NOW() WHERE id = ?', [
        newBalance,
        wallet.id,
      ])

      const invId = generateId()
      await conn.execute(
        `INSERT INTO investments (
          id, user_id, package_id, amount, start_date, end_date, expected_return, actual_return, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
        [
          invId,
          targetInvestorId,
          packageId,
          amount,
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
          expectedReturn,
        ]
      )

      return { investmentId: invId, reference: ref }
    })

    return NextResponse.json({
      success: true,
      message: 'Investment recorded',
      data: result,
    })
  } catch (error) {
    return handleApiError(error, 'v2/investments')
  }
}
