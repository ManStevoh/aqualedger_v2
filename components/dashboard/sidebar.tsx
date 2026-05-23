'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { BrandMark } from '@/components/branding/brand-mark'
import { useBrand } from '@/components/branding/brand-provider'
import { useAppStore } from '@/lib/store'
import { getNavForRole } from '@/lib/platform/modules'
import { legacyRoleToMemberRole } from '@/lib/platform/permissions'

export function DashboardSidebar() {
  const pathname = usePathname()
  const brand = useBrand()
  const {
    currentRole,
    memberRole,
    rolePermissions,
    sidebarOpen,
    setSidebarOpen,
    navSearchQuery,
    enabledModuleIds,
    modulesLoaded,
  } = useAppStore()

  const modules = useMemo(() => {
    const resolvedRole = memberRole ?? legacyRoleToMemberRole(currentRole)
    const all = getNavForRole(
      resolvedRole,
      currentRole,
      modulesLoaded ? enabledModuleIds : ['platform'],
      rolePermissions,
    )
    const q = navSearchQuery.trim().toLowerCase()
    if (!q) return all

    return all
      .map((mod) => ({
        ...mod,
        nav: mod.nav.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            mod.label.toLowerCase().includes(q) ||
            item.href.toLowerCase().includes(q),
        ),
      }))
      .filter((mod) => mod.nav.length > 0)
  }, [currentRole, memberRole, rolePermissions, navSearchQuery, enabledModuleIds, modulesLoaded])

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const activeModule = modules.find((mod) =>
      mod.nav.some(
        (item) =>
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href)),
      ),
    )
    if (activeModule) {
      setOpenModules((prev) => ({ ...prev, [activeModule.id]: true }))
    }
  }, [pathname, modules])

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-[17.5rem] flex-col border-r border-sidebar-border/80 bg-sidebar/95 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-sidebar-border/60 px-4">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <BrandMark className="transition-transform group-hover:scale-[1.02]" />
            <div className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
                {brand.appName}
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/45">
                Enterprise
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/70"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 px-3 py-4">
          <nav className="space-y-1" aria-label="Main navigation">
            {modules.map((mod) => {
              const ModuleIcon = mod.icon
              const isModuleActive = mod.nav.some(
                (item) =>
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href)),
              )
              const isOpen = openModules[mod.id] ?? isModuleActive

              return (
                <Collapsible
                  key={mod.id}
                  open={isOpen}
                  onOpenChange={() => toggleModule(mod.id)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
                      'text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                      isModuleActive && 'text-sidebar-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm',
                        mod.color,
                      )}
                    >
                      <ModuleIcon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="flex-1 truncate">{mod.label}</span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-0.5 pb-2 pl-1 pt-1">
                    {mod.nav.map((item) => {
                      const Icon = item.icon
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/80'
                              : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              isActive ? 'text-primary' : 'opacity-60 group-hover:opacity-100',
                            )}
                          />
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="shrink-0 border-t border-sidebar-border/60 p-4">
          <p className="text-[11px] leading-relaxed text-sidebar-foreground/40">
            Maritime ERP · Catch to cash · Cold chain compliant
          </p>
        </div>
      </aside>
    </>
  )
}
