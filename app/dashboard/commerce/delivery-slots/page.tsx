'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function DeliverySlotsPage() {
  const [slots, setSlots] = useState<Record<string, unknown>[]>([])
  const [date, setDate] = useState('')
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('12:00')

  const load = () => {
    authFetchJson<{ success: boolean; data?: { slots: Record<string, unknown>[] } }>(
      '/api/v2/commerce/delivery-slots',
    ).then((res) => {
      if (res.success && res.data?.slots) setSlots(res.data.slots)
    })
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    await authFetchJson('/api/v2/commerce/delivery-slots', {
      method: 'POST',
      body: JSON.stringify({ slotDate: date, startTime: start, endTime: end, coldChain: true }),
    })
    toast.success('Slot created')
    load()
  }

  return (
    <div className="space-y-8">
      <DashboardPageLayout
      title="Delivery scheduling"
      description="Cold-chain slots for storefront checkout"
    >
            <Card>
        <CardHeader><CardTitle>Add slot</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Start</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><Label>End</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <Button onClick={create}>Create</Button>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {slots.map((s) => (
          <Card key={String(s.id)}>
            <CardContent className="pt-4 flex justify-between">
              <div>
                <p className="font-medium">{String(s.slot_date)} {String(s.start_time).slice(0, 5)}–{String(s.end_time).slice(0, 5)}</p>
                <p className="text-sm text-muted-foreground">{Number(s.booked_count)}/{Number(s.max_orders)} booked</p>
              </div>
              <Badge>{String(s.status)}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardPageLayout>
  )
}