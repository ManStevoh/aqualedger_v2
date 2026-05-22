'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
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
    <DashboardPageLayout
      title="Traceability"
      description="EU fisheries / GS1 lot codes — boat to buyer chain of custody"
    >
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