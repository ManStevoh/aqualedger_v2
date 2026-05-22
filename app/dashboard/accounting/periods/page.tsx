'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { CalendarClock, Lock } from 'lucide-react'

interface Period {
  id: string
  name: string
  period_start: string
  period_end: string
  status: string
}

export default function FiscalPeriodsPage() {
  const meta = useDashboardPageMeta()

  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    authFetchJson<{ success: boolean; data?: { periods: Period[] } }>('/api/v2/accounting/periods')
      .then((res) => {
        if (res.success && res.data?.periods) setPeriods(res.data.periods)
      })
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const closePeriod = async (periodId: string) => {
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/accounting/periods', {
        method: 'PATCH',
        body: JSON.stringify({ periodId, action: 'close' }),
      })
      if (res.success) {
        toast.success('Period closed')
        load()
      }
    } catch {
      toast.error('Cannot close — resolve draft payroll first')
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<Card>
        <CardHeader><CardTitle>Periods</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-muted-foreground">Loading…</p>}
          {periods.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between border rounded-lg p-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {String(p.period_start).slice(0, 10)} — {String(p.period_end).slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.status === 'open' ? 'default' : 'secondary'}>{p.status}</Badge>
                {p.status === 'open' && (
                  <Button size="sm" variant="outline" onClick={() => closePeriod(p.id)}>
                    <Lock className="h-3 w-3 mr-1" /> Close
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!loading && periods.length === 0 && (
            <p className="text-muted-foreground">No periods — one is auto-created on first payroll run</p>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}

