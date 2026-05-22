'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { Shield } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  user_email: string | null
  ip_address: string | null
  created_at: string
  tenant_id?: string | null
  tenant_name?: string | null
  tenant_slug?: string | null
}

interface TenantOption {
  id: string
  name: string
  slug: string
}

export default function AuditLogsPage() {
  const { currentRole } = useAppStore()
  const isSuperAdmin = currentRole === 'super_admin'
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState('')
  const [tenantFilter, setTenantFilter] = useState<string>('all')
  const [tenants, setTenants] = useState<TenantOption[]>([])

  useEffect(() => {
    if (!isSuperAdmin) return
    authFetchJson<{ success: boolean; data?: { tenants: TenantOption[] } }>(
      '/api/v2/platform/tenants',
    ).then((res) => {
      if (res.success && res.data?.tenants) setTenants(res.data.tenants)
    })
  }, [isSuperAdmin])

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (filter) params.set('action', filter)
    if (isSuperAdmin && tenantFilter !== 'all') params.set('tenantId', tenantFilter)

    authFetchJson<{ success: boolean; data?: { logs: AuditLog[] } }>(
      `/api/v2/platform/audit-logs?${params.toString()}`,
    ).then((res) => {
      if (res.success && res.data?.logs) setLogs(res.data.logs)
    })
  }, [filter, tenantFilter, isSuperAdmin])

  const tenantLabel = (log: AuditLog) =>
    log.tenant_name || log.tenant_slug || log.tenant_id?.slice(0, 8) || '—'

  return (
    <DashboardPageLayout title="Audit trail" description="OWASP-compliant activity log · GDPR accountability">


      {isSuperAdmin && <AdminHubNav />}

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by action (e.g. auth.login)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
        {isSuperAdmin && (
          <Select value={tenantFilter} onValueChange={setTenantFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All tenants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tenants</SelectItem>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
                {isSuperAdmin && (
                  <Badge variant="secondary" className="font-normal">
                    {tenantLabel(log)}
                  </Badge>
                )}
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
