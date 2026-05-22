import { cn } from '@/lib/utils'

interface DashboardPageShellProps {
  children: React.ReactNode
  className?: string
  /** Constrain content width for readability on ultra-wide screens */
  constrained?: boolean
}

/**
 * Consistent page padding and max-width for all dashboard routes.
 */
export function DashboardPageShell({
  children,
  className,
  constrained = true,
}: DashboardPageShellProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
        constrained && 'mx-auto w-full max-w-[1600px]',
        className,
      )}
    >
      {children}
    </div>
  )
}
