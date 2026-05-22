'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { ArrowLeft, Plus, Thermometer } from 'lucide-react'
import { toast } from 'sonner'

interface Facility {
  id: string
  name: string
  code?: string
}

interface StorageZone {
  id: string
  code: string
  name: string
  target_temp_c: number
  min_temp_c: number | null
  max_temp_c: number | null
  capacity_kg: number | null
  status: string
}

function ColdchainZonesContent() {
  const meta = useDashboardPageMeta({ title: 'Storage zones', description: 'Temperature zones per cold storage facility (ISO 22000)' })

  const searchParams = useSearchParams()
  const initialFacilityId = searchParams.get('facilityId') || ''
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [facilityId, setFacilityId] = useState(initialFacilityId)
  const [zones, setZones] = useState<StorageZone[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [targetTemp, setTargetTemp] = useState('-18')
  const [readingTemp, setReadingTemp] = useState('')
  const [recording, setRecording] = useState(false)

  const fetchFacilities = useCallback(async () => {
    const res = await authFetchJson<{
      success: boolean
      data?: { facilities: Record<string, unknown>[] }
    }>('/api/v2/storage?type=units&limit=100')
    if (res.success && res.data?.facilities) {
      const list = res.data.facilities.map((f) => ({
        id: f.id as string,
        name: (f.name as string) || '',
        code: f.code as string | undefined,
      }))
      setFacilities(list)
      const fromUrl = searchParams.get('facilityId')
      if (fromUrl && list.some((f) => f.id === fromUrl)) {
        setFacilityId(fromUrl)
      } else if (list.length > 0 && !facilityId) {
        setFacilityId(list[0].id)
      }
    }
  }, [facilityId, searchParams])

  const fetchZones = useCallback(async () => {
    if (!facilityId) return
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { zones: StorageZone[] }
      }>(`/api/v2/coldchain/zones?facilityId=${facilityId}&limit=100`)
      if (res.success && res.data?.zones) {
        setZones(res.data.zones)
      } else {
        setZones([])
      }
    } catch {
      setZones([])
      toast.error('Failed to load zones')
    } finally {
      setLoading(false)
    }
  }, [facilityId])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const handleCreateZone = async () => {
    if (!facilityId || !code.trim() || !name.trim()) {
      toast.error('Facility, code, and name are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/coldchain/zones',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId,
            code: code.trim(),
            name: name.trim(),
            targetTempC: Number(targetTemp),
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not create zone')
        return
      }
      toast.success('Zone created')
      setShowDialog(false)
      setCode('')
      setName('')
      await fetchZones()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecordReading = async (zoneId: string) => {
    const temp = Number(readingTemp)
    if (Number.isNaN(temp)) {
      toast.error('Enter a valid temperature')
      return
    }
    setRecording(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/coldchain/readings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zoneId,
            facilityId,
            readingC: temp,
            source: 'manual',
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not record reading')
        return
      }
      toast.success('Temperature recorded')
      setReadingTemp('')
    } catch {
      toast.error('Network error')
    } finally {
      setRecording(false)
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button className="gap-2" onClick={() => setShowDialog(true)} disabled={!facilityId}>
          <Plus className="w-4 h-4" />
          Add zone
        </Button></>}>
<Card>
        <CardHeader>
          <CardTitle>Facility</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={facilityId} onValueChange={setFacilityId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
          <CardDescription>Target temps and manual readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Code</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Target °C</th>
                  <th className="text-left py-3 px-4 font-medium">Range</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Reading</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono">{z.code}</td>
                    <td className="py-3 px-4">{z.name}</td>
                    <td className="py-3 px-4">{z.target_temp_c}°C</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {z.min_temp_c != null && z.max_temp_c != null
                        ? `${z.min_temp_c}–${z.max_temp_c}°C`
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={z.status === 'active' ? 'default' : 'secondary'}>{z.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20 h-8"
                          placeholder="°C"
                          value={readingTemp}
                          onChange={(e) => setReadingTemp(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={recording}
                          onClick={() => handleRecordReading(z.id)}
                        >
                          <Thermometer className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {zones.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No zones for this facility
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add storage zone</DialogTitle>
            <DialogDescription>HACCP-monitored temperature zone</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Z-A1" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target temperature (°C)</Label>
              <Input type="number" value={targetTemp} onChange={(e) => setTargetTemp(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateZone} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}


export default function ColdchainZonesPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
      <ColdchainZonesContent />
    </Suspense>
  )
}
