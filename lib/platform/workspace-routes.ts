import type { WorkspaceNavItem } from '@/components/dashboard/workspace-nav'
import {
  ACCOUNTING_WORKSPACE_NAV,
  COMMERCE_WORKSPACE_NAV,
  HR_WORKSPACE_NAV,
  PROCUREMENT_WORKSPACE_NAV,
} from '@/components/dashboard/workspace-nav'
import { Warehouse, ClipboardList, Bell } from 'lucide-react'

export const COLDCHAIN_WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: '/dashboard/storage', label: 'Facilities', icon: Warehouse },
  { href: '/dashboard/coldchain/zones', label: 'Zones', icon: Warehouse },
  { href: '/dashboard/coldchain/haccp', label: 'HACCP', icon: ClipboardList },
  { href: '/dashboard/coldchain/alerts', label: 'Alerts', icon: Bell },
]

const PREFIX_WORKSPACE: { prefix: string; items: WorkspaceNavItem[] }[] = [
  { prefix: '/dashboard/commerce', items: COMMERCE_WORKSPACE_NAV },
  { prefix: '/dashboard/orders', items: COMMERCE_WORKSPACE_NAV },
  { prefix: '/dashboard/catalog', items: COMMERCE_WORKSPACE_NAV },
  { prefix: '/dashboard/marketplace', items: COMMERCE_WORKSPACE_NAV },
  { prefix: '/dashboard/vendor', items: COMMERCE_WORKSPACE_NAV },
  { prefix: '/dashboard/hr', items: HR_WORKSPACE_NAV },
  { prefix: '/dashboard/accounting', items: ACCOUNTING_WORKSPACE_NAV },
  { prefix: '/dashboard/wallet', items: ACCOUNTING_WORKSPACE_NAV },
  { prefix: '/dashboard/expenses', items: ACCOUNTING_WORKSPACE_NAV },
  { prefix: '/dashboard/procurement', items: PROCUREMENT_WORKSPACE_NAV },
  { prefix: '/dashboard/storage', items: COLDCHAIN_WORKSPACE_NAV },
  { prefix: '/dashboard/coldchain', items: COLDCHAIN_WORKSPACE_NAV },
]

export function workspaceNavForPath(pathname: string): WorkspaceNavItem[] | null {
  for (const { prefix, items } of PREFIX_WORKSPACE) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return items
    }
  }
  return null
}
