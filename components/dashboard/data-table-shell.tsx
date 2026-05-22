import { cn } from '@/lib/utils'

interface DataTableShellProps {
  children: React.ReactNode
  className?: string
  /** Hint for screen readers when table scrolls horizontally */
  label?: string
}

/**
 * Mobile-first table wrapper: full-bleed horizontal scroll on small screens,
 * contained scroll on larger breakpoints.
 */
export function DataTableShell({
  children,
  className,
  label = 'Scrollable table',
}: DataTableShellProps) {
  return (
    <div
      className={cn(
        '-mx-1 w-[calc(100%+0.5rem)] overflow-x-auto overscroll-x-contain sm:mx-0 sm:w-full',
        'rounded-lg border border-transparent sm:border-0',
        className,
      )}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <div className="min-w-[640px] px-1 sm:min-w-0 sm:px-0">{children}</div>
    </div>
  )
}
