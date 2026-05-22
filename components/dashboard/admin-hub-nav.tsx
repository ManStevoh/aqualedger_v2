'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  LayoutGrid,
  Shield,
  HeartPulse,
  Settings,
  ShieldCheck,
  Users,
  BarChart3,
  CreditCard,
  Receipt,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/admin/billing', label: 'Billing', icon: Receipt },
  { href: '/dashboard/admin/modules', label: 'Modules', icon: LayoutGrid },
  { href: '/dashboard/admin/audit', label: 'Audit', icon: Shield },
  { href: '/dashboard/admin/health', label: 'Health', icon: HeartPulse },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/admin/security', label: 'Security', icon: ShieldCheck },
] as const

export function AdminHubNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1">
      {NAV_ITEMS.map((item) => {
        const { href, label, icon: Icon } = item
        const exact = 'exact' in item && item.exact
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
