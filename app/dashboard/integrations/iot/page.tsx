'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { authFetchJson } from '@/lib/api'
import { Radio, RefreshCw, Cpu, Thermometer, MapPin, Scale } from 'lucide-react'
import { toast } from 'sonner'

interface IotEvent {
  id: string
  sensor_id: string | null
  device_id: string | null
  event_type: string
  facility_id: string | null
  zone_id: string | null
  processed: number
  created_at: string
}

export default function IntegrationsIotPage() {
  const meta = useDashboardPageMeta()

  const [events, setEvents] = useState<IotEvent[]>([])
  const [loading, setLoading] = useState(true)
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.example'

  const endpoints = [
    { label: 'Cold chain / door / power', path: '/api/v2/integrations/iot/ingest', icon: Thermometer },
    { label: 'Vessel GPS', path: '/api/v2/integrations/gps/ingest', icon: MapPin },
    { label: 'Scale weigh-in', path: '/api/v2/integrations/scale/ingest', icon: Scale },
  ]

  const fetchEvents = () => {
    setLoading(true)
    authFetchJson<{ success: boolean; data?: { events: IotEvent[] } }>(
      '/api/v2/integrations/iot/events?limit=30',
    )
      .then((res) => {
        if (res.success && res.data?.events) setEvents(res.data.events)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const testIngest = async () => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/integrations/iot/webhook',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'temperature_reading',
            temperatureC: -1.5,
            sensorId: 'dashboard-test',
          }),
        },
      )
      if (res.success) {
        toast.success('Test reading ingested (JWT path)')
        fetchEvents()
      } else {
        toast.error(res.error || 'Ingest failed')
      }
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchEvents}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={testIngest}>
            Test (JWT)
          </Button>
          <Button asChild>
            <Link href="/dashboard/integrations/devices" className="gap-2">
              <Cpu className="h-4 w-4" />
              Devices
            </Link>
          </Button>
        </div></>}>

      <div className="grid gap-4 md:grid-cols-3">
        {endpoints.map((ep) => {
          const Icon = ep.icon
          return (
            <Card key={ep.path}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {ep.label}
                </CardTitle>
                <CardDescription>POST with device key header</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                  {base}
                  {ep.path}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Header: <code>X-AquaERP-Device-Key</code>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway / MQTT bridge</CardTitle>
          <CardDescription>
            Set <code>IOT_GLOBAL_INGEST_SECRET</code> in .env and send{' '}
            <code>X-AquaERP-Ingest-Secret</code> + <code>X-Tenant-Id</code> from Node-RED, ThingsBoard,
            or AWS IoT rules.
          </CardDescription>
        </CardHeader>
      </Card>

      <DataTable
        title="Recent sensor events"
        description="Raw ingest log from iot_sensor_events"
        loading={loading}
        data={events}
        emptyMessage="No IoT events yet — register a device and POST telemetry"
        columns={[
          {
            key: 'created_at',
            header: 'Time',
            cell: (row) => new Date(row.created_at).toLocaleString(),
          },
          { key: 'event_type', header: 'Event' },
          { key: 'sensor_id', header: 'Sensor', cell: (row) => row.sensor_id || '—' },
          {
            key: 'processed',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.processed ? 'default' : 'secondary'}>
                {row.processed ? 'processed' : 'pending'}
              </Badge>
            ),
          },
        ]}
      />
    </DashboardPageLayout>
  )
}

