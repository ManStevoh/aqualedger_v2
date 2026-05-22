'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Bell, Sparkles, Ship, PanelLeft } from 'lucide-react'
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
  const { enabledModuleIds, modulesLoaded, setSidebarOpen } = useAppStore()

  const visibleTabs = TABS.filter((tab) => {
    if (tab.href === '/dashboard') return true
    if (!modulesLoaded) return false
    const mod = resolveModuleFromDashboardPath(tab.href)
    return !mod || enabledModuleIds.includes(mod)
  })

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-40 lg:hidden safe-area-pb"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-[3.75rem] max-w-lg items-stretch justify-around gap-0.5 rounded-2xl border border-border/80 bg-card/95 px-1 shadow-lg shadow-black/10 backdrop-blur-xl">
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
                'relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-semibold transition-all',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <span className="absolute inset-x-1 top-1 h-9 rounded-lg bg-primary/10" aria-hidden />
              )}
              <Icon className={cn('relative z-10 h-5 w-5', active && 'text-primary')} aria-hidden />
              <span className="relative z-10 leading-none">{label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-semibold text-muted-foreground transition-all hover:text-foreground"
        >
          <PanelLeft className="relative z-10 h-5 w-5" aria-hidden />
          <span className="relative z-10 leading-none">Menu</span>
          <span className="sr-only">Open navigation menu</span>
        </button>
      </div>
    </nav>
  )
}
