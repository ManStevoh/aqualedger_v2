import { describe, it, expect } from 'vitest'
import { hasFullSystemAccess, canManageUsers } from './platform-access'

describe('platform access', () => {
  it('grants full access to super_admin and investor', () => {
    expect(hasFullSystemAccess('super_admin')).toBe(true)
    expect(hasFullSystemAccess('investor')).toBe(true)
    expect(hasFullSystemAccess('fisherman')).toBe(false)
  })

  it('allows user management for admin roles', () => {
    expect(canManageUsers('super_admin')).toBe(true)
    expect(canManageUsers('bmu_official')).toBe(true)
    expect(canManageUsers('fisherman')).toBe(false)
  })
})
