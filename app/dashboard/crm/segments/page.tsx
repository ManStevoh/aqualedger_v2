'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function CrmSegmentsPage() {
  const [summary, setSummary] = useState<{ segment: string; count: number; revenue: number }[]>([])

  const load = () => {
    authFetchJson<{ success: boolean; data?: { summary: typeof summary } }>(
      '/api/v2/crm/segments?summary=1',
    ).then((res) => {
      if (res.success && res.data?.summary) setSummary(res.data.summary)
    })
  }

  useEffect(() => { load() }, [])

  const computeRfm = async () => {
    const res = await authFetchJson<{ success: boolean; data?: { updated: number } }>(
      '/api/v2/crm/segments',
      { method: 'POST', body: JSON.stringify({ action: 'compute_rfm' }) },
    )
    if (res.success) {
      toast.success(`RFM updated for ${res.data?.updated ?? 0} customers`)
      load()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer segmentation</h1>
        <Button onClick={computeRfm}>Run RFM analysis</Button>
      </div>
      <p className="text-muted-foreground">Champion · Loyal · New · At risk · Lost — auto-assigned from order history</p>
      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((s) => (
          <Card key={s.segment}>
            <CardHeader><CardTitle className="capitalize">{s.segment}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-sm text-muted-foreground">KES {Number(s.revenue).toLocaleString()} revenue</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
