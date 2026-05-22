'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { Search, Ship, Fish, Package, Truck } from 'lucide-react'
import { toast } from 'sonner'

interface TraceabilityChain {
  lot: {
    lot_code: string
    species_name: string | null
    vessel_name: string | null
    landing_site: string | null
    catch_date: string | null
    grading: string | null
    msc_certified: number
    status: string
  }
  catch?: Record<string, unknown>
  trip?: Record<string, unknown>
  boat?: Record<string, unknown>
  auction?: Record<string, unknown>
  orders?: Record<string, unknown>[]
  deliveries?: Record<string, unknown>[]
  movements?: Record<string, unknown>[]
}

export default function TraceabilityPage() {
  const [lotCode, setLotCode] = useState('')
  const [chain, setChain] = useState<TraceabilityChain | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    const code = lotCode.trim()
    if (!code) {
      toast.error('Enter a lot code')
      return
    }
    setLoading(true)
    setChain(null)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { chain: TraceabilityChain }
        error?: string
      }>(`/api/v2/traceability/chain?lotCode=${encodeURIComponent(code)}`)
      if (res.success && res.data?.chain) {
        setChain(res.data.chain)
      } else {
        toast.error(res.error || 'Lot not found')
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Traceability"
      description="Boat → catch → auction → buyer chain (EU 1379/2013)"
    >
            <Card>
        <CardHeader>
          <CardTitle>Search by lot code</CardTitle>
          <CardDescription>GS1-style lot ID from landing, storage, or sales</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Lot code</Label>
            <Input
              value={lotCode}
              onChange={(e) => setLotCode(e.target.value)}
              placeholder="LOT-KE-2026-001"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button className="gap-2" onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4" />
            {loading ? 'Searching…' : 'Trace chain'}
          </Button>
        </CardContent>
      </Card>

      {chain && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5" />
                Lot {chain.lot.lot_code}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Species:</span> {chain.lot.species_name || '—'}</p>
              <p><span className="text-muted-foreground">Vessel:</span> {chain.lot.vessel_name || '—'}</p>
              <p><span className="text-muted-foreground">Landing:</span> {chain.lot.landing_site || '—'}</p>
              <p><span className="text-muted-foreground">Catch date:</span> {chain.lot.catch_date || '—'}</p>
              <p><span className="text-muted-foreground">Grade:</span> {chain.lot.grading || '—'}</p>
              <Badge variant={chain.lot.msc_certified ? 'default' : 'secondary'}>
                {chain.lot.msc_certified ? 'MSC certified' : 'Not MSC'}
              </Badge>
              <Badge className="ml-2">{chain.lot.status}</Badge>
            </CardContent>
          </Card>

          {chain.boat && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Vessel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {String(chain.boat.name || '—')}</p>
                <p><span className="text-muted-foreground">Registration:</span> {String(chain.boat.registration_number || '—')}</p>
                <p><span className="text-muted-foreground">Owner:</span> {String(chain.boat.owner_name || '—')}</p>
              </CardContent>
            </Card>
          )}

          {chain.catch && (
            <Card>
              <CardHeader><CardTitle>Catch</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Quantity:</span> {String(chain.catch.quantity_kg)} kg</p>
                <p><span className="text-muted-foreground">Grade:</span> {String(chain.catch.grade || '—')}</p>
                <p><span className="text-muted-foreground">Species:</span> {String(chain.catch.species_name || '—')}</p>
              </CardContent>
            </Card>
          )}

          {chain.trip && (
            <Card>
              <CardHeader><CardTitle>Trip</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Zone:</span> {String(chain.trip.fishing_zone || '—')}</p>
                <p><span className="text-muted-foreground">Landing site:</span> {String(chain.trip.landing_site_name || '—')}</p>
                <p><span className="text-muted-foreground">Departure:</span> {String(chain.trip.departure_time || '').slice(0, 16)}</p>
              </CardContent>
            </Card>
          )}

          {chain.auction && (
            <Card>
              <CardHeader><CardTitle>Auction</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Species:</span> {String(chain.auction.species_name)}</p>
                <p><span className="text-muted-foreground">Qty:</span> {String(chain.auction.quantity_kg)} kg</p>
                <p><span className="text-muted-foreground">Status:</span> {String(chain.auction.status)}</p>
              </CardContent>
            </Card>
          )}

          {chain.movements && chain.movements.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory movements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {chain.movements.map((m) => (
                    <li key={String(m.id)} className="rounded-md border p-2">
                      {String(m.movement_type)} — {String(m.quantity_kg)} kg
                      {m.to_location ? ` → ${String(m.to_location)}` : ''}
                      <span className="ml-2 text-muted-foreground">{String(m.created_at).slice(0, 10)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {chain.deliveries && chain.deliveries.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {chain.deliveries.map((d) => (
                    <li key={String(d.id)} className="rounded-md border p-2">
                      {String(d.tracking_code)} — {String(d.status)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardPageLayout>
  )
}
