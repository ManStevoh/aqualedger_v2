'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect, useCallback } from 'react'
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
import { DataTableShell } from '@/components/dashboard/data-table-shell'
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
import { Plus, Megaphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Campaign {
  id: string
  name: string
  channel: string
  status: string
  subject: string | null
  scheduled_at: string | null
  created_at: string
}

const CHANNELS = ['email', 'sms', 'whatsapp', 'in_app'] as const
const STATUSES = ['draft', 'scheduled', 'sent', 'cancelled'] as const

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<string>('email')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (channelFilter !== 'all') params.set('channel', channelFilter)
      const res = await fetch(`/api/v2/crm/campaigns?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data?.campaigns) {
        setCampaigns(data.data.campaigns)
      } else {
        setCampaigns([])
      }
    } catch {
      setCampaigns([])
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, channelFilter])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Campaign name is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/crm/campaigns', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          channel,
          subject: subject.trim() || null,
          body: body.trim() || null,
          scheduledAt: scheduledAt || null,
          status: scheduledAt ? 'scheduled' : 'draft',
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create campaign')
        return
      }
      toast.success('Campaign created')
      setShowDialog(false)
      setName('')
      setSubject('')
      setBody('')
      setScheduledAt('')
      await fetchCampaigns()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'sent') return 'default'
    if (s === 'scheduled') return 'secondary'
    if (s === 'cancelled') return 'destructive'
    return 'outline'
  }

  return (
    <DashboardPageLayout
      title="CRM Campaigns"
      description="Email, SMS, WhatsApp, and in-app outreach"
      actions={
        <Button className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="filter-control">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="filter-control">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaigns
          </CardTitle>
          <CardDescription>
            {loading ? 'Loading…' : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading campaigns…
            </div>
          ) : campaigns.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No campaigns yet</p>
          ) : (
            <DataTableShell label="CRM campaigns">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline">{c.channel}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{c.subject || '—'}</TableCell>
                    <TableCell><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell>
                      {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </DataTableShell>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
            <DialogDescription>Create a draft or scheduled outreach campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Input value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
