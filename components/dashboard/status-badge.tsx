import { Badge } from '@/components/ui/badge'
import { formatStatusLabel, getStatusBadgeProps } from '@/lib/ui/status-colors'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { variant, className: toneClass } = getStatusBadgeProps(status)
  return (
    <Badge variant={variant} className={cn('font-medium capitalize', toneClass, className)}>
      {label ?? formatStatusLabel(status)}
    </Badge>
  )
}
