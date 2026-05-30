'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import type { TenantMemberRole } from '@/lib/tenant'
import { Users, Shield, Loader2, UserCog, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface PlatformUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  tenantCount: number
  tenantLabels: string | null
  lastLogin: string | null
}

interface PlatformTenant {
  id: string
  slug: string
  name: string
}

const MEMBER_ROLES: TenantMemberRole[] = [
  'tenant_owner',
  'branch_manager',
  'accountant',
  'procurement_officer',
  'warehouse_staff',
  'fisherman',
  'vendor',
  'delivery_staff',
  'customer',
  'hr_officer',
  'bmu_official',
]

function PlatformUsersContent() {
  const meta = useDashboardPageMeta()

  const searchParams = useSearchParams()
  const { currentRole } = useAppStore()
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [tenants, setTenants] = useState<PlatformTenant[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFirst, setInviteFirst] = useState('')
  const [inviteLast, setInviteLast] = useState('')
  const [inviteTenantId, setInviteTenantId] = useState('')
  const [inviteRole, setInviteRole] = useState<TenantMemberRole>('fisherman')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}&limit=100` : '?limit=100'
      const res = await authFetchJson<{
        success: boolean
        data?: { users: PlatformUser[] }
        error?: string
      }>(`/api/v2/platform/users${q}`)
      if (!res.success) {
        toast.error(res.error || 'Failed to load users')
        return
      }
      setUsers(res.data?.users ?? [])
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [search])

  const loadTenants = useCallback(async () => {
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { tenants: PlatformTenant[] }
        error?: string
      }>('/api/v2/platform/tenants')
      if (res.success) setTenants(res.data?.tenants ?? [])
    } catch {
      /* optional for invite */
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') {
      load()
      loadTenants()
    }
  }, [currentRole, load, loadTenants])

  useEffect(() => {
    if (searchParams.get('invite') === '1') setInviteOpen(true)
  }, [searchParams])

  const impersonate = async (userId: string) => {
    setImpersonatingId(userId)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/platform/impersonate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Impersonation failed')
        return
      }
      toast.success('Impersonation started — redirecting…')
      window.location.href = '/dashboard'
    } catch {
      toast.error('Network error')
    } finally {
      setImpersonatingId(null)
    }
  }

  const submitInvite = async () => {
    if (!inviteEmail.trim() || !inviteTenantId) {
      toast.error('Email and tenant are required')
      return
    }
    setInviting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { userCreated: boolean; temporaryPassword?: string }
        error?: string
      }>('/api/v2/platform/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          tenantId: inviteTenantId,
          role: inviteRole,
          firstName: inviteFirst.trim() || undefined,
          lastName: inviteLast.trim() || undefined,
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Invite failed')
        return
      }
      if (res.data?.userCreated && res.data.temporaryPassword) {
        toast.success(`User created. Temporary password: ${res.data.temporaryPassword}`)
      } else {
        toast.success('User added to tenant')
      }
      setInviteOpen(false)
      setInviteEmail('')
      setInviteFirst('')
      setInviteLast('')
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setInviting(false)
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
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button className="gap-2" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite user
        </Button></>}>
<AdminHubNav />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All users</CardTitle>
              <CardDescription>{users.length} accounts</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email or name…"
                  className="pl-8 filter-control"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                />
              </div>
              <Button variant="outline" onClick={load}>
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <DataTableShell label="Platform users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenants</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const busy = impersonatingId === u.id
                  const canImpersonate = u.role !== 'super_admin' && u.status === 'active'
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {u.tenantLabels || (u.tenantCount ? `${u.tenantCount} tenant(s)` : '—')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.lastLogin ? String(u.lastLogin).slice(0, 10) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {canImpersonate ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={busy}
                            onClick={() => impersonate(u.id)}
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCog className="h-4 w-4" />
                            )}
                            Impersonate
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </DataTableShell>
          )}
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user to tenant</DialogTitle>
            <DialogDescription>
              Creates an account if needed and adds an active tenant membership.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invite-first">First name</Label>
                <Input
                  id="invite-first"
                  value={inviteFirst}
                  onChange={(e) => setInviteFirst(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-last">Last name</Label>
                <Input
                  id="invite-last"
                  value={inviteLast}
                  onChange={(e) => setInviteLast(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select value={inviteTenantId} onValueChange={setInviteTenantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Member role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TenantMemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitInvite} disabled={inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}


export default function PlatformUsersPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
      <PlatformUsersContent />
    </Suspense>
  )
}
