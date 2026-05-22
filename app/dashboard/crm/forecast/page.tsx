'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authFetchJson } from '@/lib/api'

export default function SalesForecastPage() {
  const [months, setMonths] = useState<{ month: string; forecastRevenue: number; closedRevenue: number }[]>([])
  const [winRate, setWinRate] = useState(0)

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: { forecast: { months: typeof months; winRate: number } } }>(
      '/api/v2/crm/forecast',
    ).then((res) => {
      if (res.success && res.data?.forecast) {
        setMonths(res.data.forecast.months)
        setWinRate(res.data.forecast.winRate)
      }
    })
  }, [])

  return (
    <div className="space-y-8">
      <DashboardPageLayout
      title="Sales forecasting"
      description="Pipeline-weighted forecast · Win rate {(winRate * 100).toFixed(0)}%"
    >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {months.map((m) => (
          <Card key={m.month}>
            <CardHeader><CardTitle>{m.month}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">KES {m.forecastRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Closed: KES {m.closedRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardPageLayout>
  )
}