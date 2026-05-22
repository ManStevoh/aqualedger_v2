'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { ClipboardCheck, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Facility {
  id: string
  name: string
}

interface HaccpChecklist {
  id: string
  facility_id: string | null
  checklist_date: string
  inspector_name: string | null
  overall_pass: number | boolean
  corrective_actions: string | null
  created_at: string
}

const DEFAULT_ITEMS = [
  { point: 'Receiving temperature', pass: true },
  { point: 'Storage calibration', pass: true },
  { point: 'Pest control', pass: true },
  { point: 'Sanitation log', pass: true },
]

export default function HaccpPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [checklists, setChecklists] = useState<HaccpChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [facilityId, setFacilityId] = useState('')
  const [checklistDate, setChecklistDate] = useState(new Date().toISOString().slice(0, 10))
  const [inspectorName, setInspectorName] = useState('')
  const [correctiveActions, setCorrectiveActions] = useState('')
  const [overallPass, setOverallPass] = useState(true)

  const fetchFacilities = useCallback(async () => {
    const res = await authFetchJson<{
      success: boolean
      data?: { facilities: Record<string, unknown>[] }
    }>('/api/v2/storage?type=units&limit=100')
    if (res.success && res.data?.facilities) {
      setFacilities(
        res.data.facilities.map((f) => ({
          id: f.id as string,
          name: (f.name as string) || '',
        })),
      )
    }
  }, [])

  const fetchChecklists = useCallback(async () => {
    setLoading(true)
    try {
      const q = facilityId ? `?facilityId=${facilityId}&limit=50` : '?limit=50'
      const res = await authFetchJson<{
        success: boolean
        data?: { checklists: HaccpChecklist[] }
      }>(`/api/v2/coldchain/haccp${q}`)
      if (res.success && res.data?.checklists) {
        setChecklists(res.data.checklists)
      } else {
        setChecklists([])
      }
    } catch {
      setChecklists([])
      toast.error('Failed to load checklists')
    } finally {
      setLoading(false)
    }
  }, [facilityId])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  useEffect(() => {
    fetchChecklists()
  }, [fetchChecklists])

  const handleCreate = async () => {
    if (!checklistDate) {
      toast.error('Checklist date is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/coldchain/haccp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId: facilityId || undefined,
            checklistDate,
            inspectorName: inspectorName.trim() || undefined,
            items: DEFAULT_ITEMS,
            overallPass,
            correctiveActions: correctiveActions.trim() || undefined,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not save checklist')
        return
      }
      toast.success('HACCP checklist saved')
      setShowDialog(false)
      await fetchChecklists()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const passed = checklists.filter((c) => c.overall_pass).length

  return (
    <DashboardPageLayout
      title="HACCP checklists"
      description="Codex Alimentarius daily food-safety inspections"
    >
      <div className="flex gap-4 items-end">
        <div className="space-y-2 max-w-xs">
          <Label>Filter by facility</Label>
          <Select value={facilityId || 'all'} onValueChange={(v) => setFacilityId(v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All facilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All facilities</SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground pb-2">
          <ClipboardCheck className="inline h-4 w-4 mr-1" />
          {passed} / {checklists.length} passed
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspection history</CardTitle>
          <CardDescription>ISO 22000 compliance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Inspector</th>
                  <th className="text-left py-3 px-4 font-medium">Result</th>
                  <th className="text-left py-3 px-4 font-medium">Corrective actions</th>
                </tr>
              </thead>
              <tbody>
                {checklists.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{String(c.checklist_date).slice(0, 10)}</td>
                    <td className="py-3 px-4">{c.inspector_name || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.overall_pass ? 'default' : 'destructive'}>
                        {c.overall_pass ? 'Pass' : 'Fail'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {c.corrective_actions || '—'}
                    </td>
                  </tr>
                ))}
                {checklists.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No checklists yet
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
            <DialogTitle>Daily HACCP checklist</DialogTitle>
            <DialogDescription>Standard control points (receiving, storage, sanitation, pests)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Facility (optional)</Label>
              <Select value={facilityId || 'none'} onValueChange={(v) => setFacilityId(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={checklistDate} onChange={(e) => setChecklistDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Inspector</Label>
              <Input value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="overallPass"
                checked={overallPass}
                onChange={(e) => setOverallPass(e.target.checked)}
              />
              <Label htmlFor="overallPass">Overall pass</Label>
            </div>
            <div className="space-y-2">
              <Label>Corrective actions</Label>
              <Textarea value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
