'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
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
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { urlInputPlaceholder } from '@/lib/config/urls'
import {
  Plug,
  RefreshCw,
  Webhook,
  Plus,
  Trash2,
  Smartphone,
  CreditCard,
  MessageSquare,
  Thermometer,
  Link2,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface IntegrationConnection {
  id: string
  provider: string
  name: string
  status: string
  last_sync_at: string | null
  created_at: string
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: string
  created_at: string
}

const providerLabels: Record<string, string> = {
  mpesa: 'M-Pesa',
  stripe: 'Stripe',
  sms: 'SMS gateway',
  whatsapp: 'WhatsApp',
  iot_coldchain: 'IoT cold chain',
  custom: 'Custom API',
}

const EVENT_OPTIONS = [
  'order.created',
  'order.updated',
  'catch.logged',
  'temp.alert',
  'leave.approved',
]

const PROVIDER_CARDS = [
  {
    provider: 'mpesa' as const,
    title: 'M-Pesa',
    description: 'STK push deposits and marketplace checkout via Safaricom Daraja',
    icon: Smartphone,
  },
  {
    provider: 'stripe' as const,
    title: 'Stripe',
    description: 'Card payments for export buyers and subscription billing',
    icon: CreditCard,
  },
  {
    provider: 'sms' as const,
    title: 'SMS',
    description: 'Trip alerts, cold-chain warnings, and OTP delivery',
    icon: MessageSquare,
  },
  {
    provider: 'iot_coldchain' as const,
    title: 'IoT Cold Chain',
    description: 'Temperature probes and door sensors at storage facilities',
    icon: Thermometer,
  },
]

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<IntegrationConnection[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [webhookDialog, setWebhookDialog] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['order.created'])
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [providerBusy, setProviderBusy] = useState<string | null>(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      authFetchJson<{ success: boolean; data?: { connections: IntegrationConnection[] } }>(
        '/api/v2/integrations',
      ),
      authFetchJson<{ success: boolean; data?: { webhooks: WebhookEndpoint[] } }>(
        '/api/v2/integrations/webhooks',
      ),
    ])
      .then(([connRes, whRes]) => {
        if (connRes.success && connRes.data?.connections) setConnections(connRes.data.connections)
        if (whRes.success && whRes.data?.webhooks) setWebhooks(whRes.data.webhooks)
      })
      .catch(() => {
        setConnections([])
        setWebhooks([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const active = connections.filter((c) => c.status === 'active').length

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    )
  }

  const handleCreateWebhook = async () => {
    if (!webhookUrl.trim() || selectedEvents.length === 0) {
      toast.error('URL and at least one event required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { webhook: WebhookEndpoint & { secret?: string } }
        error?: string
      }>('/api/v2/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl.trim(), events: selectedEvents }),
      })
      if (!res.success) {
        toast.error(res.error || 'Could not create webhook')
        return
      }
      if (res.data?.webhook?.secret) setCreatedSecret(res.data.webhook.secret)
      toast.success('Webhook created')
      setWebhookUrl('')
      fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/integrations/webhooks?id=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Delete failed')
        return
      }
      toast.success('Webhook removed')
      fetchAll()
    } catch {
      toast.error('Network error')
    }
  }

  const connectionFor = (provider: string) =>
    connections.find((c) => c.provider === provider)

  const handleProviderAction = async (
    provider: (typeof PROVIDER_CARDS)[number]['provider'],
    action: 'connect' | 'test',
  ) => {
    setProviderBusy(`${provider}-${action}`)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: {
          connection?: IntegrationConnection
          ok?: boolean
          message?: string
          latency_ms?: number
        }
        error?: string
      }>('/api/v2/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, provider }),
      })
      if (!res.success) {
        toast.error(res.error || 'Action failed')
        return
      }
      if (action === 'connect') {
        toast.success(`${providerLabels[provider]} connected`)
      } else if (res.data?.ok) {
        toast.success(res.data.message || 'Test passed', {
          description: res.data.latency_ms ? `${res.data.latency_ms}ms` : undefined,
        })
      } else {
        toast.error(res.data?.message || 'Test failed — connect first')
      }
      fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setProviderBusy(null)
    }
  }

  return (
    <DashboardPageLayout
      title="Integrations"
      description="Connections and outbound webhook endpoints"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Hardware & IoT
            </CardTitle>
            <CardDescription>
              Device registry, cold-chain ingest, GPS telemetry, and scales (see docs/HARDWARE_IOT.md)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href="/dashboard/integrations/iot">IoT hub</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/dashboard/integrations/devices">Device registry</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <StatCardGrid>
        <StatCard
          title="Connections"
          value={connections.length}
          loading={loading}
          icon={<Plug className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active"
          value={active}
          loading={loading}
          icon={<Plug className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Webhooks"
          value={webhooks.length}
          loading={loading}
          icon={<Webhook className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Providers"
          value={new Set(connections.map((c) => c.provider)).size}
          loading={loading}
          icon={<Plug className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <div>
        <h2 className="text-xl font-semibold mb-1">Provider connections</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Connect payment, messaging, and IoT providers — then run a sandbox test
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {PROVIDER_CARDS.map((card) => {
            const Icon = card.icon
            const conn = connectionFor(card.provider)
            const isActive = conn?.status === 'active'
            return (
              <Card key={card.provider}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {card.title}
                    </CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {conn?.status ?? 'not connected'}
                  </Badge>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1"
                    disabled={providerBusy !== null}
                    onClick={() => handleProviderAction(card.provider, 'connect')}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {providerBusy === `${card.provider}-connect` ? 'Connecting…' : 'Connect'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={providerBusy !== null || !isActive}
                    onClick={() => handleProviderAction(card.provider, 'test')}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {providerBusy === `${card.provider}-test` ? 'Testing…' : 'Test'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <DataTable
        title="Integration connections"
        description="Provider registry from integration_connections"
        loading={loading}
        data={connections}
        emptyMessage="No integrations configured yet"
        columns={[
          {
            key: 'provider',
            header: 'Provider',
            cell: (row) => providerLabels[row.provider] ?? row.provider,
          },
          { key: 'name', header: 'Name' },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge
                variant={
                  row.status === 'active'
                    ? 'default'
                    : row.status === 'error'
                      ? 'destructive'
                      : 'secondary'
                }>
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'last_sync_at',
            header: 'Last sync',
            cell: (row) =>
              row.last_sync_at ? new Date(row.last_sync_at).toLocaleString() : 'Never',
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Webhook endpoints</h2>
          <p className="text-sm text-muted-foreground">CRUD for webhook_endpoints table</p>
        </div>
        <Button className="gap-2" onClick={() => { setCreatedSecret(null); setWebhookDialog(true) }}>
          <Plus className="h-4 w-4" />
          Add webhook
        </Button>
      </div>

      <DataTable
        title="Registered webhooks"
        loading={loading}
        data={webhooks}
        emptyMessage="No webhooks configured"
        columns={[
          { key: 'url', header: 'URL', cell: (row) => <span className="font-mono text-xs">{row.url}</span> },
          {
            key: 'events',
            header: 'Events',
            cell: (row) => (
              <div className="flex flex-wrap gap-1">
                {(row.events || []).map((e) => (
                  <Badge key={e} variant="outline">
                    {e}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            cell: (row) => (
              <Button size="sm" variant="ghost" onClick={() => handleDeleteWebhook(row.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={webhookDialog} onOpenChange={setWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add webhook endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={urlInputPlaceholder('webhook')}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2">
                {EVENT_OPTIONS.map((ev) => (
                  <Button
                    key={ev}
                    type="button"
                    size="sm"
                    variant={selectedEvents.includes(ev) ? 'default' : 'outline'}
                    onClick={() => toggleEvent(ev)}
                  >
                    {ev}
                  </Button>
                ))}
              </div>
            </div>
            {createdSecret && (
              <div className="rounded-md bg-muted p-3 text-xs font-mono break-all">
                Signing secret (copy now): {createdSecret}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookDialog(false)}>
              Close
            </Button>
            <Button onClick={handleCreateWebhook} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
