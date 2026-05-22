import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge'

export type StatusBadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple'

const TONE_VARIANT: Record<StatusTone, StatusBadgeVariant> = {
  neutral: 'secondary',
  info: 'default',
  success: 'default',
  warning: 'outline',
  danger: 'destructive',
  purple: 'outline',
}

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: '',
  info: 'border-transparent bg-primary/10 text-primary',
  success: 'border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning: 'border-transparent bg-amber-500/10 text-amber-800 dark:text-amber-400',
  danger: '',
  purple: 'border-transparent bg-violet-500/10 text-violet-700 dark:text-violet-400',
}

/** Maps common ERP / operations status strings to semantic badge styling */
export function resolveStatusTone(status: string): StatusTone {
  const s = status.toLowerCase().replace(/\s+/g, '_')

  if (['premium', 'export', 'local', 'a', 'b', 'c'].includes(s)) {
    return resolveGradeTone(s)
  }

  if (
    ['delivered', 'completed', 'paid', 'posted', 'active', 'approved', 'confirmed', 'closed', 'success', 'pass'].includes(
      s,
    )
  ) {
    return 'success'
  }

  if (
    ['pending', 'draft', 'open', 'scheduled', 'processing', 'in_progress', 'ongoing'].includes(s)
  ) {
    return 'warning'
  }

  if (
    ['cancelled', 'canceled', 'failed', 'rejected', 'overdue', 'breach', 'critical', 'fail', 'error', 'suspended'].includes(
      s,
    )
  ) {
    return 'danger'
  }

  if (['shipped', 'in_transit', 'dispatched', 'sent'].includes(s)) {
    return 'purple'
  }

  if (['confirmed', 'submitted', 'review', 'docked'].includes(s)) {
    return 'info'
  }

  if (['maintenance'].includes(s)) {
    return 'warning'
  }

  if (['retired'].includes(s)) {
    return 'neutral'
  }

  return 'neutral'
}

export function getStatusBadgeProps(status: string): {
  variant: StatusBadgeVariant
  className: string
} {
  const tone = resolveStatusTone(status)
  return {
    variant: TONE_VARIANT[tone],
    className: TONE_CLASS[tone],
  }
}

export function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Catch grade → tone */
export function resolveGradeTone(grade: string): StatusTone {
  const g = grade.toLowerCase()
  if (g === 'a' || g === 'premium') return 'success'
  if (g === 'b' || g === 'export') return 'info'
  return 'neutral'
}
