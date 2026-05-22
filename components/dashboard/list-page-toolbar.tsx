'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ListPageToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: React.ReactNode
  views?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function ListPageToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  views,
  actions,
  className,
}: ListPageToolbarProps) {
  const showSearch = onSearchChange !== undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 w-full flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {showSearch && (
          <div className="relative w-full min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 rounded-lg bg-background pl-9 text-base sm:h-9 sm:text-sm"
            />
          </div>
        )}
        {filters}
        {views}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
