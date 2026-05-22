'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatCard } from '@/components/dashboard/stat-card'
import type { User, UserRole } from '@/lib/types'
import { authFetchJson, createAdminUser } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Users, Search, Plus, UserCheck, UserX, 
  Shield, Ship, Fish, ShoppingCart, Building2, MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UsersPage() {
  const meta = useDashboardPageMeta()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('fisherman')
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)

  const updateUserStatus = async (user: User, status: 'active' | 'suspended') => {
    setStatusUpdating(user.id)
    try {
      const res = await fetch('/api/v2/users', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to update status')
        return
      }
      toast.success(status === 'suspended' ? 'User suspended' : 'User reactivated')
      await fetchUsers()
    } catch {
      toast.error('Network error')
    } finally {
      setStatusUpdating(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const result = await authFetchJson<{
        success: boolean
        data?: { users: Record<string, unknown>[] }
        error?: string
      }>('/api/v2/users?limit=100')
      if (result.success && result.data?.users) {
        const mapped: User[] = result.data.users.map((row) => {
          const st = (row.status as string) || 'inactive'
          return {
            id: row.id as string,
            name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
            email: (row.email as string) || '',
            phone: (row.phone as string) || '',
            role: row.role as User['role'],
            avatar: (row.avatar_url as string) || undefined,
            createdAt: String(row.created_at || '').split('T')[0],
            status: st === 'active' ? 'active' : st === 'suspended' ? 'suspended' : 'inactive',
            region: (row.county as string) || undefined,
          }
        })
        setUsers(mapped)
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

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      super_admin: <Shield className="h-4 w-4" />,
      investor: <ShoppingCart className="h-4 w-4" />,
      boat_owner: <Ship className="h-4 w-4" />,
      fisherman: <Fish className="h-4 w-4" />,
      fish_buyer: <ShoppingCart className="h-4 w-4" />,
      bmu_official: <Building2 className="h-4 w-4" />
    }
    return icons[role] || <Users className="h-4 w-4" />
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      investor: 'bg-green-100 text-green-800',
      boat_owner: 'bg-blue-100 text-blue-800',
      fisherman: 'bg-cyan-100 text-cyan-800',
      fish_buyer: 'bg-orange-100 text-orange-800',
      bmu_official: 'bg-yellow-100 text-yellow-800'
    }
    return colors[role] || 'bg-muted'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-muted'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleAddUser = async () => {
    if (!newEmail.trim() || !newPassword || !newFirstName.trim() || !newLastName.trim()) {
      toast.error('Email, password, and name are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await createAdminUser({
        email: newEmail.trim(),
        password: newPassword,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        phone: newPhone.trim() || undefined,
        role: newRole,
      })
      if (!result.success) {
        toast.error(result.error || 'Failed to create user')
        return
      }
      toast.success('User created')
      setShowAddDialog(false)
      setNewEmail('')
      setNewPassword('')
      setNewFirstName('')
      setNewLastName('')
      setNewPhone('')
      await fetchUsers()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button></>}>
{/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Suspended"
          value={suspendedUsers}
          icon={<UserX className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 1, isPositive: false }}
        />
        <StatCard
          title="New This Month"
          value={5}
          icon={<Plus className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 25, isPositive: true }}
        />
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'super_admin', 'investor', 'boat_owner', 'fisherman', 'fish_buyer', 'bmu_official'].map((role) => (
          <Button
            key={role}
            variant={roleFilter === role ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter(role)}
          >
            {role === 'all' ? 'All Roles' : role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Region</th>
                  <th className="text-left py-3 px-4 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role.replace('_', ' ')}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{user.region || '-'}</td>
                      <td className="py-3 px-4">{user.phone}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setProfileUser(user)}>View Profile</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              disabled={statusUpdating === user.id}
                              onClick={() =>
                                updateUserStatus(
                                  user,
                                  user.status === 'suspended' ? 'active' : 'suspended',
                                )
                              }
                            >
                              {statusUpdating === user.id
                                ? 'Updating…'
                                : user.status === 'suspended'
                                  ? 'Reactivate'
                                  : 'Suspend User'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!profileUser} onOpenChange={(open) => !open && setProfileUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{profileUser?.name}</DialogTitle>
            <DialogDescription>{profileUser?.email}</DialogDescription>
          </DialogHeader>
          {profileUser && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Role:</span> {profileUser.role}</p>
              <p><span className="text-muted-foreground">Phone:</span> {profileUser.phone || '—'}</p>
              <p><span className="text-muted-foreground">Region:</span> {profileUser.region || '—'}</p>
              <p><span className="text-muted-foreground">Status:</span> {profileUser.status}</p>
              <p><span className="text-muted-foreground">Joined:</span> {profileUser.createdAt}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Create a new platform user in the database</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['fisherman', 'boat_owner', 'fish_buyer', 'bmu_official', 'investor'] as UserRole[]).map(
                    (r) => (
                      <SelectItem key={r} value={r}>
                        {r.replace('_', ' ')}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

