import {
  ClipboardList,
  Package,
  Ship,
  ShoppingCart,
  Snowflake,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

const KPIS = [
  { title: 'Fleet vessels', value: '24', sub: '18 active', icon: Ship },
  { title: 'Orders', value: '156', sub: 'This month', icon: ShoppingCart },
  { title: 'Revenue', value: 'KES 4.2M', sub: 'Order totals', icon: Package },
  { title: 'Cold alerts', value: '0', sub: 'All zones OK', icon: Snowflake },
] as const

const QUICK = [
  { label: 'Log catch', icon: Ship },
  { label: 'Create order', icon: ShoppingCart },
  { label: 'Cold alerts', icon: Snowflake },
  { label: 'Purchase order', icon: ClipboardList },
] as const

export function HeroDashboardPreview({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div
        className="pointer-events-none absolute -right-4 -top-4 z-10 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm"
        aria-hidden
      >
        Cold chain compliant
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          <span className="ml-2 flex-1 truncate text-center text-xs text-muted-foreground">
            app.{APP_NAME.toLowerCase().replace(/\s/g, '')}.io/dashboard
          </span>
        </div>

        <div className="flex min-h-[280px] bg-background sm:min-h-[320px]">
          <div className="hidden w-[72px] shrink-0 border-r border-border bg-sidebar px-2 py-4 sm:block">
            <div className="mb-4 h-8 w-8 rounded-lg bg-primary/15" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-7 rounded-md',
                    i === 1 ? 'bg-primary/20' : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Executive summary
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {APP_NAME} command center
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {KPIS.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div
                    key={kpi.title}
                    className="rounded-lg border border-border bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                        {kpi.title}
                      </p>
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary opacity-80" />
                    </div>
                    <p className="mt-1 text-base font-bold tabular-nums text-foreground sm:text-lg">
                      {kpi.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">{kpi.sub}</p>
                  </div>
                )
              })}
            </div>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
              Quick actions
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {QUICK.map((action) => {
                const Icon = action.icon
                return (
                  <div
                    key={action.label}
                    className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-2"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate text-[11px] font-medium text-foreground sm:text-xs">
                      {action.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
