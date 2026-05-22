'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { Users, Shield, Loader2, UserCog, Search } from 'lucide-react'
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

export default function PlatformUsersPage() {
  const { currentRole } = useAppStore()
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)

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

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-7 w-7" />
          Platform users
        </h1>
        <p className="text-muted-foreground">Cross-tenant directory with support impersonation</p>
      </div>

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
                  className="pl-8 w-[220px]"
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
