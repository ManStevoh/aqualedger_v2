import type { UserRole } from '@/lib/types'

/**
 * Platform operators with cross-tenant visibility (all boats, users, BMU data).
 * - super_admin: system administrator
 * - investor: AquaLedger platform operator (not a limited portfolio-only investor)
 * Fishermen, boat owners, buyers, and BMU officials only see their own scoped data.
 */
export function hasFullSystemAccess(role: UserRole): boolean {
  return role === 'super_admin' || role === 'investor'
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'super_admin' || role === 'investor' || role === 'bmu_official'
}
