'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { FileText, Loader2 } from 'lucide-react'

interface MatchRow {
  id: string
  purchase_order_id: string
  po_number?: string
  po_amount: number
  invoiced_amount: number
  received_amount: number
  variance_amount: number
  status: string
  ap_invoice_id?: string | null
}

interface PoOption {
  id: string
  po_number: string
  total_amount: number
  status: string
}

export default function ThreeWayMatchPage() {
  const meta = useDashboardPageMeta({
    title: 'Procurement 3-way match',
    description: 'Purchase order · Goods receipt · Supplier invoice',
  })

  const [matches, setMatches] = useState<MatchRow[]>([])
  const [pos, setPos] = useState<PoOption[]>([])
  const [poId, setPoId] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [invoicing, setInvoicing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [matchRes, poRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { matches: MatchRow[] } }>(
          '/api/v2/procurement/match',
        ),
        authFetchJson<{ success: boolean; data?: { orders: PoOption[] } }>(
          '/api/v2/procurement/orders?limit=50',
        ),
      ])
      if (matchRes.success && matchRes.data?.matches) {
        setMatches(matchRes.data.matches as MatchRow[])
      }
      if (poRes.success && poRes.data?.orders) {
        setPos(
          poRes.data.orders.filter((p) => p.status !== 'cancelled' && p.status !== 'draft'),
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const runMatch = async () => {
    if (!poId) {
      toast.error('Select a purchase order')
      return
    }
    setRunning(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/procurement/match',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purchaseOrderId: poId }),
        },
      )
      if (!res.success) throw new Error(res.error || 'Match failed')
      toast.success('3-way match updated')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Match failed')
    } finally {
      setRunning(false)
    }
  }

  const createApInvoice = async () => {
    if (!poId) {
      toast.error('Select a purchase order')
      return
    }
    setInvoicing(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        error?: string
        data?: { invoice: { invoice_number: string } }
      }>('/api/v2/accounting/ap/from-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseOrderId: poId, postToGl: false }),
      })
      if (!res.success) throw new Error(res.error || 'Could not create AP invoice')
      toast.success(`AP invoice ${res.data?.invoice.invoice_number} created`)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invoice failed')
    } finally {
      setInvoicing(false)
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/accounting/invoices">View all invoices</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run 3-way match</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Purchase order</Label>
            <Select value={poId} onValueChange={setPoId}>
              <SelectTrigger>
                <SelectValue placeholder="Select PO" />
              </SelectTrigger>
              <SelectContent>
                {pos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.po_number} — KES {Number(p.total_amount).toLocaleString()} ({p.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runMatch} disabled={running || !poId}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run match'}
          </Button>
          <Button variant="secondary" className="gap-2" onClick={createApInvoice} disabled={invoicing || !poId}>
            {invoicing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Create AP invoice
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground text-sm py-4">Loading…</p>
          ) : matches.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No match records yet — run match on a PO with GRN.</p>
          ) : (
            matches.map((m) => (
              <div key={m.id} className="flex flex-wrap justify-between gap-2 border-b py-3 text-sm">
                <div>
                  <span className="font-mono">{m.po_number || m.purchase_order_id.slice(0, 8)}</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    PO KES {Number(m.po_amount).toLocaleString()} · Received KES{' '}
                    {Number(m.received_amount).toLocaleString()} · Invoice KES{' '}
                    {Number(m.invoiced_amount).toLocaleString()}
                    {Number(m.variance_amount) > 0 &&
                      ` · Variance KES ${Number(m.variance_amount).toLocaleString()}`}
                  </p>
                </div>
                <Badge variant={m.status === 'matched' ? 'default' : 'secondary'}>{m.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
