'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { Checkbox } from '@/components/ui/checkbox'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { 
  ClipboardCheck, 
  Download, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Anchor, 
  Fish, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react'

interface TripOption {
  id: string
  boat_name: string
  departure_time: string
  status: string
}

interface CatchOption {
  id: string
  species_name: string
  quantity_kg: number
  trip_id: string
}

interface InspectionRow {
  id: string
  trip_id?: string
  catch_id?: string
  grade_assigned: 'A' | 'B' | 'C' | 'reject'
  freshness_score?: number
  parasite_check?: boolean
  temperature_c?: number
  notes?: string
  inspected_at: string
  inspector_name?: string
  boat_name?: string
  species_name?: string
  catch_qty?: number
}

export default function QualityInspectionPage() {
  const meta = useDashboardPageMeta({
    title: 'Landing quality inspection',
    description: 'EU grade A/B/C · reject spoiled catch before market',
  })

  const [inspections, setInspections] = useState<InspectionRow[]>([])
  const [trips, setTrips] = useState<TripOption[]>([])
  const [catches, setCatches] = useState<CatchOption[]>([])
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form State
  const [tripId, setTripId] = useState<string>('none')
  const [catchId, setCatchId] = useState<string>('none')
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'reject'>('A')
  const [freshness, setFreshness] = useState<string>('9')
  const [parasiteCheck, setParasiteCheck] = useState<boolean>(false)
  const [temperature, setTemperature] = useState<string>('2.5')
  const [notes, setNotes] = useState<string>('')

  // Load inspections, trips, and catches
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [inspRes, tripsRes, catchesRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { inspections: InspectionRow[] } }>('/api/v2/fishing-ops/quality'),
        authFetchJson<{ success: boolean; data?: { trips: TripOption[] } }>('/api/v2/trips?limit=50'),
        authFetchJson<{ success: boolean; data?: { items: CatchOption[] } }>('/api/v2/catches?limit=100'),
      ])
      
      if (inspRes.success && inspRes.data?.inspections) {
        setInspections(inspRes.data.inspections)
      }
      
      if (tripsRes.success && tripsRes.data?.trips) {
        setTrips(tripsRes.data.trips)
      }
      
      if (catchesRes.success && catchesRes.data?.items) {
        setCatches(catchesRes.data.items)
      }
    } catch {
      toast.error('Failed to load quality inspection data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter catches by selected trip
  const filteredCatches = catches.filter(c => tripId === 'none' || c.trip_id === tripId)

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/fishing-ops/quality', {
        method: 'POST',
        body: JSON.stringify({
          tripId: tripId === 'none' ? null : tripId,
          catchId: catchId === 'none' ? null : catchId,
          gradeAssigned: grade,
          freshnessScore: Number(freshness) || null,
          parasiteCheck,
          temperatureC: Number(temperature) || null,
          notes: notes.trim() || null,
        }),
      })
      if (res.success) {
        toast.success('Inspection report recorded successfully')
        // Reset form
        setTripId('none')
        setCatchId('none')
        setGrade('A')
        setFreshness('9')
        setParasiteCheck(false)
        setTemperature('2.5')
        setNotes('')
        loadData()
      } else {
        toast.error('Failed to record quality inspection')
      }
    } catch {
      toast.error('Failed to submit quality inspection')
    } finally {
      setSubmitting(false)
    }
  }

  // Stats calculations
  const totalInspections = inspections.length
  const rejectedCount = inspections.filter(i => i.grade_assigned === 'reject').length
  const passRate = totalInspections > 0 ? Math.round(((totalInspections - rejectedCount) / totalInspections) * 100) : 100
  const avgTemp = inspections.length > 0 
    ? Math.round(inspections.reduce((sum, i) => sum + (i.temperature_c ?? 0), 0) / inspections.length * 10) / 10
    : 0

  const getGradeBadge = (g: string) => {
    switch (g) {
      case 'A':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Grade A</Badge>
      case 'B':
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">Grade B</Badge>
      case 'C':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Grade C</Badge>
      case 'reject':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>
      default:
        return <Badge variant="outline">{g}</Badge>
    }
  }

  return (
    <DashboardPageLayout
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild disabled={inspections.length === 0}>
            <a href={`/api/v2/analytics/export?type=coldchain-compliance&format=csv`} download>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </a>
          </Button>
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Inspections Logged"
          value={totalInspections}
          icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Market Pass Rate"
          value={`${passRate}%`}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Rejected Lots"
          value={rejectedCount}
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          loading={loading}
        />
        <StatCard
          title="Avg Catch Temp"
          value={`${avgTemp}°C`}
          icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log Inspection</CardTitle>
            <CardDescription>Record quality parameters & grade landing lots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trip-selector">Associated Fishing Trip</Label>
              <Select value={tripId} onValueChange={(val) => {
                setTripId(val)
                setCatchId('none') // Reset catch when trip changes
              }}>
                <SelectTrigger id="trip-selector">
                  <SelectValue placeholder="Select trip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Independent Inspection (No Trip)</SelectItem>
                  {trips.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.boat_name} ({new Date(t.departure_time).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catch-selector">Specific Catch Lot</Label>
              <Select value={catchId} onValueChange={setCatchId} disabled={filteredCatches.length === 0}>
                <SelectTrigger id="catch-selector">
                  <SelectValue placeholder={filteredCatches.length === 0 ? "No catches on this trip" : "Select species lot"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Trip Assessment</SelectItem>
                  {filteredCatches.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.species_name} — {c.quantity_kg.toLocaleString()} kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="grade-selector">Assigned Grade</Label>
                <Select value={grade} onValueChange={(val) => setGrade(val as any)}>
                  <SelectTrigger id="grade-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A (Excellent)</SelectItem>
                    <SelectItem value="B">Grade B (Good)</SelectItem>
                    <SelectItem value="C">Grade C (Marginal)</SelectItem>
                    <SelectItem value="reject">Reject (Spoiled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freshness-score">Freshness (1-10)</Label>
                <Input 
                  id="freshness-score"
                  type="number"
                  min={1}
                  max={10}
                  value={freshness}
                  onChange={(e) => setFreshness(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="temp-input">Core Temp (°C)</Label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="temp-input"
                    type="number"
                    step="0.1"
                    className="pl-9"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <Checkbox 
                  id="parasite-check"
                  checked={parasiteCheck}
                  onCheckedChange={(checked) => setParasiteCheck(checked === true)}
                />
                <Label htmlFor="parasite-check" className="cursor-pointer">Parasites Checked</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspection-notes">Assessment Notes</Label>
              <Input 
                id="inspection-notes"
                placeholder="Visual attributes, gill color, odor description..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={submit} className="w-full gap-2 mt-2" disabled={submitting}>
              <ClipboardCheck className="h-4 w-4" />
              {submitting ? 'Recording...' : 'Record Inspection'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Inspections Log</CardTitle>
            <CardDescription>Official quality control checks recorded for catch landings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Date &amp; Inspector</th>
                    <th className="text-left py-3 px-4 font-medium">Origin Details</th>
                    <th className="text-center py-3 px-4 font-medium">Grade</th>
                    <th className="text-right py-3 px-4 font-medium">Params</th>
                    <th className="text-left py-3 px-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-xs">
                          {new Date(r.inspected_at).toLocaleDateString()} {new Date(r.inspected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.inspector_name || 'Inspector'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {r.boat_name ? (
                          <div className="font-medium text-xs flex items-center gap-1">
                            <Anchor className="h-3 w-3 text-slate-500" />
                            {r.boat_name}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {r.species_name && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Fish className="h-3 w-3 text-sky-500" />
                            {r.species_name} ({r.catch_qty} kg)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getGradeBadge(r.grade_assigned)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-xs font-mono">
                          {r.temperature_c !== null ? `${r.temperature_c}°C` : '—'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Freshness: {r.freshness_score}/10
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[150px] truncate">
                        {r.notes || 'No remarks.'}
                      </td>
                    </tr>
                  ))}
                  {inspections.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No quality inspections recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
