import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { Plus, ScanLine } from 'lucide-react'
import { toast } from 'sonner'

interface TraceabilityLot {
  id: string
  lot_code: string
  species_name: string | null
  vessel_name: string | null
  landing_site: string | null
  catch_date: string | null
  grading: string | null
  msc_certified: number
  status: string
  created_at: string
}

export default function TraceabilityPage() {
  const meta = useDashboardPageMeta()

  const [lots, setLots] = useState<TraceabilityLot[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lotCode, setLotCode] = useState('')
  const [speciesName, setSpeciesName] = useState('')
  const [vesselName, setVesselName] = useState('')
  const [catchId, setCatchId] = useState('')

  const fetchLots = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { lots: TraceabilityLot[] }
      }>('/api/v2/traceability/lots?limit=100')
      if (data.success && data.data?.lots) {
        setLots(data.data.lots)
      } else {
        setLots([])
      }
    } catch {
      setLots([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLots()
  }, [fetchLots])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/traceability/lots',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lotCode: lotCode.trim() || undefined,
            catchId: catchId.trim() || null,
            speciesName: speciesName.trim() || null,
            vesselName: vesselName.trim() || null,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to create lot')
        return
      }
      toast.success('Traceability lot created')
      setShowDialog(false)
      setLotCode('')
      setSpeciesName('')
      setVesselName('')
      setCatchId('')
      await fetchLots()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Traceability lots
          </CardTitle>
          <CardDescription>Link lot codes to catches and inventory batches</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            data={lots}
            emptyMessage="No traceability lots yet"
            actions={
              <Button className="gap-2" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4" />
                New lot
              </Button>
            }
            columns={[
              { key: 'lot_code', header: 'Lot code' },
              { key: 'species_name', header: 'Species', cell: (r) => r.species_name || '—' },
              { key: 'vessel_name', header: 'Vessel', cell: (r) => r.vessel_name || '—' },
              { key: 'landing_site', header: 'Landing', cell: (r) => r.landing_site || '—' },
              {
                key: 'catch_date',
                header: 'Catch date',
                cell: (r) => (r.catch_date ? new Date(r.catch_date).toLocaleDateString() : '—'),
              },
              {
                key: 'grading',
                header: 'Grade',
                cell: (r) => (r.grading ? <Badge variant="outline">{r.grading}</Badge> : '—'),
              },
              {
                key: 'msc_certified',
                header: 'MSC',
                cell: (r) => (r.msc_certified ? 'Yes' : 'No'),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (r) => <Badge>{r.status}</Badge>,
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create traceability lot</DialogTitle>
            <DialogDescription>
              Provide catch ID to auto-fill from trip metadata, or enter manually
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Catch ID (optional)</Label>
              <Input value={catchId} onChange={(e) => setCatchId(e.target.value)} placeholder="UUID" />
            </div>
            <div className="space-y-2">
              <Label>Lot code (optional — auto-generated)</Label>
              <Input value={lotCode} onChange={(e) => setLotCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Species</Label>
              <Input value={speciesName} onChange={(e) => setSpeciesName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Vessel</Label>
              <Input value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

