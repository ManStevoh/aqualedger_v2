'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { ERP_MODULES } from '@/lib/platform/modules'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { LayoutGrid, Shield, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ModuleFlag {
  moduleId: string
  label: string
  description: string
  enabled: boolean
}

export default function PlatformModulesAdminPage() {
  const { currentRole, setEnabledModuleIds } = useAppStore()
  const [flags, setFlags] = useState<ModuleFlag[]>([])
  const [draft, setDraft] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { flags: ModuleFlag[]; enabledModuleIds: string[] }
        error?: string
      }>('/api/v2/platform/modules?admin=1')
      if (!res.success) {
        toast.error(res.error || 'Failed to load modules')
        return
      }
      const list = res.data?.flags ?? []
      setFlags(list)
      setDraft(Object.fromEntries(list.map((f) => [f.moduleId, f.enabled])))
      if (res.data?.enabledModuleIds) {
        setEnabledModuleIds(res.data.enabledModuleIds)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [setEnabledModuleIds])

  useEffect(() => {
    if (currentRole !== 'super_admin') return
    load()
  }, [currentRole, load])

  const toggle = (moduleId: string, enabled: boolean) => {
    setDraft((prev) => ({ ...prev, [moduleId]: enabled }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const modules = Object.entries(draft).map(([moduleId, enabled]) => ({
        moduleId,
        enabled,
      }))
      const res = await authFetchJson<{
        success: boolean
        data?: { enabledModuleIds: string[] }
        error?: string
      }>('/api/v2/platform/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      })
      if (!res.success) {
        toast.error(res.error || 'Save failed')
        return
      }
      toast.success('Platform modules updated for all tenants')
      if (res.data?.enabledModuleIds) {
        setEnabledModuleIds(res.data.enabledModuleIds)
      }
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (currentRole !== 'super_admin') {
    return (
      <div className="py-12 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-medium">Super administrator access required</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  const enabledCount = Object.values(draft).filter(Boolean).length
  const totalCount = ERP_MODULES.filter((m) => m.id !== 'platform').length

  return (
    <DashboardPageLayout
      title="Platform modules"
      description="Enable or disable ERP modules for every tenant. Disabled modules are hidden in navigation and blocked via API."
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DashboardPageLayout
      title="Platform modules"
      description="Enable or disable ERP modules for every tenant. Disabled modules are hidden in navigation and blocked via API."
    >
              <Button className="gap-2" onClick={save} disabled={saving || loading}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <AdminHubNav />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Module registry
          </CardTitle>
          <CardDescription>
            Overview (<Badge variant="outline">platform</Badge>) is always on. {enabledCount} of {totalCount} optional modules enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            flags.map((flag) => {
              const mod = ERP_MODULES.find((m) => m.id === flag.moduleId)
              const Icon = mod?.icon
              return (
                <div
                  key={flag.moduleId}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    {Icon && (
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${mod?.color ?? ''}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold">{flag.label}</p>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{flag.moduleId}</p>
                    </div>
                  </div>
                  <Switch
                    checked={draft[flag.moduleId] ?? false}
                    onCheckedChange={(checked) => toggle(flag.moduleId, checked)}
                  />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardPageLayout>
  )
}
