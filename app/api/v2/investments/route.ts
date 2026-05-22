import { NextResponse } from 'next/server'

/** Removed — use Finance module (wallet, ledger, AP/AR). */
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Investments API removed. Use Accounting & Finance.', code: 'GONE' },
    { status: 410 },
  )
}

export async function POST() {
  return GET()
}
