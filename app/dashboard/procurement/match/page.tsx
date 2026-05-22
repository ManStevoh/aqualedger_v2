'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function ThreeWayMatchPage() {
  const [matches, setMatches] = useState<Record<string, unknown>[]>([])
  const [poId, setPoId] = useState('')

  const load = () => {
    authFetchJson<{ success: boolean; data?: { matches: Record<string, unknown>[] } }>(
      '/api/v2/procurement/match',
    ).then((res) => {
      if (res.success && res.data?.matches) setMatches(res.data.matches)
    })
  }

  useEffect(() => { load() }, [])

  const run = async () => {
    const res = await authFetchJson<{ success: boolean }>('/api/v2/procurement/match', {
      method: 'POST',
      body: JSON.stringify({ purchaseOrderId: poId }),
    })
    if (res.success) {
      toast.success('Match run complete')
      load()
    }
  }

  return (
    <DashboardPageLayout
      title="Procurement 3-way match"
      description="Purchase order · Goods receipt · Supplier invoice"
    >
            <Card>
        <CardHeader><CardTitle>Run match</CardTitle></CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1"><Label>PO ID</Label><Input value={poId} onChange={(e) => setPoId(e.target.value)} /></div>
          <Button onClick={run}>Match</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Match records</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {matches.map((m) => (
            <div key={String(m.id)} className="flex justify-between border-b py-2 text-sm">
              <span>PO {String(m.po_number || m.purchase_order_id).slice(0, 8)}</span>
              <span>PO KES {Number(m.po_amount).toLocaleString()} · Inv KES {Number(m.invoiced_amount).toLocaleString()}</span>
              <Badge>{String(m.status)}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}