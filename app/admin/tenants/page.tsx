'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableShell } from '@/components/dashboard/data-table-shell'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { TenantPlan, TenantStatus } from '@/lib/tenant'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Shield, Loader2, Plus, Download, Trash2, SlidersHorizontal, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'

interface PlatformTenant {
  id: string
  slug: string
  name: string
  plan: TenantPlan
  status: TenantStatus
  memberCount: number
  revenue30d?: number
  createdAt?: string
  created_at?: string
}

const PLANS: TenantPlan[] = ['trial', 'starter', 'professional', 'enterprise']

interface TenantFeatureFlag {
  flagKey: string
  label: string
  description: string
  enabled: boolean
}

interface TenantModuleFlag {
  moduleId: string
  label: string
  description: string
  platformEnabled: boolean
  hasOverride: boolean
  enabled: boolean
}

function formatKes(n: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(n)
}

function statusBadgeVariant(status: TenantStatus) {
  if (status === 'active') return 'default' as const
  if (status === 'suspended') return 'destructive' as const
  return 'secondary' as const
}

export default function PlatformTenantsPage() {
  const meta = useDashboardPageMeta()

  const { currentRole } = useAppStore()
  const [tenants, setTenants] = useState<PlatformTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [provisioning, setProvisioning] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerFirst, setOwnerFirst] = useState('')
  const [ownerLast, setOwnerLast] = useState('')
  const [newPlan, setNewPlan] = useState<TenantPlan>('trial')
  const [purgeTarget, setPurgeTarget] = useState<PlatformTenant | null>(null)
  const [purgeSlugInput, setPurgeSlugInput] = useState('')
  const [purging, setPurging] = useState(false)
  const [flagsTarget, setFlagsTarget] = useState<PlatformTenant | null>(null)
  const [flagsList, setFlagsList] = useState<TenantFeatureFlag[]>([])
  const [flagsDraft, setFlagsDraft] = useState<Record<string, boolean>>({})
  const [flagsLoading, setFlagsLoading] = useState(false)
  const [flagsSaving, setFlagsSaving] = useState(false)
  const [accessTarget, setAccessTarget] = useState<PlatformTenant | null>(null)
  const [accessTab, setAccessTab] = useState<'modules' | 'flags'>('modules')
  const [modulesList, setModulesList] = useState<TenantModuleFlag[]>([])
  const [modulesDraft, setModulesDraft] = useState<Record<string, boolean>>({})
  const [modulesLoading, setModulesLoading] = useState(false)
  const [modulesSaving, setModulesSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { tenants: PlatformTenant[] }; error?: string }>(
        '/api/v2/platform/tenants',
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to load tenants')
        return
      }
      setTenants(res.data?.tenants ?? [])
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

  const patchTenant = async (tenantId: string, patch: { status?: TenantStatus; plan?: TenantPlan }) => {
    setUpdatingId(tenantId)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/platform/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, ...patch }),
      })
      if (!res.success) {
        toast.error(res.error || 'Update failed')
        return
      }
      toast.success('Tenant updated')
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setUpdatingId(null)
    }
  }

  const provision = async () => {
    if (!orgName.trim() || !ownerEmail.trim()) {
      toast.error('Organization name and owner email are required')
      return
    }
    setProvisioning(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { slug: string; temporaryPassword?: string; ownerCreated?: boolean }
        error?: string
      }>('/api/v2/platform/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgName.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerFirstName: ownerFirst.trim() || undefined,
          ownerLastName: ownerLast.trim() || undefined,
          plan: newPlan,
          businessType: 'cooperative',
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Provisioning failed')
        return
      }
      const msg = res.data?.temporaryPassword
        ? `Tenant "${res.data.slug}" created. Temp password: ${res.data.temporaryPassword}`
        : `Tenant "${res.data?.slug}" created and linked to existing owner.`
      toast.success(msg, { duration: 12000 })
      setDialogOpen(false)
      setOrgName('')
      setOwnerEmail('')
      setOwnerFirst('')
      setOwnerLast('')
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setProvisioning(false)
    }
  }

  const exportTenant = (tenantId: string) => {
    window.open(`/api/v2/platform/tenants/${tenantId}/export`, '_blank')
  }

  const toggleStatus = (tenant: PlatformTenant) => {
    const next: TenantStatus = tenant.status === 'active' ? 'suspended' : 'active'
    patchTenant(tenant.id, { status: next })
  }

  const openPurgeDialog = (tenant: PlatformTenant) => {
    setPurgeTarget(tenant)
    setPurgeSlugInput('')
  }

  const closePurgeDialog = () => {
    setPurgeTarget(null)
    setPurgeSlugInput('')
  }

  const openAccessDialog = async (tenant: PlatformTenant, tab: 'modules' | 'flags' = 'modules') => {
    setAccessTarget(tenant)
    setAccessTab(tab)
    setFlagsTarget(tenant)
    setFlagsDraft({})
    setModulesDraft({})
    setFlagsLoading(true)
    setModulesLoading(true)
    try {
      const [modRes, flagRes] = await Promise.all([
        authFetchJson<{
          success: boolean
          data?: { modules: TenantModuleFlag[] }
          error?: string
        }>(`/api/v2/platform/tenants/${tenant.id}/modules`),
        authFetchJson<{
          success: boolean
          data?: { flags: TenantFeatureFlag[] }
          error?: string
        }>(`/api/v2/platform/tenants/${tenant.id}/flags`),
      ])
      if (!modRes.success) {
        toast.error(modRes.error || 'Failed to load module flags')
        setAccessTarget(null)
        setFlagsTarget(null)
        return
      }
      if (!flagRes.success) {
        toast.error(flagRes.error || 'Failed to load feature flags')
        setAccessTarget(null)
        setFlagsTarget(null)
        return
      }
      const mods = modRes.data?.modules ?? []
      setModulesList(mods)
      setModulesDraft(Object.fromEntries(mods.map((m) => [m.moduleId, m.enabled])))
      const list = flagRes.data?.flags ?? []
      setFlagsList(list)
      setFlagsDraft(Object.fromEntries(list.map((f) => [f.flagKey, f.enabled])))
    } catch {
      toast.error('Network error')
      setAccessTarget(null)
      setFlagsTarget(null)
    } finally {
      setFlagsLoading(false)
      setModulesLoading(false)
    }
  }

  const closeAccessDialog = () => {
    setAccessTarget(null)
    setFlagsTarget(null)
    setFlagsList([])
    setFlagsDraft({})
    setModulesList([])
    setModulesDraft({})
  }

  const saveFlags = async () => {
    if (!flagsTarget) return
    setFlagsSaving(true)
    try {
      const flags = Object.entries(flagsDraft).map(([flagKey, enabled]) => ({
        flagKey,
        enabled,
      }))
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/platform/tenants/${flagsTarget.id}/flags`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flags }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Save failed')
        return
      }
      toast.success(`Feature flags updated for ${flagsTarget.slug}`)
      closeAccessDialog()
    } catch {
      toast.error('Network error')
    } finally {
      setFlagsSaving(false)
    }
  }

  const saveModules = async () => {
    if (!accessTarget) return
    setModulesSaving(true)
    try {
      const modules = modulesList.map((m) => ({
        moduleId: m.moduleId,
        enabled: modulesDraft[m.moduleId] ?? m.enabled,
      }))
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/platform/tenants/${accessTarget.id}/modules`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modules }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Save failed')
        return
      }
      toast.success(`Module access updated for ${accessTarget.slug}`)
      closeAccessDialog()
    } catch {
      toast.error('Network error')
    } finally {
      setModulesSaving(false)
    }
  }

  const purgeTenantData = async () => {
    if (!purgeTarget) return
    if (purgeSlugInput !== purgeTarget.slug) {
      toast.error('Slug confirmation does not match')
      return
    }
    setPurging(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { deleted: boolean; slug: string }; error?: string }>(
        `/api/v2/platform/tenants/${purgeTarget.id}/purge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmSlug: purgeSlugInput }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Purge failed')
        return
      }
      toast.success(`Tenant "${res.data?.slug}" permanently deleted`)
      closePurgeDialog()
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setPurging(false)
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

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Provision tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New organization</DialogTitle>
              <DialogDescription>
                Creates tenant, HQ branch, chart of accounts, and owner membership. New owners receive a
                one-time temporary password in the success toast.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="org">Organization name</Label>
                <Input id="org" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Owner email</Label>
                <Input id="email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="first">Owner first name</Label>
                  <Input id="first" value={ownerFirst} onChange={(e) => setOwnerFirst(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last">Owner last name</Label>
                  <Input id="last" value={ownerLast} onChange={(e) => setOwnerLast(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Plan</Label>
                <Select value={newPlan} onValueChange={(v) => setNewPlan(v as TenantPlan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={provisioning} onClick={provision}>
                {provisioning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create tenant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>}>

      <AdminHubNav />

      <Dialog open={purgeTarget !== null} onOpenChange={(open) => !open && closePurgeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete tenant</DialogTitle>
            <DialogDescription>
              This GDPR purge removes the tenant and all related data via cascade delete. This action cannot
              be undone. Type <span className="font-mono font-semibold">{purgeTarget?.slug}</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="purge-slug">Tenant slug</Label>
            <Input
              id="purge-slug"
              value={purgeSlugInput}
              onChange={(e) => setPurgeSlugInput(e.target.value)}
              placeholder={purgeTarget?.slug ?? ''}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closePurgeDialog} disabled={purging}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={purging || purgeSlugInput !== purgeTarget?.slug}
              onClick={purgeTenantData}
            >
              {purging ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={accessTarget !== null} onOpenChange={(open) => !open && closeAccessDialog()}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Organization access</DialogTitle>
            <DialogDescription>
              Per-tenant module toggles for {accessTarget?.name} ({accessTarget?.slug}). Starts from
              platform defaults in Admin → Modules; overrides stored in tenant_module_flags.
            </DialogDescription>
          </DialogHeader>
          <Tabs value={accessTab} onValueChange={(v) => setAccessTab(v as 'modules' | 'flags')} className="flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="modules">ERP modules</TabsTrigger>
              <TabsTrigger value="flags">Feature shortcuts</TabsTrigger>
            </TabsList>
            <TabsContent value="modules" className="mt-3 overflow-y-auto max-h-[50vh] pr-1">
              {modulesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading modules…
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  {modulesList.map((mod) => {
                    const blocked = !mod.platformEnabled
                    const checked = modulesDraft[mod.moduleId] ?? mod.enabled
                    return (
                      <div
                        key={mod.moduleId}
                        className="flex items-center justify-between gap-4 rounded-lg border p-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">{mod.label}</p>
                          <p className="text-sm text-muted-foreground">{mod.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs font-mono">
                              {mod.moduleId}
                            </Badge>
                            <Badge variant={mod.platformEnabled ? 'secondary' : 'destructive'} className="text-xs">
                              Platform {mod.platformEnabled ? 'on' : 'off'}
                            </Badge>
                            {mod.hasOverride && (
                              <Badge variant="default" className="text-xs">
                                Override
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Switch
                          disabled={blocked}
                          checked={blocked ? false : checked}
                          onCheckedChange={(on) =>
                            setModulesDraft((prev) => ({ ...prev, [mod.moduleId]: on }))
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
            <TabsContent value="flags" className="mt-3 overflow-y-auto max-h-[50vh] pr-1">
              {flagsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading flags…
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  <p className="text-xs text-muted-foreground">
                    Legacy shortcuts (marketplace, AI, analytics). Prefer ERP modules tab for full control.
                  </p>
                  {flagsList.map((flag) => (
                    <div key={flag.flagKey} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{flag.label}</p>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{flag.flagKey}</p>
                      </div>
                      <Switch
                        checked={flagsDraft[flag.flagKey] ?? flag.enabled}
                        onCheckedChange={(checked) =>
                          setFlagsDraft((prev) => ({ ...prev, [flag.flagKey]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={closeAccessDialog} disabled={flagsSaving || modulesSaving}>
              Cancel
            </Button>
            {accessTab === 'modules' ? (
              <Button disabled={modulesSaving || modulesLoading} onClick={saveModules}>
                {modulesSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save modules'}
              </Button>
            ) : (
              <Button disabled={flagsSaving || flagsLoading} onClick={saveFlags}>
                {flagsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save flags'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All tenants</CardTitle>
          <CardDescription>{tenants.length} organization{tenants.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading tenants…
            </div>
          ) : tenants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tenants — provision your first organization</p>
          ) : (
            <div className="overflow-x-auto">
              <DataTableShell>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>GMV (30d)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => {
                    const busy = updatingId === tenant.id
                    const created = tenant.createdAt ?? tenant.created_at
                    return (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-mono text-xs">{tenant.slug}</TableCell>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell>
                          <Select
                            value={tenant.plan}
                            disabled={busy}
                            onValueChange={(plan) => patchTenant(tenant.id, { plan: plan as TenantPlan })}
                          >
                            <SelectTrigger className="filter-control" size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLANS.map((plan) => (
                                <SelectItem key={plan} value={plan}>
                                  {plan}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatKes(Number(tenant.revenue30d ?? 0))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(tenant.status)}>{tenant.status}</Badge>
                        </TableCell>
                        <TableCell>{tenant.memberCount}</TableCell>
                        <TableCell>{created ? String(created).split('T')[0] : '—'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAccessDialog(tenant, 'modules')}
                            title="Module access"
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAccessDialog(tenant, 'flags')}
                            title="Feature shortcuts"
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportTenant(tenant.id)}
                            title="Export JSON"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={tenant.status === 'active' ? 'destructive' : 'default'}
                            size="sm"
                            disabled={busy}
                            onClick={() => toggleStatus(tenant)}
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : tenant.status === 'active' ? (
                              'Suspend'
                            ) : (
                              'Activate'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={busy || purging}
                            onClick={() => openPurgeDialog(tenant)}
                            title="GDPR purge"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              </DataTableShell>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}

