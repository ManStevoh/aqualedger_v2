'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import {
  Users,
  Building2,
  Activity,
  AlertTriangle,
  Search,
  LayoutGrid,
  Shield,
  HeartPulse,
  Settings,
  ArrowRight,
  UserPlus,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { authFetchJson } from '@/lib/api'
import type { UserRole } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  investor: 'Platform Operator',
  boat_owner: 'Boat Owner',
  fisherman: 'Fisherman',
  fish_buyer: 'Fish Buyer',
  bmu_official: 'BMU Official',
}

interface AdminUserRow {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  joinDate: string
  lastLogin: string
}

interface PlatformOverview {
  totalTenants?: number
  activeTenants?: number
  suspendedTenants?: number
  totalUsers?: number
  activeUsers?: number
  recentSignups?: { date: string; count: number }[]
}

const QUICK_ACTIONS = [
  { href: '/dashboard/admin/tenants', label: 'Tenants', description: 'Provision & manage orgs', icon: Building2 },
  { href: '/dashboard/admin/users', label: 'Users', description: 'Impersonate for support', icon: UserPlus },
  { href: '/dashboard/admin/analytics', label: 'Analytics', description: 'GMV & plan breakdown', icon: Activity },
  { href: '/dashboard/admin/modules', label: 'Modules', description: 'Toggle ERP modules', icon: LayoutGrid },
  { href: '/dashboard/admin/audit', label: 'Audit', description: 'Platform activity log', icon: Shield },
  { href: '/dashboard/admin/health', label: 'Health', description: 'Service status', icon: HeartPulse },
  { href: '/dashboard/admin/settings', label: 'Settings', description: 'Maintenance & announcements', icon: Settings },
]

export default function AdminPage() {
  const { currentRole } = useAppStore()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [overview, setOverview] = useState<PlatformOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchOverview = useCallback(async () => {
    if (currentRole !== 'super_admin') return
    setOverviewLoading(true)
    try {
      const data = await authFetchJson<{ success: boolean; data?: PlatformOverview }>(
        '/api/v2/platform/overview',
      )
      if (data.success && data.data) setOverview(data.data)
    } catch (error) {
      console.error('Failed to fetch platform overview:', error)
    } finally {
      setOverviewLoading(false)
    }
  }, [currentRole])

  const fetchUsers = useCallback(async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { users: Record<string, unknown>[] }
      }>('/api/v2/users?limit=100')
      if (data.success && data.data?.users) {
        setUsers(
          data.data.users.map((row) => ({
            id: row.id as string,
            name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
            email: (row.email as string) || '',
            role: row.role as UserRole,
            status: (row.status as AdminUserRow['status']) || 'inactive',
            joinDate: String(row.created_at || '').split('T')[0],
            lastLogin: row.last_login ? String(row.last_login).split('T')[0] : '—',
          })),
        )
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchOverview()
  }, [fetchUsers, fetchOverview])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeUsers = overview?.activeUsers ?? users.filter((u) => u.status === 'active').length
  const totalUsers = overview?.totalUsers ?? users.length
  const totalTenants = overview?.totalTenants ?? '—'
  const suspendedTenants = overview?.suspendedTenants ?? '—'

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
        <h1 className="text-2xl font-bold tracking-tight">Platform Command Center</h1>
        <p className="text-muted-foreground">
          Super-admin overview — tenants, users, and platform health
        </p>
      </div>

      <AdminHubNav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={String(totalTenants)}
          icon={<Building2 className="h-4 w-4" />}
          description="Registered organizations"
          loading={overviewLoading}
        />
        <StatCard
          title="Active Tenants"
          value={String(overview?.activeTenants ?? '—')}
          icon={<Activity className="h-4 w-4" />}
          description="Currently active"
          loading={overviewLoading}
        />
        <StatCard
          title="Total Users"
          value={String(totalUsers)}
          icon={<Users className="h-4 w-4" />}
          description="Across all tenants"
          loading={overviewLoading}
        />
        <StatCard
          title="Suspended Tenants"
          value={String(suspendedTenants)}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Requires review"
          loading={overviewLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {QUICK_ACTIONS.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:border-primary/30 hover:bg-muted/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {overview?.recentSignups && overview.recentSignups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent signups
            </CardTitle>
            <CardDescription>New tenant registrations over recent days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={overview.recentSignups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Platform users across all tenants ·{' '}
                <Link href="/dashboard/users" className="text-primary hover:underline">
                  Open full users view
                </Link>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/dashboard/admin/users?invite=1">
                  <UserPlus className="h-4 w-4" />
                  Invite user
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 pr-4 font-medium">{user.name}</td>
                      <td className="py-3 pr-4">{user.email}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{roleLabels[user.role]}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'default'
                              : user.status === 'suspended'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{user.joinDate}</td>
                      <td className="py-3">{user.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Active users: <span className="font-medium text-foreground">{activeUsers}</span>
      </p>
    </div>
  )
}
