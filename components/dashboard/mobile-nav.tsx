'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Bell,
  Ship,
  ShoppingCart,
  Building2,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { resolveModuleFromDashboardPath } from '@/lib/platform/module-paths'
import type { UserRole } from '@/lib/types'

type MobileTab = { href: string; label: string; icon: LucideIcon }

const DEFAULT_TABS: MobileTab[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/catches', label: 'Catch', icon: Ship },
  { href: '/dashboard/inventory', label: 'Stock', icon: Package },
  { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
  { href: '/dashboard/analytics', label: 'Insights', icon: BarChart3 },
]

const ROLE_TABS: Partial<Record<UserRole, MobileTab[]>> = {
  fisherman: [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/catches', label: 'Catch', icon: Ship },
    { href: '/dashboard/trips', label: 'Trips', icon: Ship },
    { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
    { href: '/dashboard/mobile/fisherman', label: 'Field', icon: Ship },
  ],
  fish_buyer: [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/marketplace', label: 'Market', icon: ShoppingCart },
    { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
    { href: '/dashboard/analytics', label: 'Insights', icon: BarChart3 },
  ],
  boat_owner: [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/fleet', label: 'Fleet', icon: Ship },
    { href: '/dashboard/catches', label: 'Catch', icon: Ship },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
  ],
  bmu_official: [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/bmu', label: 'BMU', icon: Building2 },
    { href: '/dashboard/licenses', label: 'Licenses', icon: Building2 },
    { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
    { href: '/dashboard/analytics', label: 'Insights', icon: BarChart3 },
  ],
  super_admin: DEFAULT_TABS,
  investor: DEFAULT_TABS,
}

export function MobileNav() {
  const pathname = usePathname()
  const { enabledModuleIds, modulesLoaded, currentRole } = useAppStore()

  const tabs = ROLE_TABS[currentRole] ?? DEFAULT_TABS

  const visibleTabs = tabs.filter((tab) => {
    if (tab.href === '/dashboard') return true
    if (!modulesLoaded) return tab.href === '/dashboard'
    const mod = resolveModuleFromDashboardPath(tab.href)
    return !mod || enabledModuleIds.includes(mod)
  })

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-40 lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around rounded-2xl border border-border/80 bg-card/90 px-1 shadow-lg shadow-black/10 backdrop-blur-xl safe-area-pb">
        {visibleTabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-semibold transition-all',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <span className="absolute inset-x-2 top-1 h-8 rounded-lg bg-primary/10" aria-hidden />
              )}
              <Icon className={cn('relative z-10 h-5 w-5', active && 'text-primary')} />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
