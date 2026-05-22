import { cn } from '@/lib/utils'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'

export interface KpiItem {
  id: string
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface KpiStripProps {
  items: KpiItem[]
  loading?: boolean
  className?: string
  columns?: 2 | 3 | 4
}

export function KpiStrip({ items, loading = false, className, columns = 4 }: KpiStripProps) {
  const gridClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={cn('grid gap-4', gridClass, className)}>
      {items.map((item) => (
        <StatCard
          key={item.id}
          title={item.title}
          value={item.value}
          description={item.description}
          icon={item.icon}
          trend={item.trend}
          loading={loading}
        />
      ))}
    </div>
  )
}

/** @deprecated Use KpiStrip instead */
export function KpiStripGrid({ children }: { children: React.ReactNode }) {
  return <StatCardGrid>{children}</StatCardGrid>
}
