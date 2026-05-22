'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
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
    <DashboardPageLayout
      title="Forward sales contracts"
      description="Pre-sell harvest to hotels, exporters, and wholesalers"
    >
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
    </DashboardPageLayout>
  )
}
