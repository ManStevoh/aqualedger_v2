'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { DataTable } from '@/components/dashboard/data-table'
import { authFetchJson, useBoats } from '@/lib/api'
import { Plus, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

interface CrewRow {
  id: string
  boat_id: string
  crew_member_id: string
  role: string
  joined_date: string
  crew_name?: string
  crew_email?: string
  boat_name?: string
  registration_number?: string
}

interface TenantMemberItem {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

const roleLabels: Record<string, string> = {
  captain: 'Captain',
  engineer: 'Engineer',
  deckhand: 'Deckhand',
  nets_officer: 'Nets officer',
}

export default function CrewPage() {
  const [crew, setCrew] = useState<CrewRow[]>([])
  const [tenantMembers, setTenantMembers] = useState<TenantMemberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [boatFilter, setBoatFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [boatId, setBoatId] = useState('')
  const [crewMemberId, setCrewMemberId] = useState('')
  const [role, setRole] = useState('deckhand')

  const { data: boatsData } = useBoats()
  const boats = boatsData?.data?.items || []

  const fetchCrew = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (boatFilter !== 'all') params.set('boatId', boatFilter)
      const res = await authFetchJson<{ success: boolean; data?: { crew: CrewRow[] } }>(
        `/api/v2/fishing-ops/crew?${params}`,
      )
      setCrew(res.success && res.data?.crew ? res.data.crew : [])
    } catch {
      setCrew([])
      toast.error('Failed to load crew')
    } finally {
      setLoading(false)
    }
  }, [boatFilter])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { members: TenantMemberItem[] }
      }>('/api/v2/tenant')
      if (res.success && res.data?.members) {
        setTenantMembers(res.data.members)
      }
    } catch {
      /* optional fallback */
    }
  }, [])

  useEffect(() => {
    fetchCrew()
    fetchMembers()
  }, [fetchCrew, fetchMembers])

  const handleAdd = async () => {
    if (!boatId || !crewMemberId) {
      toast.error('Please select both a boat and a crew member')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/fishing-ops/crew',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            boatId,
            crewMemberId,
            role,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not add crew')
        return
      }
      toast.success('Crew member assigned successfully')
      setDialogOpen(false)
      setCrewMemberId('')
      fetchCrew()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/fishing-ops/crew?id=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not remove')
        return
      }
      toast.success('Crew member removed')
      fetchCrew()
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <DashboardPageLayout
      title="Boat crew"
      description="Assign fishermen and officers to vessels."
      actions={
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add crew
        </Button>
      }
    >
      <div className="flex items-center gap-3 max-w-xs mb-4">
        <Label className="shrink-0">Filter by Boat</Label>
        <Select value={boatFilter} onValueChange={setBoatFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All boats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All boats</SelectItem>
            {boats.map((b: { id: string; name: string }) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        title="Active crew assignments"
        loading={loading}
        data={crew}
        emptyMessage="No crew assignments found"
        columns={[
          { key: 'boat_name', header: 'Boat Name', cell: (row) => row.boat_name || '—' },
          { key: 'crew_name', header: 'Crew Member', cell: (row) => row.crew_name || row.crew_member_id },
          { key: 'crew_email', header: 'Email Address', cell: (row) => row.crew_email || '—' },
          {
            key: 'role',
            header: 'Crew Role',
            cell: (row) => (
              <Badge variant="outline" className="capitalize font-semibold">
                {roleLabels[row.role] || row.role}
              </Badge>
            ),
          },
          {
            key: 'joined_date',
            header: 'Assigned Date',
            cell: (row) => new Date(row.joined_date).toLocaleDateString(),
          },
          {
            key: 'actions',
            header: '',
            cell: (row) => (
              <Button size="sm" variant="ghost" onClick={() => handleRemove(row.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ),
          },
        ]}
      />

      {/* Add Crew Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Add Crew Member to Vessel
            </DialogTitle>
            <DialogDescription>
              Select a registered team member or fisherman to assign to a vessel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Boat Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Boat / Vessel</Label>
              <Select value={boatId} onValueChange={setBoatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select boat..." />
                </SelectTrigger>
                <SelectContent>
                  {boats.map((b: { id: string; name: string }) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Crew Member Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Crew Member / Fisherman</Label>
              <Select value={crewMemberId} onValueChange={setCrewMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member or fisherman..." />
                </SelectTrigger>
                <SelectContent>
                  {tenantMembers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No team members found
                    </SelectItem>
                  ) : (
                    tenantMembers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.first_name} {m.last_name} ({m.email}) —{' '}
                        <span className="capitalize font-mono text-[10px]">{m.role.replace(/_/g, ' ')}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Vessel Duty Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
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
            <Button onClick={handleAdd} disabled={submitting || !boatId || !crewMemberId}>
              {submitting ? 'Assigning…' : 'Assign Crew Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
