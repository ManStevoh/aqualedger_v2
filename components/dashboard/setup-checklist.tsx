import Link from 'next/link'
import { ArrowRight, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface SetupChecklistProps {
  completedSteps: number
  totalSteps: number
  className?: string
}

export function SetupChecklist({
  completedSteps,
  totalSteps,
  className,
}: SetupChecklistProps) {
  const safeTotal = Math.max(totalSteps, 1)
  const safeCompleted = Math.min(Math.max(completedSteps, 0), safeTotal)
  const percent = Math.round((safeCompleted / safeTotal) * 100)
  const remaining = safeTotal - safeCompleted

  return (
    <Card
      className={cn(
        'overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ListChecks className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-lg">Finish setting up your workspace</CardTitle>
          <CardDescription>
            {remaining > 0
              ? `${remaining} step${remaining === 1 ? '' : 's'} left to unlock the full command center.`
              : 'Almost there — review your setup and go live.'}
          </CardDescription>
        </div>
        <Button variant="default" size="sm" className="shrink-0" asChild>
          <Link href="/dashboard/onboarding">
            Continue
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium tabular-nums">
            {safeCompleted} of {safeTotal} complete
          </span>
          <span className="text-muted-foreground tabular-nums">{percent}%</span>
        </div>
        <Progress value={percent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Profile, operations, and go-live checks —{' '}
          <Link
            href="/dashboard/onboarding"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            open setup guide
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
