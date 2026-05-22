'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Users,
  Calendar,
  Clock,
  ClipboardList,
  Palette,
  ShoppingCart,
  Wallet,
  Ticket,
  Calculator,
  FileText,
  Scale,
  Target,
  PackageCheck,
  FileCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WorkspaceNavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Match only exact path */
  exact?: boolean
}

export const COMMERCE_WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: '/dashboard/commerce/storefront', label: 'Storefront', icon: Palette },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/commerce/sales', label: 'Sales', icon: TrendingUp },
  { href: '/dashboard/commerce/payouts', label: 'Payouts', icon: Wallet },
  { href: '/dashboard/commerce/coupons', label: 'Coupons', icon: Ticket },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingCart },
]

export const HR_WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: '/dashboard/hr', label: 'Overview', icon: Users, exact: true },
  { href: '/dashboard/hr/employees', label: 'Employees', icon: Users },
  { href: '/dashboard/hr/payroll', label: 'Payroll', icon: ClipboardList },
  { href: '/dashboard/hr/leave', label: 'Leave', icon: Calendar },
  { href: '/dashboard/hr/attendance', label: 'Attendance', icon: Clock },
]

export const PROCUREMENT_WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: '/dashboard/procurement/suppliers', label: 'Suppliers', icon: Users },
  { href: '/dashboard/procurement/orders', label: 'Orders', icon: ClipboardList },
  { href: '/dashboard/procurement/orders?tab=grn', label: 'GRN', icon: PackageCheck },
  { href: '/dashboard/procurement/match', label: '3-way match', icon: FileCheck },
  { href: '/dashboard/procurement/orders?suggest=1', label: 'Smart suggest', icon: Sparkles },
]

export const ACCOUNTING_WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: '/dashboard/accounting/ledger', label: 'Ledger', icon: Calculator },
  { href: '/dashboard/accounting/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/accounting/bank-reconciliation', label: 'Reconciliation', icon: Scale },
  { href: '/dashboard/accounting/budgets', label: 'Budgets', icon: Target },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
]

interface WorkspaceNavProps {
  items: WorkspaceNavItem[]
  className?: string
}

export function WorkspaceNav({ items, className }: WorkspaceNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'rounded-lg border bg-muted/40 p-1',
        className,
      )}
      aria-label="Workspace"
    >
      <div className="flex gap-1 overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon
          const base = item.href.split('?')[0]
          const active = item.exact
            ? pathname === item.href || pathname === base
            : pathname === item.href ||
              pathname === base ||
              pathname?.startsWith(`${base}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex shrink-0 touch-target items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors sm:py-2',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
