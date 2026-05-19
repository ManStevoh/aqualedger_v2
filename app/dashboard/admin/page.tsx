'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Shield, Activity, AlertTriangle, Plus, Filter, Search } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import type { UserRole } from '@/lib/types'

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

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
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
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeUsers = users.filter((u) => u.status === 'active').length
  const platformOps = users.filter((u) => u.role === 'super_admin' || u.role === 'investor').length
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length
  const totalUsers = users.length

  const activityData = [
    { date: 'Mon', logins: 1200, registrations: 400 },
    { date: 'Tue', logins: 1400, registrations: 320 },
    { date: 'Wed', logins: 1800, registrations: 500 },
    { date: 'Thu', logins: 1600, registrations: 450 },
    { date: 'Fri', logins: 2000, registrations: 600 },
    { date: 'Sat', logins: 900, registrations: 200 },
    { date: 'Sun', logins: 800, registrations: 180 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">
            Platform administration — users, roles, and system activity
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toString()} icon={<Users className="h-4 w-4" />} description="Registered accounts" />
        <StatCard title="Active Users" value={activeUsers.toString()} icon={<Activity className="h-4 w-4" />} description="Currently active" />
        <StatCard title="Platform Operators" value={platformOps.toString()} icon={<Shield className="h-4 w-4" />} description="Admins & investors" />
        <StatCard title="Suspended" value={suspendedUsers.toString()} icon={<AlertTriangle className="h-4 w-4" />} description="Requires review" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Logins and new registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="hsl(var(--primary))" />
                <Line type="monotone" dataKey="registrations" stroke="hsl(var(--chart-2))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>By role type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(
                  users.reduce<Record<string, number>>((acc, u) => {
                    acc[u.role] = (acc[u.role] || 0) + 1
                    return acc
                  }, {}),
                ).map(([role, count]) => ({ role: roleLabels[role as UserRole] || role, count }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>All platform users and their roles</CardDescription>
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
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
    </div>
  )
}
