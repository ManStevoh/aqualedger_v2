'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { authFetchJson } from '@/lib/api'

interface AuditLog {
  id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  user_email: string | null
  ip_address: string | null
  created_at: string
}

export default function TenantAuditLogsPage() {
  const meta = useDashboardPageMeta({
    title: 'Audit Trail',
    description: 'Track operations and system changes in your organization',
    breadcrumbs: [{ label: 'Command Center', href: '/dashboard' }, { label: 'Audit trail' }],
  })

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (filter) params.set('action', filter)

    authFetchJson<{ success: boolean; data?: { logs: AuditLog[] } }>(
      `/api/v2/platform/audit-logs?${params.toString()}`,
    ).then((res) => {
      if (res.success && res.data?.logs) setLogs(res.data.logs)
    })
  }, [filter])

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by action (e.g. auth.login)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap gap-2 items-center justify-between border-b py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{log.action}</Badge>
                <span className="text-muted-foreground">{log.user_email || 'system'}</span>
                {log.resource_type && (
                  <span className="text-muted-foreground">
                    {log.resource_type}:{log.resource_id?.slice(0, 8)}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {String(log.created_at).slice(0, 19)} · {log.ip_address || '—'}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No audit entries</p>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
