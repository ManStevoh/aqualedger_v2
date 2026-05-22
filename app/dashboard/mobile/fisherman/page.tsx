'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authFetchJson } from '@/lib/api'
import { Fish, CloudOff, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function FishermanMobilePage() {
  const [tripId, setTripId] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [quantityKg, setQuantityKg] = useState('')
  const [pending, setPending] = useState(0)

  const queueCatch = async () => {
    const deviceId = localStorage.getItem('aquaerp_device_id') || `dev-${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem('aquaerp_device_id', deviceId)
    try {
      await authFetchJson('/api/v2/offline/sync', {
        method: 'POST',
        body: JSON.stringify({
          deviceId,
          actionType: 'catch.log',
          payload: { tripId, speciesId, quantityKg: Number(quantityKg), grade: 'B', storageMethod: 'fresh' },
          clientTimestamp: new Date().toISOString(),
        }),
      })
      setPending((p) => p + 1)
      toast.success('Catch queued for sync')
    } catch {
      toast.error('Queue failed')
    }
  }

  const syncNow = async () => {
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { synced: number; failed: number }
      }>('/api/v2/offline/sync', { method: 'POST', body: JSON.stringify({ action: 'process' }) })
      if (res.success && res.data) {
        toast.success(`Synced ${res.data.synced}, failed ${res.data.failed}`)
        setPending(0)
      }
    } catch {
      toast.error('Sync failed — check connection')
    }
  }

  return (
    <DashboardPageLayout
      title="Fisherman — Quick log"
      description="Works offline · sync when back online"
      hideWorkspaceNav
    >
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      
      <main className="p-4 space-y-4">
        {pending > 0 && (
          <Card className="bg-amber-900/30 border-amber-700">
            <CardContent className="pt-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm"><CloudOff className="h-4 w-4" />{pending} pending</span>
              <Button size="sm" onClick={syncNow}><Upload className="h-4 w-4 mr-1" />Sync</Button>
            </CardContent>
          </Card>
        )}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-base">Log catch</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Trip ID</Label><Input className="mt-1 bg-slate-800" value={tripId} onChange={(e) => setTripId(e.target.value)} /></div>
            <div><Label>Species ID</Label><Input className="mt-1 bg-slate-800" value={speciesId} onChange={(e) => setSpeciesId(e.target.value)} /></div>
            <div><Label>Quantity (kg)</Label><Input className="mt-1 bg-slate-800" type="number" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} /></div>
            <Button className="w-full min-h-[48px]" onClick={queueCatch}>Save catch</Button>
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full border-slate-700" asChild>
          <a href="/dashboard/catches">Full catches module →</a>
        </Button>
      </main>
    </DashboardPageLayout>
  )
}
