'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { FileText, Plus } from 'lucide-react'

interface TaxReturn {
  id: string
  return_type: string
  period_label: string
  taxable_amount: number
  tax_amount: number
  status: string
}

export default function TaxReturnsPage() {
  const meta = useDashboardPageMeta()

  const [returns, setReturns] = useState<TaxReturn[]>([])
  const [returnType, setReturnType] = useState('vat')
  const [periodLabel, setPeriodLabel] = useState('')

  const load = () =>
    authFetchJson<{ success: boolean; data?: { taxReturns: TaxReturn[] } }>('/api/v2/accounting/tax-returns')
      .then((res) => {
        if (res.success && res.data?.taxReturns) setReturns(res.data.taxReturns)
      })

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/accounting/tax-returns', {
        method: 'POST',
        body: JSON.stringify({ returnType, periodLabel }),
      })
      if (res.success) {
        toast.success('Tax return created')
        load()
      }
    } catch {
      toast.error('Failed to create')
    }
  }

  const fileReturn = async (returnId: string) => {
    await authFetchJson('/api/v2/accounting/tax-returns', {
      method: 'PATCH',
      body: JSON.stringify({ returnId, action: 'file' }),
    })
    toast.success('Marked as filed')
    load()
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<Card>
        <CardHeader><CardTitle>New return</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div>
            <Label>Type</Label>
            <Select value={returnType} onValueChange={setReturnType}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vat">VAT</SelectItem>
                <SelectItem value="paye">PAYE</SelectItem>
                <SelectItem value="withholding">Withholding</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Period</Label><Input placeholder="Q1 2026" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} /></div>
          <Button onClick={create}><Plus className="h-4 w-4 mr-2" />Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Returns</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {returns.map((r) => (
            <div key={r.id} className="flex justify-between items-center border-b py-3">
              <div>
                <p className="font-medium uppercase">{r.return_type} — {r.period_label}</p>
                <p className="text-sm text-muted-foreground">Tax KES {Number(r.tax_amount).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{r.status}</Badge>
                {r.status === 'draft' && (
                  <Button size="sm" variant="outline" onClick={() => fileReturn(r.id)}>File</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}

