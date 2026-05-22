'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, RotateCcw, Store, Users } from 'lucide-react'

type PortalRole = 'vendor' | 'customer'

interface RoleMap {
  role: PortalRole
  label: string
  permissions: string[]
  assignable: string[]
  defaults: string[]
  descriptions: Record<string, string>
}

export default function PortalRolesSettingsPage() {
  const [roles, setRoles] = useState<RoleMap[]>([])
  const [draft, setDraft] = useState<Record<PortalRole, Set<string>>>({
    vendor: new Set(),
    customer: new Set(),
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loginNote, setLoginNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { roles: RoleMap[]; loginNote?: string }
      }>('/api/v2/tenant/role-permissions')
      if (res.success && res.data?.roles) {
        setRoles(res.data.roles)
        const next: Record<PortalRole, Set<string>> = { vendor: new Set(), customer: new Set() }
        for (const r of res.data.roles) {
          next[r.role] = new Set(r.permissions)
        }
        setDraft(next)
        setLoginNote(res.data.loginNote || '')
      }
    } catch {
      toast.error('Could not load portal roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = (role: PortalRole, perm: string, checked: boolean) => {
    setDraft((prev) => {
      const set = new Set(prev[role])
      if (checked) set.add(perm)
      else set.delete(perm)
      return { ...prev, [role]: set }
    })
  }

  const save = async (role: PortalRole) => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/tenant/role-permissions',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, permissions: [...draft[role]] }),
        },
      )
      if (!res.success) throw new Error(res.error || 'Save failed')
      toast.success(`${role === 'vendor' ? 'Vendor' : 'Client'} permissions saved`)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const resetDefaults = async () => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/tenant/role-permissions', {
        method: 'POST',
      })
      if (!res.success) throw new Error('Reset failed')
      toast.success('Restored default vendor & client permissions')
      load()
    } catch {
      toast.error('Reset failed')
    } finally {
      setSaving(false)
    }
  }

  const renderRole = (role: PortalRole) => {
    const meta = roles.find((r) => r.role === role)
    if (!meta) return null
    const groups = new Map<string, string[]>()
    for (const p of meta.assignable) {
      const mod = p.split('.')[0]
      const list = groups.get(mod) || []
      list.push(p)
      groups.set(mod, list)
    }

    return (
      <div className="space-y-6">
        {loginNote && (
          <p className="text-sm text-muted-foreground rounded-lg border p-3 bg-muted/30">{loginNote}</p>
        )}
        <div className="flex flex-wrap gap-2 text-sm">
          <Button variant="outline" size="sm" asChild>
            <Link href={role === 'vendor' ? '/dashboard/commerce/vendors' : '/dashboard/crm/customers'}>
              Invite {role === 'vendor' ? 'vendors' : 'clients'}
            </Link>
          </Button>
        </div>
        {[...groups.entries()].map(([mod, perms]) => (
          <div key={mod}>
            <h3 className="text-sm font-semibold capitalize mb-2">{mod}</h3>
            <ul className="space-y-2">
              {perms.map((perm) => (
                <li key={perm} className="flex items-start gap-3">
                  <Checkbox
                    id={`${role}-${perm}`}
                    checked={draft[role].has(perm)}
                    onCheckedChange={(v) => toggle(role, perm, v === true)}
                  />
                  <div>
                    <Label htmlFor={`${role}-${perm}`} className="font-mono text-xs cursor-pointer">
                      {perm}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {meta.descriptions[perm] || perm}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Button onClick={() => save(role)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save {role === 'vendor' ? 'vendor' : 'client'} permissions
        </Button>
      </div>
    )
  }

  return (
    <DashboardPageLayout
      title="Portal roles"
      description="Default permissions for vendors (sellers) and clients (buyers). They sign in at /login after you invite them."
    >
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={resetDefaults} disabled={saving || loading}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to system defaults
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <Tabs defaultValue="vendor">
          <TabsList>
            <TabsTrigger value="vendor" className="gap-2">
              <Store className="h-4 w-4" /> Vendor portal
            </TabsTrigger>
            <TabsTrigger value="customer" className="gap-2">
              <Users className="h-4 w-4" /> Client portal
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vendor">
            <Card>
              <CardHeader>
                <CardTitle>Vendor permissions</CardTitle>
                <CardDescription>
                  Sellers with role <code className="text-xs">vendor</code> in Team — marketplace listings,
                  payouts, storefront.
                </CardDescription>
              </CardHeader>
              <CardContent>{renderRole('vendor')}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customer">
            <Card>
              <CardHeader>
                <CardTitle>Client permissions</CardTitle>
                <CardDescription>
                  Buyers with role <code className="text-xs">customer</code> — cart, checkout, orders, reviews.
                </CardDescription>
              </CardHeader>
              <CardContent>{renderRole('customer')}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </DashboardPageLayout>
  )
}
