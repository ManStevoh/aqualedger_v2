import { describe, it, expect } from 'vitest'
import { hasFullSystemAccess, canManageUsers } from './platform-access'

describe('platform access', () => {
  it('grants full access to super_admin and investor', () => {
    expect(hasFullSystemAccess('super_admin')).toBe(true)
    expect(hasFullSystemAccess('investor')).toBe(true)
    expect(hasFullSystemAccess('user')).toBe(false)
  })

  it('allows user management for admin roles', () => {
    expect(canManageUsers('super_admin')).toBe(true)
    expect(canManageUsers('investor')).toBe(true)
    expect(canManageUsers('user')).toBe(false)
  })
})
