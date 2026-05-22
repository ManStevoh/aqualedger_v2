'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
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
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { Scale, Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Quota {
  id: string
  name: string
  species_name: string | null
  fishing_zone: string | null
  period_type: string
  period_start: string
  period_end: string
  quota_kg: number
  used_kg: number
  remaining_kg: number
  utilization_pct: number
  issuing_authority: string | null
  status: string
}

interface Species {
  id: string
  name: string
}

export default function CatchQuotasPage() {
  const [quotas, setQuotas] = useState<Quota[]>([])
  const [summary, setSummary] = useState({ active: 0, atRisk: 0, overLimit: 0, totalQuotaKg: 0, totalUsedKg: 0 })
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [zone, setZone] = useState('')
  const [periodType, setPeriodType] = useState('annual')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [quotaKg, setQuotaKg] = useState('')
  const [authority, setAuthority] = useState('Kenya Fisheries')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [qRes, sRes, spRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { quotas: Quota[]; summary?: typeof summary } }>(
          '/api/v2/fishing/quotas?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { summary: typeof summary } }>(
          '/api/v2/fishing/quotas?summary=1',
        ),
        authFetchJson<{ success: boolean; data?: { species: Species[] } }>('/api/v2/fish-species'),
      ])
      if (qRes.success && qRes.data?.quotas) setQuotas(qRes.data.quotas)
      if (sRes.success && sRes.data?.summary) setSummary(sRes.data.summary)
      if (spRes.success && spRes.data?.species) setSpecies(spRes.data.species)
    } catch {
      toast.error('Failed to load quotas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!name.trim() || !periodStart || !periodEnd || !quotaKg) {
      toast.error('Fill required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/fishing/quotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          speciesId: speciesId || null,
          fishingZone: zone.trim() || null,
          periodType,
          periodStart,
          periodEnd,
          quotaKg: parseFloat(quotaKg),
          issuingAuthority: authority.trim() || null,
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Create failed')
        return
      }
      toast.success('Quota registered')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catch quotas</h1>
          <p className="text-muted-foreground">
            Regulatory allocations vs logged landings — avoid overfishing penalties
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Register quota
        </Button>
      </div>

      <StatCardGrid>
        <StatCard title="Active quotas" value={summary.active} icon={<Scale className="h-4 w-4" />} loading={loading} />
        <StatCard title="At risk (≥85%)" value={summary.atRisk} icon={<AlertTriangle className="h-4 w-4" />} loading={loading} />
        <StatCard title="Over limit" value={summary.overLimit} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} loading={loading} />
        <StatCard title="Used / quota (kg)" value={`${fmt(summary.totalUsedKg)} / ${fmt(summary.totalQuotaKg)}`} loading={loading} />
      </StatCardGrid>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-muted-foreground col-span-2">Loading…</p>
        ) : quotas.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              No quotas — register your EEZ or species allocations
            </CardContent>
          </Card>
        ) : (
          quotas.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{q.name}</CardTitle>
                  <Badge variant={q.utilization_pct >= 100 ? 'destructive' : q.utilization_pct >= 85 ? 'secondary' : 'outline'}>
                    {q.utilization_pct}%
                  </Badge>
                </div>
                <CardDescription>
                  {q.species_name || 'All species'}
                  {q.fishing_zone ? ` · ${q.fishing_zone}` : ''}
                  <br />
                  {q.period_start} → {q.period_end} ({q.period_type})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={Math.min(q.utilization_pct, 100)} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>{fmt(q.used_kg)} kg used</span>
                  <span>{fmt(q.remaining_kg)} kg left</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Limit {fmt(q.quota_kg)} kg · {q.issuing_authority || 'Authority N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Register catch quota</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuna Indian Ocean 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Species</Label>
                <Select value={speciesId || 'all'} onValueChange={(v) => setSpeciesId(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="All species" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All species</SelectItem>
                    {species.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zone</Label>
                <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="EEZ Zone A" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quota (kg)</Label>
                <Input type="number" min="1" value={quotaKg} onChange={(e) => setQuotaKg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Authority</Label>
                <Input value={authority} onChange={(e) => setAuthority(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Saving…' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
