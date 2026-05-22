'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { authFetchJson } from '@/lib/api'
import { GitBranch, Play, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface WorkflowRule {
  id: string
  name: string
  trigger_event: string
  actions: string | unknown[]
  active: number
  created_at: string
}

export default function WorkflowsSettingsPage() {
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [triggerEvent, setTriggerEvent] = useState('')
  const [actionsJson, setActionsJson] = useState(
    '[{"type":"notification","channel":"in_app"}]',
  )

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { rules: WorkflowRule[] } }>(
        '/api/v2/workflows/rules',
      )
      if (res.success && res.data?.rules) setRules(res.data.rules)
    } catch {
      toast.error('Failed to load workflow rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const processPending = async () => {
    setProcessing(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { processed: number }; error?: string }>(
        '/api/v2/workflows/process',
        { method: 'POST' },
      )
      if (res.success) {
        toast.success(`Processed ${res.data?.processed ?? 0} events`)
      } else {
        toast.error(res.error || 'Process failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setProcessing(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || !triggerEvent.trim()) {
      toast.error('Name and trigger event are required')
      return
    }
    let actions: Record<string, unknown>[]
    try {
      actions = JSON.parse(actionsJson)
      if (!Array.isArray(actions)) throw new Error('Actions must be an array')
    } catch {
      toast.error('Invalid actions JSON')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/workflows/rules',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, triggerEvent, actions }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not create rule')
        return
      }
      toast.success('Workflow rule created')
      setDialogOpen(false)
      setName('')
      setTriggerEvent('')
      await fetchRules()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Workflow automation"
      description="Domain event rules and notification actions"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Active rules
          </CardTitle>
          <CardDescription>
            Triggered by domain events (e.g. commerce.order.confirmed, coldchain.temperature.critical)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No workflow rules configured</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{rule.trigger_event}</p>
                  </div>
                  <Badge variant={rule.active ? 'default' : 'secondary'}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New workflow rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Trigger event</Label>
              <Input
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value)}
                placeholder="commerce.order.confirmed"
              />
            </div>
            <div className="space-y-2">
              <Label>Actions (JSON array)</Label>
              <Textarea
                value={actionsJson}
                onChange={(e) => setActionsJson(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
