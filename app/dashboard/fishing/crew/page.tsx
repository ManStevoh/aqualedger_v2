'use client'

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
import { Input } from '@/components/ui/input'
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
import { UserCog, Plus, Trash2 } from 'lucide-react'
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

const roleLabels: Record<string, string> = {
  captain: 'Captain',
  engineer: 'Engineer',
  deckhand: 'Deckhand',
  nets_officer: 'Nets officer',
}

export default function CrewPage() {
  const [crew, setCrew] = useState<CrewRow[]>([])
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

  useEffect(() => {
    fetchCrew()
  }, [fetchCrew])

  const handleAdd = async () => {
    if (!boatId || !crewMemberId.trim()) {
      toast.error('Boat and crew member user ID are required')
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
            crewMemberId: crewMemberId.trim(),
            role,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not add crew')
        return
      }
      toast.success('Crew member assigned')
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-7 w-7 text-primary" />
            Boat crew
          </h1>
          <p className="text-muted-foreground">Assign fishermen and officers to vessels.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add crew
        </Button>
      </div>

      <div className="flex items-center gap-3 max-w-xs">
        <Label className="shrink-0">Boat</Label>
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
        title="Active crew"
        loading={loading}
        data={crew}
        emptyMessage="No crew assignments"
        columns={[
          { key: 'boat_name', header: 'Boat', cell: (row) => row.boat_name || '—' },
          { key: 'crew_name', header: 'Member', cell: (row) => row.crew_name || row.crew_member_id },
          { key: 'crew_email', header: 'Email', cell: (row) => row.crew_email || '—' },
          {
            key: 'role',
            header: 'Role',
            cell: (row) => (
              <Badge variant="outline">{roleLabels[row.role] || row.role}</Badge>
            ),
          },
          {
            key: 'joined_date',
            header: 'Joined',
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add crew member</DialogTitle>
            <DialogDescription>
              Link an existing user ID to a boat (captain, engineer, deckhand, nets officer).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Boat</Label>
              <Select value={boatId} onValueChange={setBoatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select boat" />
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
            <div className="space-y-2">
              <Label>Crew member user ID</Label>
              <Input
                value={crewMemberId}
                onChange={(e) => setCrewMemberId(e.target.value)}
                placeholder="UUID from Users / Team"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
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
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? 'Adding…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
