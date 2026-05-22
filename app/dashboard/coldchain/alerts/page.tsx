'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { AlertTriangle, Bell, Thermometer } from 'lucide-react'

interface ColdchainAlert {
  id: string
  alert_type: string
  severity: string
  message: string
  reading_value: number | null
  resolved: number | boolean
  facility_name?: string | null
  created_at: string
}

export default function ColdchainAlertsPage() {
  const [alerts, setAlerts] = useState<ColdchainAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetchJson<{
      success: boolean
      data?: { alerts: ColdchainAlert[] }
    }>('/api/v2/coldchain/alerts?limit=100&resolved=false')
      .then((res) => {
        if (res.success && res.data?.alerts) {
          setAlerts(res.data.alerts)
        }
      })
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  const openAlerts = alerts.filter((a) => !a.resolved)
  const critical = openAlerts.filter((a) => a.severity === 'critical').length

  const severityVariant = (severity: string) => {
    if (severity === 'critical') return 'destructive'
    if (severity === 'warning') return 'secondary'
    return 'outline'
  }

  return (
    <DashboardPageLayout
      title="Cold chain alerts"
      description="Temperature, humidity, and facility alerts"
    >
            <StatCardGrid>
        <StatCard
          title="Open alerts"
          value={openAlerts.length}
          loading={loading}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Critical"
          value={critical}
          loading={loading}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Temperature"
          value={openAlerts.filter((a) => a.alert_type === 'temperature').length}
          loading={loading}
          icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Facilities affected"
          value={new Set(openAlerts.map((a) => a.facility_name).filter(Boolean)).size}
          loading={loading}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <DataTable
        title="Alert feed"
        description="Rows from coldchain_alerts (unresolved)"
        loading={loading}
        data={openAlerts}
        emptyMessage="No open cold chain alerts"
        columns={[
          {
            key: 'severity',
            header: 'Severity',
            cell: (row) => (
              <Badge variant={severityVariant(row.severity)}>{row.severity}</Badge>
            ),
          },
          {
            key: 'alert_type',
            header: 'Type',
            cell: (row) => <Badge variant="outline">{row.alert_type}</Badge>,
          },
          { key: 'message', header: 'Message', className: 'whitespace-normal max-w-md' },
          {
            key: 'facility_name',
            header: 'Facility',
            cell: (row) => row.facility_name || '—',
          },
          {
            key: 'reading_value',
            header: 'Reading',
            cell: (row) =>
              row.reading_value != null ? Number(row.reading_value).toFixed(1) : '—',
          },
          {
            key: 'created_at',
            header: 'When',
            cell: (row) => new Date(row.created_at).toLocaleString(),
          },
        ]}
      />
    </DashboardPageLayout>
  )
}
