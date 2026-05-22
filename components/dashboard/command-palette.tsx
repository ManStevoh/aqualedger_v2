'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useAppStore } from '@/lib/store'
import { getNavForRole } from '@/lib/platform/modules'
import { legacyRoleToMemberRole } from '@/lib/platform/permissions'
import {
  ClipboardList,
  Package,
  Ship,
  ShoppingCart,
  Snowflake,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Create order', href: '/dashboard/orders', icon: ShoppingCart },
  { label: 'Log catch', href: '/dashboard/catches', icon: Ship },
  { label: 'Check inventory', href: '/dashboard/inventory', icon: Package },
  { label: 'Cold chain alerts', href: '/dashboard/coldchain/alerts', icon: Snowflake },
  { label: 'Raise purchase order', href: '/dashboard/procurement/orders', icon: ClipboardList },
] as const

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { currentRole, enabledModuleIds, modulesLoaded } = useAppStore()

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const run = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Jump to a page or action">
      <CommandInput placeholder="Search modules and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <CommandItem key={action.href} onSelect={() => run(action.href)}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem key={item.href} onSelect={() => run(item.href)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{item.moduleLabel}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
