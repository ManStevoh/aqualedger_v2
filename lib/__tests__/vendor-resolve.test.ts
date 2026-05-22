import { describe, it, expect } from 'vitest'
import {
  groupCartLinesByVendor,
  pickPrimarySeller,
  allocateVendorCommissions,
  parseVendorIdFromMetadata,
} from '@/lib/modules/commerce/vendor-resolve'

describe('vendor-resolve', () => {
  const vendorA = { vendorId: 'v1', userId: 'u1', commissionRate: 10 }
  const vendorB = { vendorId: 'v2', userId: 'u2', commissionRate: 15 }

  it('parses vendor_id from metadata JSON', () => {
    expect(parseVendorIdFromMetadata({ vendor_id: 'abc' })).toBe('abc')
    expect(parseVendorIdFromMetadata(JSON.stringify({ vendor_id: 'xyz' }))).toBe('xyz')
  })

  it('groups lines by vendor and picks primary by line total', () => {
    const shares = groupCartLinesByVendor([
      { productId: 'p1', lineTotal: 100, vendor: vendorA },
      { productId: 'p2', lineTotal: 50, vendor: vendorB },
      { productId: 'p3', lineTotal: 200, vendor: vendorA },
    ])
    expect(shares).toHaveLength(2)
    expect(pickPrimarySeller(shares).vendorId).toBe('v1')
  })

  it('allocates commissions proportionally', () => {
    const shares = groupCartLinesByVendor([
      { productId: 'p1', lineTotal: 300, vendor: vendorA },
      { productId: 'p2', lineTotal: 100, vendor: vendorB },
    ])
    const rows = allocateVendorCommissions(shares, 400, 464)
    expect(rows).toHaveLength(2)
    const totalCommission = rows.reduce((s, r) => s + r.commissionAmount, 0)
    expect(totalCommission).toBeGreaterThan(0)
    expect(rows.find((r) => r.vendor.vendorId === 'v1')?.orderAmount).toBeCloseTo(348, 0)
  })
})
