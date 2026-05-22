'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, UserCircle, Loader2, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'
import { LeadKanban } from '@/components/crm/lead-kanban'
import { ModulePageHeader } from '@/components/dashboard/module-page-header'
import { ListPageToolbar } from '@/components/dashboard/list-page-toolbar'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: string
  estimated_value: number
  created_at: string
}

const PIPELINE_STAGES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-amber-100 text-amber-800 border-amber-200',
  qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  won: 'bg-green-100 text-green-800 border-green-200',
  lost: 'bg-red-100 text-red-800 border-red-200',
}

export default function LeadsPage() {
  const meta = useDashboardPageMeta({
    description: 'Track sales pipeline and opportunities',
  })
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('')
  const [stage, setStage] = useState('new')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [view, setView] = useState<'board' | 'table'>('board')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v2/crm/leads?limit=100', { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data?.leads) {
        setLeads(data.data.leads)
      } else {
        setLeads([])
      }
    } catch {
      setLeads([])
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of PIPELINE_STAGES) counts[s] = 0
    for (const lead of leads) {
      counts[lead.stage] = (counts[lead.stage] ?? 0) + 1
    }
    return counts
  }, [leads])

  const pipelineValue = useMemo(() => {
    const openStages = ['new', 'contacted', 'qualified']
    return leads
      .filter((l) => openStages.includes(l.stage))
      .reduce((sum, l) => sum + Number(l.estimated_value), 0)
  }, [leads])

  const filteredLeads = useMemo(() => {
    let list = stageFilter ? leads.filter((l) => l.stage === stageFilter) : leads
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.email?.toLowerCase().includes(q) ?? false) ||
          (l.phone?.toLowerCase().includes(q) ?? false) ||
          (l.source?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  }, [leads, stageFilter, searchQuery])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/crm/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          source: source.trim() || null,
          stage,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : 0,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create lead')
        return
      }
      toast.success('Lead created')
      setShowDialog(false)
      setName('')
      setEmail('')
      setPhone('')
      setSource('')
      setStage('new')
      setEstimatedValue('')
      await fetchLeads()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const stageVariant = (s: string) => {
    if (s === 'won') return 'default'
    if (s === 'lost') return 'destructive'
    if (s === 'qualified') return 'secondary'
    return 'outline'
  }

  const stageLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const handleStageChange = async (leadId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/v2/crm/leads/${leadId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Could not move lead')
        return
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
      )
      toast.success(`Moved to ${stageLabel(newStage)}`)
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Button className="gap-2" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {PIPELINE_STAGES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStageFilter(stageFilter === s ? null : s)}
            className={`rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
              STAGE_COLORS[s]
            } ${stageFilter === s ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">{stageLabel(s)}</p>
            <p className="text-2xl font-bold mt-1">{stageCounts[s] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Pipeline value (open):{' '}
          <strong className="text-foreground">
            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(pipelineValue)}
          </strong>
        </span>
        {stageFilter && (
          <Button variant="ghost" size="sm" onClick={() => setStageFilter(null)}>
            Clear filter
          </Button>
        )}
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'board' | 'table')}>
        <ListPageToolbar
          searchValue={view === 'table' ? searchQuery : undefined}
          onSearchChange={view === 'table' ? setSearchQuery : undefined}
          searchPlaceholder="Search leads…"
          filters={
            stageFilter ? (
              <Button variant="ghost" size="sm" onClick={() => setStageFilter(null)}>
                Clear stage filter
              </Button>
            ) : undefined
          }
          views={
            <TabsList>
              <TabsTrigger value="board" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <List className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>
          }
        />

        <TabsContent value="board" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kanban pipeline</CardTitle>
              <CardDescription>Drag cards between stages to update</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading…
                </div>
              ) : leads.length === 0 ? (
                <EmptyState
                  icon={UserCircle}
                  title="No leads yet"
                  description="Add your first lead to start tracking the pipeline."
                  actionLabel="Add Lead"
                  onAction={() => setShowDialog(true)}
                />
              ) : (
                <LeadKanban
                  leads={leads}
                  stages={PIPELINE_STAGES}
                  stageLabel={stageLabel}
                  onStageChange={handleStageChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                All leads
                {stageFilter && <Badge variant="outline">{stageLabel(stageFilter)} only</Badge>}
              </CardTitle>
              <CardDescription>
                {loading ? 'Loading…' : `${filteredLeads.length} lead${filteredLeads.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading leads…
                </div>
              ) : filteredLeads.length === 0 ? (
                <EmptyState
                  icon={UserCircle}
                  title={searchQuery.trim() ? 'No matching leads' : 'No leads yet'}
                  description={
                    searchQuery.trim()
                      ? 'Try a different search or clear filters.'
                      : 'Add your first lead to start tracking the pipeline.'
                  }
                  actionLabel={searchQuery.trim() ? undefined : 'Add Lead'}
                  onAction={searchQuery.trim() ? undefined : () => setShowDialog(true)}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Est. Value</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell>{l.email || '—'}</TableCell>
                        <TableCell>{l.phone || '—'}</TableCell>
                        <TableCell>{l.source || '—'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={stageVariant(l.stage)}
                            className={STAGE_COLORS[l.stage]?.split(' ').slice(0, 2).join(' ')}
                          >
                            {stageLabel(l.stage)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                          }).format(Number(l.estimated_value))}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(l.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <DialogDescription>Capture a new sales opportunity</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Referral, web, event…"
                />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{stageLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estimated Value (KES)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
