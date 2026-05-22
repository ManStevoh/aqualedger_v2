'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { Bell, Building2, HelpCircle, Menu, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/client-api'
import { authFetchJson, useNotifications } from '@/lib/api'
import { getNavForRole } from '@/lib/platform/modules'
import { legacyRoleToMemberRole } from '@/lib/platform/permissions'
import { resolvePageContext } from '@/lib/platform/page-context'
import { useTenantContext } from '@/lib/hooks/use-tenant-context'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  investor: 'Investor (platform)',
  boat_owner: 'Boat Owner',
  fisherman: 'Fisherman',
  fish_buyer: 'Fish Buyer',
  bmu_official: 'BMU Official',
}

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname() ?? '/dashboard'
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [businessResults, setBusinessResults] = useState<
    { type: string; id: string; title: string; subtitle?: string; href: string }[]
  >([])
  const [searchLoading, setSearchLoading] = useState(false)
  const pageContext = useMemo(() => resolvePageContext(pathname), [pathname])
  const tenant = useTenantContext()
  const {
    currentUser,
    currentRole,
    navSearchQuery,
    setNavSearchQuery,
    toggleSidebar,
    setCurrentUser,
    setCurrentRole,
    setSidebarOpen,
    enabledModuleIds,
    modulesLoaded,
  } = useAppStore()
  const { data: notificationsData } = useNotifications(currentUser?.id)

  const unreadCount = notificationsData?.unreadCount ?? 0

  const navItems = useMemo(() => {
    const memberRole = legacyRoleToMemberRole(currentRole)
    return getNavForRole(
      memberRole,
      currentRole,
      modulesLoaded ? enabledModuleIds : ['platform'],
    ).flatMap((mod) =>
      mod.nav.map((item) => ({
        ...item,
        moduleLabel: mod.label,
      })),
    )
  }, [currentRole, enabledModuleIds, modulesLoaded])

  const searchResults = useMemo(() => {
    const q = navSearchQuery.trim().toLowerCase()
    if (!q) return []
    return navItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.moduleLabel.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
    )
  }, [navItems, navSearchQuery])

  useEffect(() => {
    const q = navSearchQuery.trim()
    if (q.length < 2) {
      setBusinessResults([])
      return
    }
    const t = setTimeout(() => {
      setSearchLoading(true)
      authFetchJson<{ success: boolean; data?: { results: typeof businessResults } }>(
        `/api/v2/search?q=${encodeURIComponent(q)}`,
      )
        .then((res) => {
          if (res.success && res.data?.results) setBusinessResults(res.data.results)
          else setBusinessResults([])
        })
        .catch(() => setBusinessResults([]))
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [navSearchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials =
    currentUser?.name
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    setCurrentUser(null)
    setCurrentRole('fisherman')
    router.push('/login')
    router.refresh()
  }

  const navigateToResult = (href: string) => {
    setNavSearchQuery('')
    setSearchFocused(false)
    setSidebarOpen(false)
    router.push(href)
  }

  const showSearchDropdown = searchFocused && navSearchQuery.trim().length > 0

  return (
    <header className="sticky top-0 z-40 flex h-[4.25rem] shrink-0 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 lg:gap-4 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="shrink-0 lg:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="min-w-0 max-w-[140px] shrink-0 sm:max-w-[200px] md:max-w-none">
        <p className="truncate text-sm font-semibold tracking-tight">{pageContext.title}</p>
        <p className="hidden truncate text-xs text-muted-foreground md:block">
          {pageContext.moduleLabel
            ? `${pageContext.moduleLabel}${pageContext.subtitle ? ` · ${pageContext.subtitle}` : ''}`
            : (pageContext.subtitle ?? 'Operations')}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:justify-center lg:gap-3">
        <div ref={searchRef} className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders, lots, modules… (⌘K)"
            value={navSearchQuery}
            onChange={(e) => setNavSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className={cn(
              'h-10 w-full rounded-xl border-transparent bg-muted/60 pl-9 shadow-none transition-all',
              searchFocused && 'bg-background ring-2 ring-ring/30',
            )}
          />
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-80 overflow-auto rounded-xl border border-border/80 bg-popover/95 p-1 shadow-xl backdrop-blur-xl">
              {searchLoading && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">Searching…</p>
              )}
              {!searchLoading && businessResults.length > 0 && (
                <div className="p-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Records</p>
                  <ul>
                    {businessResults.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                          onClick={() => navigateToResult(item.href)}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{item.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.type}
                              {item.subtitle ? ` · ${item.subtitle}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div className="border-t p-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Pages</p>
                  <ul>
                    {searchResults.slice(0, 8).map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <li key={item.href}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => navigateToResult(item.href)}
                          >
                            <ItemIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {!searchLoading &&
                businessResults.length === 0 &&
                searchResults.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{navSearchQuery}&rdquo;
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {tenant.name && !tenant.loading && (
          <Badge
            variant="outline"
            className="hidden max-w-[140px] truncate rounded-lg font-normal lg:inline-flex"
          >
            <Building2 className="mr-1 h-3 w-3 shrink-0" />
            {tenant.name}
          </Badge>
        )}

        <Badge variant="secondary" className="hidden rounded-lg font-medium sm:inline-flex">
          {roleLabels[currentRole]}
        </Badge>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          title="Module guides"
          onClick={() => router.push('/dashboard/modules')}
        >
          <HelpCircle className="h-[1.125rem] w-[1.125rem]" />
          <span className="sr-only">Help</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative rounded-xl" asChild>
          <Link href="/dashboard/notifications">
            <Bell className="h-[1.125rem] w-[1.125rem]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 rounded-xl px-2">
              <Avatar className="h-8 w-8 ring-2 ring-border/80">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="max-w-[120px] truncate text-sm font-medium leading-none">
                  {currentUser?.name || 'Account'}
                </p>
                <p className="mt-0.5 max-w-[120px] truncate text-xs text-muted-foreground">
                  {tenant.name || roleLabels[currentRole]}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>
              {tenant.name ? (
                <span className="block truncate font-normal text-muted-foreground">
                  {tenant.name}
                  {tenant.plan ? ` · ${tenant.plan}` : ''}
                </span>
              ) : (
                'My account'
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings/security')}>
              Security
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/organization')}>
              Organization
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => void handleLogout()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
