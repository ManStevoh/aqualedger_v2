'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/dashboard/data-table'
import { authFetchJson } from '@/lib/api'
import { Cpu, Plus, RefreshCw, ArrowLeft, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface IotDevice {
  id: string
  device_key: string
  name: string
  device_type: string
  external_id: string | null
  facility_id: string | null
  zone_id: string | null
  boat_id: string | null
  status: string
  last_seen_at: string | null
  created_at: string
}

const DEVICE_TYPES = [
  { value: 'temperature_probe', label: 'Temperature probe' },
  { value: 'humidity_sensor', label: 'Humidity sensor' },
  { value: 'door_sensor', label: 'Door sensor' },
  { value: 'scale', label: 'Scale' },
  { value: 'gps_tracker', label: 'GPS tracker' },
  { value: 'gateway', label: 'Gateway / MQTT' },
  { value: 'barcode_scanner', label: 'Barcode scanner' },
  { value: 'other', label: 'Other' },
]

export default function IotDevicesPage() {
  const [devices, setDevices] = useState<IotDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [deviceType, setDeviceType] = useState('temperature_probe')
  const [externalId, setExternalId] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchDevices = () => {
    setLoading(true)
    authFetchJson<{ success: boolean; data?: { devices: IotDevice[] } }>(
      '/api/v2/integrations/devices',
    )
      .then((res) => {
        if (res.success && res.data?.devices) setDevices(res.data.devices)
      })
      .catch(() => setDevices([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Name required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { device: IotDevice & { ingestKey?: string } }
        error?: string
      }>('/api/v2/integrations/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          deviceType,
          externalId: externalId.trim() || undefined,
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Create failed')
        return
      }
      const key = res.data?.device?.ingestKey
      if (key) setNewKey(key)
      toast.success('Device registered')
      setName('')
      setExternalId('')
      fetchDevices()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Ingest key copied')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/integrations/iot"
            className="text-sm text-muted-foreground flex items-center gap-1 mb-2 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            IoT hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="h-8 w-8" />
            Device registry
          </h1>
          <p className="text-muted-foreground">
            Register probes, scales, GPS units — each gets a unique ingest key
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchDevices}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={() => { setNewKey(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" />
            Register device
          </Button>
        </div>
      </div>

      <DataTable
        title="Registered devices"
        loading={loading}
        data={devices}
        emptyMessage="No devices — register your first sensor or scale"
        columns={[
          { key: 'name', header: 'Name' },
          {
            key: 'device_type',
            header: 'Type',
            cell: (row) => (
              <Badge variant="outline">
                {DEVICE_TYPES.find((t) => t.value === row.device_type)?.label ?? row.device_type}
              </Badge>
            ),
          },
          { key: 'device_key', header: 'Key prefix', cell: (row) => <code className="text-xs">{row.device_key}…</code> },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge>,
          },
          {
            key: 'last_seen_at',
            header: 'Last seen',
            cell: (row) =>
              row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : 'Never',
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register hardware device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cold room A probe 1" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>External ID (optional)</Label>
              <Input
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Manufacturer serial / MQTT client id"
              />
            </div>
            {newKey && (
              <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 space-y-2">
                <p className="text-sm font-medium">Copy ingest key now — shown once</p>
                <code className="text-xs break-all block">{newKey}</code>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => copyKey(newKey)}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
