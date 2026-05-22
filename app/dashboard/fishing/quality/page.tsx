'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function QualityInspectionPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [tripId, setTripId] = useState('')
  const [catchId, setCatchId] = useState('')
  const [grade, setGrade] = useState('A')

  const load = () => {
    authFetchJson<{ success: boolean; data?: { inspections: Record<string, unknown>[] } }>(
      '/api/v2/fishing-ops/quality',
    ).then((res) => {
      if (res.success && res.data?.inspections) setRows(res.data.inspections)
    })
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    const res = await authFetchJson<{ success: boolean }>('/api/v2/fishing-ops/quality', {
      method: 'POST',
      body: JSON.stringify({ tripId: tripId || null, catchId: catchId || null, gradeAssigned: grade }),
    })
    if (res.success) {
      toast.success('Inspection recorded')
      load()
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Landing quality inspection</h1>
      <p className="text-muted-foreground">EU grade A/B/C · reject spoiled catch before market</p>
      <Card>
        <CardHeader><CardTitle>New inspection</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Trip ID</Label><Input value={tripId} onChange={(e) => setTripId(e.target.value)} /></div>
          <div><Label>Catch ID</Label><Input value={catchId} onChange={(e) => setCatchId(e.target.value)} /></div>
          <div>
            <Label>Grade</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end"><Button onClick={submit}>Record</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent inspections</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {rows.map((r) => (
            <div key={String(r.id)} className="border-b py-2">
              Grade {String(r.grade_assigned)} · trip {String(r.trip_id || '—').slice(0, 8)} · {String(r.inspected_at).slice(0, 16)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
