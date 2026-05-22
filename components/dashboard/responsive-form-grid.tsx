import { cn } from '@/lib/utils'

/** Stacks fields on mobile; 2 columns from sm breakpoint. */
export function ResponsiveFormGrid({
  children,
  className,
  cols = 2,
}: {
  children: React.ReactNode
  className?: string
  cols?: 2 | 3
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3',
        cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Full-width filter controls in toolbars (avoid fixed pixel widths). */
export function FilterControl({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('w-full min-w-0 sm:w-auto sm:min-w-[8rem] sm:max-w-[11rem]', className)}>
      {children}
    </div>
  )
}
