'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Building2, Plus, RefreshCw } from 'lucide-react'

interface Asset {
  id: string
  asset_code: string
  name: string
  category: string
  purchase_cost: number
  accumulated_depreciation: number
  book_value?: number
  status: string
}

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')

  const load = () =>
    authFetchJson<{ success: boolean; data?: { assets: Asset[] } }>('/api/v2/accounting/fixed-assets').then(
      (res) => {
        if (res.success && res.data?.assets) setAssets(res.data.assets)
      },
    )

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/accounting/fixed-assets', {
        method: 'POST',
        body: JSON.stringify({
          assetCode: code,
          name,
          category: 'vessel',
          purchaseDate: new Date().toISOString().split('T')[0],
          purchaseCost: Number(cost),
        }),
      })
      if (res.success) {
        toast.success('Asset registered')
        load()
      }
    } catch {
      toast.error('Failed to create asset')
    }
  }

  const depreciate = async () => {
    const res = await authFetchJson<{ success: boolean; data?: { updated: number } }>(
      '/api/v2/accounting/fixed-assets',
      { method: 'PATCH', body: JSON.stringify({ action: 'depreciate' }) },
    )
    if (res.success) {
      toast.success(`Updated ${res.data?.updated ?? 0} assets`)
      load()
    }
  }

  return (
    <DashboardPageLayout title="Fixed Assets" description="Vessels, cold storage equipment, vehicles — straight-line depreciation" actions={
        <Button variant="outline" onClick={depreciate}><RefreshCw className="h-4 w-4 mr-2" />Run depreciation</Button>
      }>


      <Card>
        <CardHeader><CardTitle>Register asset</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Cost (KES)</Label><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={create}><Plus className="h-4 w-4 mr-2" />Add</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Asset register</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {assets.map((a) => (
            <div key={a.id} className="flex justify-between border-b py-3">
              <div>
                <p className="font-medium">{a.asset_code} — {a.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{a.category}</p>
              </div>
              <div className="text-right">
                <p>Book: KES {Number(a.book_value ?? a.purchase_cost - a.accumulated_depreciation).toLocaleString()}</p>
                <Badge variant="outline">{a.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
