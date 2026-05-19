import { NextResponse } from 'next/server'
import { healthCheck } from '@/lib/db'
import { APP_VERSION } from '@/lib/constants'

export async function GET() {
  const started = Date.now()
  let dbHealthy = false
  let dbLatencyMs: number | null = null
  let dbError: string | undefined

  try {
    const dbStart = Date.now()
    dbHealthy = await healthCheck()
    dbLatencyMs = Date.now() - dbStart
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Database check failed'
  }

  const healthy = dbHealthy
  const health = {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    uptimeMs: Date.now() - started,
    services: {
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        type: 'MySQL',
        name: process.env.DB_NAME || 'aqualedger32',
        latencyMs: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
      api: {
        status: 'running',
        version: APP_VERSION,
      },
    },
  }

  return NextResponse.json(health, { status: healthy ? 200 : 503 })
}
