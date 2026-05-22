'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Scale } from 'lucide-react'

interface Reconciliation {
  id: string
  statement_date: string
  opening_balance: number
  closing_balance: number
  status: string
}

export default function BankReconciliationPage() {
  const [items, setItems] = useState<Reconciliation[]>([])
  const [loading, setLoading] = useState(true)
  const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0])
  const [opening, setOpening] = useState('0')
  const [closing, setClosing] = useState('0')

  const load = async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { reconciliations: Reconciliation[] } }>(
        '/api/v2/accounting/bank-reconciliation?limit=50',
      )
      if (res.success && res.data?.reconciliations) setItems(res.data.reconciliations)
    } catch {
      toast.error('Failed to load reconciliations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/accounting/bank-reconciliation', {
        method: 'POST',
        body: JSON.stringify({
          statementDate,
          openingBalance: Number(opening),
          closingBalance: Number(closing),
          status: 'draft',
        }),
      })
      if (res.success) {
        toast.success('Reconciliation created')
        load()
      }
    } catch {
      toast.error('Failed to create')
    }
  }

  return (
    <DashboardPageLayout title="Bank Reconciliation" description="Match bank statements to ledger cash accounts">


      <Card>
        <CardHeader><CardTitle>New statement</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div><Label>Statement date</Label><Input type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} /></div>
          <div><Label>Opening balance</Label><Input type="number" value={opening} onChange={(e) => setOpening(e.target.value)} /></div>
          <div><Label>Closing balance</Label><Input type="number" value={closing} onChange={(e) => setClosing(e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={create}><Plus className="h-4 w-4 mr-2" />Add</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Statements</CardTitle></CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Loading…</p>}
          {items.map((r) => (
            <div key={r.id} className="flex justify-between border-b py-3">
              <span>{String(r.statement_date).slice(0, 10)}</span>
              <span>KES {Number(r.opening_balance).toLocaleString()} → {Number(r.closing_balance).toLocaleString()}</span>
              <Badge variant="outline">{r.status}</Badge>
            </div>
          ))}
          {!loading && items.length === 0 && <p className="text-muted-foreground py-4">No reconciliations yet</p>}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
