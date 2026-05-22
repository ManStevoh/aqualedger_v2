'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authFetchJson } from '@/lib/api'

export default function CatchForecastPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: { forecast: Record<string, unknown>[] } }>(
      '/api/v2/fishing-ops/forecast?days=30',
    ).then((res) => {
      if (res.success && res.data?.forecast) setRows(res.data.forecast)
    })
  }, [])

  return (
    <DashboardPageLayout
      title="Catch yield forecast"
      description="30-day projection by zone and species from trip history"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r, i) => (
          <Card key={`${r.zoneId}-${r.speciesName}-${i}`}>
            <CardContent className="pt-4 flex justify-between">
              <div>
                <p className="font-medium">{String(r.zoneName)} · {String(r.speciesName)}</p>
                <p className="text-sm text-muted-foreground">Avg {Number(r.avgKgPerTrip)} kg/trip</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{Number(r.forecastKgNext30)} kg</p>
                <Badge variant="outline">{String(r.trend)}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
    </DashboardPageLayout>
  )
}