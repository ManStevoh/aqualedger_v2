'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatCard } from '@/components/dashboard/stat-card'
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
import { MapPin, Search, Plus, Ship, Users, Fish } from 'lucide-react'
import { toast } from 'sonner'
import { authFetchJson, createLandingSite, useBMUs } from '@/lib/api'
import { useAppStore } from '@/lib/store'

type SiteRow = {
  id: string
  name: string
  county: string
  bmu_id: string | null
  bmu_name?: string
  latitude?: string | number | null
  longitude?: string | number | null
  facilities?: unknown
  status: string
}

function parseFacilities(f: unknown): string[] {
  if (Array.isArray(f)) return f.map(String)
  if (typeof f === 'string') {
    try {
      const j = JSON.parse(f) as unknown
      return Array.isArray(j) ? j.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

export default function LandingSitesPage() {
  const { currentUser } = useAppStore()
  const { data: bmuData } = useBMUs()
  const bmus = bmuData?.data?.items || []

  const [sites, setSites] = useState<SiteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCounty, setNewCounty] = useState('')
  const [newBmuId, setNewBmuId] = useState('')

  const canCreate =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'investor' ||
    currentUser?.role === 'bmu_official'

  const load = async () => {
    setLoading(true)
    try {
      const json = await authFetchJson<{
        success: boolean
        data?: { sites: SiteRow[] }
        error?: string
      }>('/api/v2/landing-sites')
      if (json.success && json.data?.sites) {
        setSites(json.data.sites)
      } else {
        setSites([])
        toast.error(json.error || 'Failed to load sites')
      }
    } catch {
      toast.error('Network error')
      setSites([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.county.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = async () => {
    if (!newName.trim() || !newCounty.trim()) {
      toast.error('Name and county required')
      return
    }
    setSubmitting(true)
    try {
      const json = await createLandingSite({
        name: newName.trim(),
        county: newCounty.trim(),
        bmuId: newBmuId && newBmuId !== '_none' ? newBmuId : undefined,
      })
      if (!json.success) {
        toast.error(json.error || 'Could not create site')
        return
      }
      toast.success('Landing site created')
      setDialogOpen(false)
      setNewName('')
      setNewCounty('')
      setNewBmuId('')
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Landing sites"
      description="Data from landing_sites (active only)"
      actions={
        <Button onClick={() => setDialogOpen(true)} disabled={!canCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add landing site
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Sites shown"
          value={loading ? '…' : sites.length}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Counties"
          value={loading ? '…' : new Set(sites.map((s) => s.county)).size}
          icon={<Ship className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard title="With BMU link" value={loading ? '…' : sites.filter((s) => s.bmu_id).length} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Status" value="Active" icon={<Fish className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sites…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full">Loading…</p>
        ) : (
          filteredSites.map((site) => {
            const facilities = parseFacilities(site.facilities)
            return (
              <Card key={site.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 shrink-0" />
                        {site.name}
                      </CardTitle>
                      <CardDescription>
                        {site.county} {site.bmu_name ? `· ${site.bmu_name}` : ''}
                      </CardDescription>
                    </div>
                    <StatusBadge status={site.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {site.latitude != null && site.longitude != null && (
                    <p className="text-muted-foreground">
                      {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                    </p>
                  )}
                  {facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {facilities.slice(0, 6).map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New landing site</DialogTitle>
            <DialogDescription>Creates a row in `landing_sites` (BMU officials / super admin)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Input value={newCounty} onChange={(e) => setNewCounty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>BMU (optional)</Label>
              <Select value={newBmuId || '_none'} onValueChange={setNewBmuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to BMU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {bmus.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
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
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
