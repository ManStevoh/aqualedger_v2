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
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/billing', label: 'Billing', icon: Receipt },
  { href: '/admin/modules', label: 'Modules', icon: LayoutGrid },
  { href: '/admin/audit', label: 'Audit', icon: Shield },
  { href: '/admin/health', label: 'Health', icon: HeartPulse },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/security', label: 'Security', icon: ShieldCheck },
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
