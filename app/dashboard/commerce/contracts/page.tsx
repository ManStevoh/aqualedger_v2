'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { FileSpreadsheet, Plus, Package } from 'lucide-react'
import { toast } from 'sonner'

interface Contract {
  id: string
  contract_number: string
  buyer_name: string
  species_name: string | null
  price_per_kg: number
  contracted_kg: number
  delivered_kg: number
  status: string
  start_date: string
  end_date: string
}

export default function SalesContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [summary, setSummary] = useState({ active: 0, draft: 0, openKg: 0, openValueKes: 0 })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fulfillId, setFulfillId] = useState<string | null>(null)
  const [buyerName, setBuyerName] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [contractedKg, setContractedKg] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fulfillKg, setFulfillKg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cRes, sRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { contracts: Contract[] } }>(
          '/api/v2/commerce/contracts?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { summary: typeof summary } }>(
          '/api/v2/commerce/contracts?summary=1',
        ),
      ])
      if (cRes.success && cRes.data?.contracts) setContracts(cRes.data.contracts)
      if (sRes.success && sRes.data?.summary) setSummary(sRes.data.summary)
    } catch {
      toast.error('Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createContract = async () => {
    if (!buyerName.trim() || !pricePerKg || !contractedKg || !startDate || !endDate) {
      toast.error('Fill all required fields')
      return
    }
    const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/commerce/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerName: buyerName.trim(),
        pricePerKg: parseFloat(pricePerKg),
        contractedKg: parseFloat(contractedKg),
        startDate,
        endDate,
        status: 'active',
      }),
    })
    if (!res.success) {
      toast.error(res.error || 'Failed')
      return
    }
    toast.success('Contract created')
    setDialogOpen(false)
    load()
  }

  const recordFulfillment = async () => {
    if (!fulfillId || !fulfillKg) return
    const res = await authFetchJson<{ success: boolean; error?: string }>(
      `/api/v2/commerce/contracts/${fulfillId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fulfill', quantityKg: parseFloat(fulfillKg) }),
      },
    )
    if (!res.success) {
      toast.error(res.error || 'Failed')
      return
    }
    toast.success('Delivery recorded')
    setFulfillId(null)
    setFulfillKg('')
    load()
  }

  const kes = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forward sales contracts</h1>
          <p className="text-muted-foreground">Pre-sell harvest to hotels, exporters, and wholesalers</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New contract
        </Button>
      </div>

      <StatCardGrid>
        <StatCard title="Active" value={summary.active} icon={<FileSpreadsheet className="h-4 w-4" />} loading={loading} />
        <StatCard title="Draft" value={summary.draft} loading={loading} />
        <StatCard title="Open volume (kg)" value={summary.openKg.toLocaleString()} icon={<Package className="h-4 w-4" />} loading={loading} />
        <StatCard title="Open value" value={kes(summary.openValueKes)} loading={loading} />
      </StatCardGrid>

      <Card>
        <CardHeader><CardTitle>Contracts</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Price/kg</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => {
                const pct = Number(c.contracted_kg) > 0
                  ? Math.round((Number(c.delivered_kg) / Number(c.contracted_kg)) * 100)
                  : 0
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.contract_number}</TableCell>
                    <TableCell>{c.buyer_name}</TableCell>
                    <TableCell>
                      {Number(c.delivered_kg).toLocaleString()} / {Number(c.contracted_kg).toLocaleString()} kg ({pct}%)
                    </TableCell>
                    <TableCell>{kes(Number(c.price_per_kg))}</TableCell>
                    <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                    <TableCell>
                      {c.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => setFulfillId(c.id)}>
                          Record delivery
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New forward contract</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2"><Label>Buyer</Label><Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Price/kg (KES)</Label><Input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} /></div>
              <div className="space-y-2"><Label>Volume (kg)</Label><Input type="number" value={contractedKg} onChange={(e) => setContractedKg(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Start</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>End</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createContract}>Create & activate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fulfillId} onOpenChange={() => setFulfillId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record delivery</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Quantity (kg)</Label>
            <Input type="number" value={fulfillKg} onChange={(e) => setFulfillKg(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={recordFulfillment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
