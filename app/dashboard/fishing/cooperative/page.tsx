'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function CooperativeSharesPage() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [shares, setShares] = useState<Record<string, unknown>[]>([])

  const calculate = async () => {
    const res = await authFetchJson<{ success: boolean; data?: { members: unknown[] } }>(
      '/api/v2/cooperative/revenue-shares',
      { method: 'POST', body: JSON.stringify({ periodMonth: period }) },
    )
    if (res.success) {
      toast.success('Shares calculated')
      load()
    }
  }

  const load = () => {
    authFetchJson<{ success: boolean; data?: { shares: Record<string, unknown>[] } }>(
      `/api/v2/cooperative/revenue-shares?period=${period}`,
    ).then((res) => {
      if (res.success && res.data?.shares) setShares(res.data.shares)
    })
  }

  return (
    <DashboardPageLayout
      title="Cooperative revenue sharing"
      description="Distribute catch revenue to members by landed kg"
    >
            <div className="flex gap-4 items-end">
        <div><Label>Period (YYYY-MM)</Label><Input value={period} onChange={(e) => setPeriod(e.target.value)} /></div>
        <Button onClick={calculate}>Calculate shares</Button>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Member shares</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {shares.map((s) => (
            <div key={String(s.id)} className="flex justify-between border-b py-2 text-sm">
              <span>Member {String(s.member_user_id).slice(0, 8)}</span>
              <span>{Number(s.catch_kg).toFixed(1)} kg · {Number(s.share_pct).toFixed(1)}% · KES {Number(s.revenue_share).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}