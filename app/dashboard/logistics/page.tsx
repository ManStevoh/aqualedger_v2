'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { StatCard } from '@/components/dashboard/stat-card'
import { Truck, Package, CheckCircle, Clock, Plus, History } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { urlInputPlaceholder } from '@/lib/config/urls'
import { toast } from 'sonner'

interface Delivery {
  id: string
  tracking_code: string
  status: string
  delivery_address: string
  pickup_address: string | null
  scheduled_at: string | null
  created_at: string
}

interface DeliveryEvent {
  id: string
  status: string
  location: string | null
  notes: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  'pending',
  'assigned',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
] as const

export default function LogisticsPage() {
  const meta = useDashboardPageMeta()

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Delivery | null>(null)
  const [events, setEvents] = useState<DeliveryEvent[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [newStatus, setNewStatus] = useState<string>('in_transit')
  const [location, setLocation] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [proofNotes, setProofNotes] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { deliveries: Delivery[] }
      }>('/api/v2/logistics/deliveries?limit=100')
      if (data.success && data.data?.deliveries) {
        setDeliveries(data.data.deliveries)
      }
    } catch {
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (delivery: Delivery) => {
    setSelected(delivery)
    setNewStatus(delivery.status)
    setLocation('')
    setProofUrl('')
    setProofNotes('')
    setProofFile(null)
    setDetailOpen(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { events: DeliveryEvent[] }
      }>(`/api/v2/logistics/deliveries/${delivery.id}`)
      if (res.success && res.data?.events) {
        setEvents(res.data.events)
      } else {
        setEvents([])
      }
    } catch {
      setEvents([])
    }
  }

  const handleCreate = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Delivery address is required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/logistics/deliveries',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deliveryAddress: deliveryAddress.trim(),
            pickupAddress: pickupAddress.trim() || undefined,
            scheduledAt: scheduledAt || undefined,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create delivery')
        return
      }
      toast.success('Delivery created')
      setAddOpen(false)
      setDeliveryAddress('')
      setPickupAddress('')
      setScheduledAt('')
      await fetchDeliveries()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      let proofUpload: { fileName: string; mimeType?: string; dataUrl?: string } | undefined
      if (proofFile) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = reject
          reader.readAsDataURL(proofFile)
        })
        proofUpload = {
          fileName: proofFile.name,
          mimeType: proofFile.type,
          dataUrl,
        }
      }

      const result = await authFetchJson<{
        success: boolean
        data?: { delivery: Delivery; events: DeliveryEvent[] }
        error?: string
      }>(`/api/v2/logistics/deliveries/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          location: location.trim() || undefined,
          proofUrl: proofUrl.trim() || undefined,
          proofNotes: proofNotes.trim() || undefined,
          proofUpload,
        }),
      })
      if (!result.success) {
        toast.error(result.error || 'Could not update status')
        return
      }
      toast.success('Status updated')
      if (result.data?.delivery) {
        setSelected(result.data.delivery)
      }
      if (result.data?.events) {
        setEvents(result.data.events)
      }
      await fetchDeliveries()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const pending = deliveries.filter((d) => d.status === 'pending').length
  const inTransit = deliveries.filter((d) => d.status === 'in_transit' || d.status === 'assigned').length
  const delivered = deliveries.filter((d) => d.status === 'delivered').length

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'in_transit':
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          New Delivery
        </Button></>}>
<div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={deliveries.length} icon={<Truck className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Pending" value={pending} icon={<Clock className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="In Transit" value={inTransit} icon={<Package className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Delivered" value={delivered} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
          <CardDescription>Click a row to update status and view event timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tracking</th>
                  <th className="text-left py-3 px-4 font-medium">Pickup</th>
                  <th className="text-left py-3 px-4 font-medium">Delivery</th>
                  <th className="text-left py-3 px-4 font-medium">Scheduled</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => openDetail(d)}
                  >
                    <td className="py-3 px-4 font-mono font-medium">{d.tracking_code}</td>
                    <td className="py-3 px-4 text-muted-foreground">{d.pickup_address || '—'}</td>
                    <td className="py-3 px-4">{d.delivery_address}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {d.scheduled_at ? String(d.scheduled_at).slice(0, 16).replace('T', ' ') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusColor(d.status)}>
                        {d.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {deliveries.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No deliveries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New delivery</DialogTitle>
            <DialogDescription>Creates a pending delivery with auto-generated tracking code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Pickup address</Label>
              <Input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Delivery address</Label>
              <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Scheduled (optional)</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.tracking_code}</DialogTitle>
            <DialogDescription>Update status — each change is recorded in the event timeline</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="GPS or address" />
              </div>
              <div className="space-y-2">
                <Label>Proof URL (optional)</Label>
                <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder={urlInputPlaceholder('https')} />
              </div>
              <div className="space-y-2">
                <Label>Proof upload (optional)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Proof notes (optional)</Label>
                <Input value={proofNotes} onChange={(e) => setProofNotes(e.target.value)} placeholder="Recipient name, signature ref…" />
              </div>
              <Button onClick={handleStatusUpdate} disabled={submitting} className="w-full">
                {submitting ? 'Updating…' : 'Update status'}
              </Button>

              <div className="border-t pt-4">
                <p className="font-medium flex items-center gap-2 mb-3">
                  <History className="h-4 w-4" />
                  Event timeline
                </p>
                <ul className="space-y-2 max-h-48 overflow-y-auto text-sm">
                  {events.map((ev) => (
                    <li key={ev.id} className="rounded-md border p-2">
                      <div className="flex justify-between">
                        <Badge className={statusColor(ev.status)}>{ev.status.replace('_', ' ')}</Badge>
                        <span className="text-muted-foreground text-xs">
                          {String(ev.created_at).slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                      {ev.location && <p className="text-muted-foreground mt-1">{ev.location}</p>}
                      {ev.notes && <p className="text-xs mt-1">{ev.notes}</p>}
                    </li>
                  ))}
                  {events.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No events yet</p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

