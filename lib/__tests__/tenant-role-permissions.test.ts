import { describe, it, expect } from 'vitest'
import {
  sanitizePortalPermissions,
  getDefaultPortalPermissions,
  isPortalRole,
} from '@/lib/platform/tenant-role-permissions'

describe('tenant-role-permissions', () => {
  it('recognizes portal roles', () => {
    expect(isPortalRole('vendor')).toBe(true)
    expect(isPortalRole('customer')).toBe(true)
    expect(isPortalRole('tenant_owner')).toBe(false)
  })

  it('returns defaults when empty list submitted', () => {
    const defaults = getDefaultPortalPermissions('vendor')
    const out = sanitizePortalPermissions('vendor', [])
    expect(out.length).toBeGreaterThan(0)
    expect(out).toEqual(defaults)
  })

  it('filters unknown permissions', () => {
    const out = sanitizePortalPermissions('customer', [
      'commerce.cart.read',
      'platform.tenants.manage',
      'not.real',
    ])
    expect(out).toContain('commerce.cart.read')
    expect(out).not.toContain('platform.tenants.manage')
  })
})
