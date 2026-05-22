'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { PortalInviteDialog } from '@/components/dashboard/portal-invite-dialog'
import { authFetchJson } from '@/lib/api'
import { Shield, UserCheck, Users, Store, Settings, UserPlus } from 'lucide-react'

interface TenantMember {
  id: string
  user_id: string
  role: string
  status: string
  email?: string
  first_name?: string
  last_name?: string
  branch_name?: string | null
  joined_at: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TenantMember[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorInviteOpen, setVendorInviteOpen] = useState(false)
  const [clientInviteOpen, setClientInviteOpen] = useState(false)

  const load = () => {
    setLoading(true)
    authFetchJson<{
      success: boolean
      data?: { members: TenantMember[] }
    }>('/api/v2/tenant')
      .then((res) => {
        if (res.success && res.data?.members) {
          setMembers(res.data.members)
        }
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const activeMembers = members.filter((m) => m.status === 'active').length
  const roles = new Set(members.map((m) => m.role)).size
  const portalVendors = members.filter((m) => m.role === 'vendor' && m.status === 'active').length
  const portalClients = members.filter((m) => m.role === 'customer' && m.status === 'active').length

  const initials = (member: TenantMember) => {
    const a = member.first_name?.[0] ?? ''
    const b = member.last_name?.[0] ?? ''
    return (a + b).toUpperCase() || '?'
  }

  return (
    <DashboardPageLayout
      title="Team"
      description="Staff, vendors, and clients with portal access"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Button className="gap-2" variant="outline" onClick={() => setVendorInviteOpen(true)}>
          <Store className="h-4 w-4" />
          Invite vendor
        </Button>
        <Button className="gap-2" variant="outline" onClick={() => setClientInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite client
        </Button>
        <Button className="gap-2" variant="ghost" asChild>
          <Link href="/dashboard/settings/roles">
            <Settings className="h-4 w-4" />
            Portal roles
          </Link>
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="Members"
          value={members.length}
          loading={loading}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active"
          value={activeMembers}
          loading={loading}
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Roles in use"
          value={roles}
          loading={loading}
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Portal vendors"
          value={portalVendors}
          loading={loading}
          icon={<Store className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Portal clients"
          value={portalClients}
          loading={loading}
          icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <DataTable
        title="Team members"
        description="Users linked via tenant_members"
        loading={loading}
        data={members}
        emptyMessage="No team members found"
        columns={[
          {
            key: 'name',
            header: 'Member',
            cell: (row) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials(row)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {[row.first_name, row.last_name].filter(Boolean).join(' ') || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.email ?? row.user_id}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            cell: (row) => <Badge variant="outline">{row.role.replace('_', ' ')}</Badge>,
          },
          {
            key: 'branch_name',
            header: 'Branch',
            cell: (row) => row.branch_name || '—',
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'joined_at',
            header: 'Joined',
            cell: (row) => row.joined_at?.split('T')[0] ?? '—',
          },
        ]}
      />

      <PortalInviteDialog
        kind="vendor"
        open={vendorInviteOpen}
        onOpenChange={setVendorInviteOpen}
        onSuccess={load}
      />
      <PortalInviteDialog
        kind="customer"
        open={clientInviteOpen}
        onOpenChange={setClientInviteOpen}
        onSuccess={load}
      />
    </DashboardPageLayout>
  )
}
