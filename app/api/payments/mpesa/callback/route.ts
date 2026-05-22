import { NextRequest, NextResponse } from 'next/server'
import { processMpesaStkCallback } from '@/lib/modules/integrations/mpesa-callback'
import { logger } from '@/lib/logger'

/** Public Safaricom Daraja STK callback — no auth */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await processMpesaStkCallback(body)
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    })
  } catch (err) {
    logger.error('M-Pesa callback error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    })
  }
}
