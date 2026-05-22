import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  legacyRoleToMemberRole,
  type Permission,
} from '@/lib/platform/permissions'

describe('permissions', () => {
  it('maps legacy roles to tenant member roles', () => {
    expect(legacyRoleToMemberRole('super_admin')).toBe('tenant_owner')
    expect(legacyRoleToMemberRole('fisherman')).toBe('fisherman')
    expect(legacyRoleToMemberRole('fish_buyer')).toBe('customer')
  })

  it('grants platform permissions only to super_admin', () => {
    expect(hasPermission('tenant_owner', 'platform.tenants.manage', 'super_admin')).toBe(true)
    expect(hasPermission('tenant_owner', 'platform.tenants.manage', 'investor')).toBe(false)
  })

  it('allows fisherman to log catches', () => {
    expect(hasPermission('fisherman', 'fishing.catches.write')).toBe(true)
    expect(hasPermission('fisherman', 'accounting.ledger.write')).toBe(false)
  })

  it('allows accountant ledger access', () => {
    expect(hasPermission('accountant', 'accounting.ledger.read')).toBe(true)
    expect(hasPermission('accountant', 'fishing.boats.write')).toBe(false)
  })
})
