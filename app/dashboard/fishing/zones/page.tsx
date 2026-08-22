'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { ExportCsvButton } from '@/components/dashboard/export-csv-button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { MapPin, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface FishingZone {
  id: string
  code: string
  name: string
  fao_area: string | null
  county: string | null
  status: string
}

export default function FishingZonesPage() {
  const [zones, setZones] = useState<FishingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [faoArea, setFaoArea] = useState('')
  const [county, setCounty] = useState('')
  const [status, setStatus] = useState('open')

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await authFetchJson<{
        success: boolean
        data?: { zones: FishingZone[] }
      }>(`/api/v2/fishing-ops/zones?${params}`)
      setZones(res.success && res.data?.zones ? res.data.zones : [])
    } catch {
      setZones([])
      toast.error('Failed to load fishing zones')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const handleCreate = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error('Code and name are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/fishing-ops/zones',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim(),
            name: name.trim(),
            faoArea: faoArea.trim() || null,
            county: county.trim() || null,
            status,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not create zone')
        return
      }
      toast.success('Fishing zone created')
      setShowDialog(false)
      setCode('')
      setName('')
      setFaoArea('')
      setCounty('')
      await fetchZones()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Fishing Zones"
      description="Manage tenant fishing areas, FAO codes, and access status"
      actions={
        <Button className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Fishing Zone
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zone registry
          </CardTitle>
          <CardDescription>Tenant-scoped from `fishing_zones`</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="filter-control">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <ExportCsvButton
              data={zones.map((z) => ({
                code: z.code,
                name: z.name,
                fao_area: z.fao_area ?? '',
                county: z.county ?? '',
                status: z.status,
              }))}
              filename="fishing-zones"
              columns={[
                { key: 'code', label: 'Code' },
                { key: 'name', label: 'Name' },
                { key: 'fao_area', label: 'FAO Area' },
                { key: 'county', label: 'County' },
                { key: 'status', label: 'Status' },
              ]}
            />
          </div>

          <DataTable
            loading={loading}
            data={zones}
            emptyMessage="No fishing zones yet"
            columns={[
              { key: 'code', header: 'Code' },
              { key: 'name', header: 'Name' },
              { key: 'fao_area', header: 'FAO', cell: (z) => z.fao_area || '—' },
              { key: 'county', header: 'County', cell: (z) => z.county || '—' },
              {
                key: 'status',
                header: 'Status',
                cell: (z) => (
                  <StatusBadge status={z.status} />
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New fishing zone</DialogTitle>
            <DialogDescription>Register a harvest or fishing area for trip planning</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MBA-DEEP" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>FAO area</Label>
                <Input value={faoArea} onChange={(e) => setFaoArea(e.target.value)} placeholder="51" />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Mombasa" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save zone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
