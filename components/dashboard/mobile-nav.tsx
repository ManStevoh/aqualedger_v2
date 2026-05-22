'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Bell, Sparkles, Ship } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { resolveModuleFromDashboardPath } from '@/lib/platform/module-paths'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/catches', label: 'Catch', icon: Ship },
  { href: '/dashboard/inventory', label: 'Stock', icon: Package },
  { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
  { href: '/dashboard/ai', label: 'AI', icon: Sparkles },
] as const

export function MobileNav() {
  const pathname = usePathname()
  const { enabledModuleIds, modulesLoaded } = useAppStore()

  const visibleTabs = TABS.filter((tab) => {
    if (tab.href === '/dashboard') return true
    if (!modulesLoaded) return false
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
