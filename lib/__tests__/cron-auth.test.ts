import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { isValidCronRequest } from '@/lib/cron-auth'

describe('isValidCronRequest', () => {
  const prev = process.env.CRON_SECRET

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret-32chars-minimum!!'
  })

  afterEach(() => {
    process.env.CRON_SECRET = prev
  })

  it('accepts x-cron-secret header', () => {
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-cron-secret': process.env.CRON_SECRET! },
    })
    expect(isValidCronRequest(req)).toBe(true)
  })

  it('accepts Authorization Bearer', () => {
    const req = new NextRequest('http://localhost/api', {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    expect(isValidCronRequest(req)).toBe(true)
  })

  it('rejects missing secret', () => {
    const req = new NextRequest('http://localhost/api')
    expect(isValidCronRequest(req)).toBe(false)
  })
})
