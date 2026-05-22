'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Ship, Anchor, Users, Fuel, Wrench, MapPin, AlertTriangle, Plus, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { DataTable } from '@/components/dashboard/data-table'
import { ExportCsvButton } from '@/components/dashboard/export-csv-button'
import { ModulePageHeader } from '@/components/dashboard/module-page-header'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useBoats, useTrips, useMaintenance, createBoat, useBoatPerformance, authFetchJson } from '@/lib/api'
import type { Boat, FishingTrip, MaintenanceRecord } from '@/lib/types'
import { toast } from 'sonner'

const typeLabels: Record<string, string> = {
  deep_sea: 'Deep Sea',
  lake: 'Lake',
  river: 'River',
  coastal: 'Coastal',
}

interface FuelLog {
  id: string
  boat_id: string
  trip_id: string | null
  liters: number
  cost: number
  logged_at: string
  notes: string | null
  boat_name?: string | null
}

interface GpsPosition {
  boat_id: string
  boat_name: string
  latitude: number
  longitude: number
  recorded_at: string
  speed_knots: number | null
}

function BoatGridEmpty({ filter }: { filter: string }) {
  return (
    <EmptyState
      icon={Ship}
      title="No boats found"
      description={
        filter === 'active'
          ? 'No vessels are currently marked active.'
          : filter === 'maintenance'
            ? 'No vessels are in maintenance right now.'
            : 'Register a boat to start managing your fleet.'
      }
    />
  )
}

export default function FleetPage() {
  const meta = useDashboardPageMeta({
    title: 'Fleet Management',
    description: 'Manage your boats, crew, and operations',
  })
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [fuelOpen, setFuelOpen] = useState(false)
  const [detailBoat, setDetailBoat] = useState<Boat | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [fuelLoading, setFuelLoading] = useState(false)
  const [fuelSummary, setFuelSummary] = useState({ total_liters: 0, total_cost: 0 })
  const [fuelBoatId, setFuelBoatId] = useState('')
  const [fuelLiters, setFuelLiters] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [fuelNotes, setFuelNotes] = useState('')
  const [reg, setReg] = useState('')
  const [boatName, setBoatName] = useState('')
  const [gpsPositions, setGpsPositions] = useState<GpsPosition[]>([])
  const [hullType, setHullType] = useState('fiber')
  const [capacityKg, setCapacityKg] = useState('')
  const [engineType, setEngineType] = useState('')
  const [engineHp, setEngineHp] = useState('')
  const [crewOpen, setCrewOpen] = useState(false)
  const [crewBoat, setCrewBoat] = useState<Boat | null>(null)
  const [crewList, setCrewList] = useState<
    { id: string; crew_name?: string; role: string; crew_member_id: string }[]
  >([])
  const [crewLoading, setCrewLoading] = useState(false)
  const [crewMemberId, setCrewMemberId] = useState('')
  const [crewRole, setCrewRole] = useState('deckhand')

  const { data: boatsData, isLoading, mutate } = useBoats()
  const { data: tripsData } = useTrips()
  const { data: maintenanceData } = useMaintenance()
  const { data: perfData, isLoading: perfLoading } = useBoatPerformance()

  const boats = boatsData?.data?.items || []
  const trips = tripsData?.data?.items || []
  const maintenance = maintenanceData?.data?.items || []

  const activeBoats = boats.filter((b: Boat) => b.status === 'active').length
  const ongoingTrips = trips.filter((t: FishingTrip) => t.status === 'ongoing').length
  const pendingMaintenance = maintenance.filter((m: MaintenanceRecord) => m.status !== 'completed').length
  const totalCrew = boats.reduce((sum: number, b: Boat) => sum + b.crew.length, 0)

  const fetchFuelLogs = useCallback(async () => {
    setFuelLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { logs: FuelLog[]; summary: { total_liters: number; total_cost: number } }
      }>('/api/v2/fishing-ops/fuel?limit=100')
      if (res.success && res.data) {
        setFuelLogs(res.data.logs)
        setFuelSummary(res.data.summary)
      }
    } catch {
      setFuelLogs([])
    } finally {
      setFuelLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFuelLogs()
  }, [fetchFuelLogs])

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: { positions: GpsPosition[] } }>(
      '/api/v2/fleet/telemetry?latest=1',
    )
      .then((res) => {
        if (res.success && res.data?.positions) setGpsPositions(res.data.positions)
      })
      .catch(() => setGpsPositions([]))
  }, [])

  const openCrewDialog = async (boat: Boat) => {
    setCrewBoat(boat)
    setCrewOpen(true)
    setCrewLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { crew: { id: string; crew_name?: string; role: string; crew_member_id: string }[] }
      }>(`/api/v2/fishing-ops/crew?boatId=${encodeURIComponent(boat.id)}`)
      setCrewList(res.success && res.data?.crew ? res.data.crew : [])
    } catch {
      setCrewList([])
    } finally {
      setCrewLoading(false)
    }
  }

  const handleAddCrew = async () => {
    if (!crewBoat || !crewMemberId.trim()) {
      toast.error('Crew member user ID required')
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
            boatId: crewBoat.id,
            crewMemberId: crewMemberId.trim(),
            role: crewRole,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not add crew')
        return
      }
      toast.success('Crew added')
      setCrewMemberId('')
      await openCrewDialog(crewBoat)
      mutate()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveCrew = async (assignmentId: string) => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/fishing-ops/crew?id=${encodeURIComponent(assignmentId)}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not remove')
        return
      }
      toast.success('Removed from crew')
      if (crewBoat) await openCrewDialog(crewBoat)
      mutate()
    } catch {
      toast.error('Network error')
    }
  }

  const handleLogFuel = async () => {
    if (!fuelBoatId || !fuelLiters || !fuelCost) {
      toast.error('Boat, liters, and cost are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/fishing-ops/fuel',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            boatId: fuelBoatId,
            liters: Number(fuelLiters),
            cost: Number(fuelCost),
            loggedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            notes: fuelNotes.trim() || null,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not log fuel')
        return
      }
      toast.success('Fuel logged')
      setFuelOpen(false)
      setFuelBoatId('')
      setFuelLiters('')
      setFuelCost('')
      setFuelNotes('')
      await fetchFuelLogs()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBoat = async () => {
    if (!reg.trim() || !boatName.trim()) {
      toast.error('Registration and name are required')
      return
    }
    setSubmitting(true)
    try {
      const json = await createBoat({
        registrationNumber: reg.trim(),
        name: boatName.trim(),
        type: hullType,
        capacityKg: capacityKg ? Number(capacityKg) : 500,
        engineType: engineType.trim() || undefined,
        enginePowerHp: engineHp ? Number(engineHp) : undefined,
      })
      if (!json.success) {
        toast.error(json.error || 'Could not create boat')
        return
      }
      toast.success('Boat added')
      setAddOpen(false)
      setReg('')
      setBoatName('')
      setCapacityKg('')
      setEngineType('')
      setEngineHp('')
      await mutate()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Boat
          </Button>
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register boat</DialogTitle>
            <DialogDescription>Creates a vessel in `boats` (boat owner / admin)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Registration number</Label>
              <Input value={reg} onChange={(e) => setReg(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={boatName} onChange={(e) => setBoatName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hull / material</Label>
              <Select value={hullType} onValueChange={setHullType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="wooden">Wooden</SelectItem>
                  <SelectItem value="steel">Steel</SelectItem>
                  <SelectItem value="aluminum">Aluminum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Capacity (kg)</Label>
                <Input type="number" value={capacityKg} onChange={(e) => setCapacityKg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Engine HP</Label>
                <Input type="number" value={engineHp} onChange={(e) => setEngineHp(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Engine type</Label>
              <Input value={engineType} onChange={(e) => setEngineType(e.target.value)} placeholder="Outboard" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBoat} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailBoat} onOpenChange={(open) => !open && setDetailBoat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailBoat?.name}</DialogTitle>
            <DialogDescription>{detailBoat?.registrationNumber}</DialogDescription>
          </DialogHeader>
          {detailBoat && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Status</span><p className="font-medium">{detailBoat.status}</p></div>
              <div><span className="text-muted-foreground">Type</span><p className="font-medium">{detailBoat.type}</p></div>
              <div><span className="text-muted-foreground">Capacity</span><p className="font-medium">{detailBoat.capacity?.toLocaleString()} kg</p></div>
              <div><span className="text-muted-foreground">Crew</span><p className="font-medium">{detailBoat.crew?.length ?? 0}</p></div>
              <div><span className="text-muted-foreground">GPS</span><p className="font-medium">{detailBoat.gpsEnabled ? 'On' : 'Off'}</p></div>
              <div><span className="text-muted-foreground">Trips</span><p className="font-medium">{detailBoat.totalTrips}</p></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailBoat(null)}>Close</Button>
            {detailBoat && (
              <Button onClick={() => { setDetailBoat(null); router.push(`/dashboard/trips?boatId=${detailBoat.id}`) }}>
                Start Trip
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={crewOpen} onOpenChange={setCrewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crew — {crewBoat?.name}</DialogTitle>
            <DialogDescription>Assign users to this vessel via the crew API.</DialogDescription>
          </DialogHeader>
          {crewLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading crew…</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {crewList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active crew on this boat.</p>
              ) : (
                crewList.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span>
                      {c.crew_name || c.crew_member_id}{' '}
                      <Badge variant="outline" className="ml-1 text-xs">
                        {c.role}
                      </Badge>
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveCrew(c.id)}>
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
          <div className="space-y-2 pt-2 border-t">
            <Label>Crew member user ID</Label>
            <Input
              value={crewMemberId}
              onChange={(e) => setCrewMemberId(e.target.value)}
              placeholder="User UUID"
            />
            <Label>Role</Label>
            <Select value={crewRole} onValueChange={setCrewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="captain">Captain</SelectItem>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="deckhand">Deckhand</SelectItem>
                <SelectItem value="nets_officer">Nets officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleAddCrew} disabled={submitting}>
              Add crew
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StatCardGrid>
        <StatCard
          title="Total Boats"
          value={boats.length}
          icon={<Ship className="h-4 w-4 text-muted-foreground" />}
          description={`${activeBoats} active`}
          loading={isLoading}
        />
        <StatCard
          title="Active Trips"
          value={ongoingTrips}
          icon={<Anchor className="h-4 w-4 text-muted-foreground" />}
          description="Currently fishing"
          loading={isLoading}
        />
        <StatCard
          title="Total Crew"
          value={totalCrew}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Across all boats"
          loading={isLoading}
        />
        <StatCard
          title="Pending Maintenance"
          value={pendingMaintenance}
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          description="Scheduled or in progress"
          loading={isLoading}
        />
      </StatCardGrid>

      {gpsPositions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Latest GPS (IoT)
            </CardTitle>
            <CardDescription>
              From vessel trackers — configure ingest at Integrations → IoT
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {gpsPositions.map((p) => (
              <div key={p.boat_id} className="flex justify-between gap-2 border-b pb-2 last:border-0">
                <span className="font-medium">{p.boat_name || p.boat_id.slice(0, 8)}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}
                  {p.speed_knots != null ? ` · ${p.speed_knots} kn` : ''}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="boats">
        <TabsList>
          <TabsTrigger value="boats">All Boats</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="maintenance">In Maintenance</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="boats" className="mt-6">
          {!isLoading && boats.length === 0 ? (
            <BoatGridEmpty filter="all" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {boats.map((boat: Boat) => (
                <BoatCard
                  key={boat.id}
                  boat={boat}
                  trips={trips}
                  onView={() => setDetailBoat(boat)}
                  onStartTrip={() => router.push(`/dashboard/trips?boatId=${boat.id}`)}
                  onMaintenance={() => router.push(`/dashboard/maintenance?boatId=${boat.id}`)}
                  onManageCrew={() => openCrewDialog(boat)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {(() => {
            const activeBoats = boats.filter((b: Boat) => b.status === 'active')
            if (!isLoading && activeBoats.length === 0) return <BoatGridEmpty filter="active" />
            return (
              <div className="grid gap-6 md:grid-cols-2">
                {activeBoats.map((boat: Boat) => (
                  <BoatCard
                    key={boat.id}
                    boat={boat}
                    trips={trips}
                    onView={() => setDetailBoat(boat)}
                    onStartTrip={() => router.push(`/dashboard/trips?boatId=${boat.id}`)}
                    onMaintenance={() => router.push(`/dashboard/maintenance?boatId=${boat.id}`)}
                    onManageCrew={() => openCrewDialog(boat)}
                  />
                ))}
              </div>
            )
          })()}
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          {(() => {
            const maintBoats = boats.filter((b: Boat) => b.status === 'maintenance')
            if (!isLoading && maintBoats.length === 0) return <BoatGridEmpty filter="maintenance" />
            return (
              <div className="grid gap-6 md:grid-cols-2">
                {maintBoats.map((boat: Boat) => (
                  <BoatCard
                    key={boat.id}
                    boat={boat}
                    trips={trips}
                    onView={() => setDetailBoat(boat)}
                    onStartTrip={() => router.push(`/dashboard/trips?boatId=${boat.id}`)}
                    onMaintenance={() => router.push(`/dashboard/maintenance?boatId=${boat.id}`)}
                    onManageCrew={() => openCrewDialog(boat)}
                  />
                ))}
              </div>
            )
          })()}
        </TabsContent>

        <TabsContent value="fuel" className="mt-6">
          <DataTable
            title="Boat fuel logs"
            description={`${fuelSummary.total_liters.toLocaleString()} L logged · KES ${fuelSummary.total_cost.toLocaleString()} total`}
            loading={fuelLoading}
            data={fuelLogs}
            emptyMessage="No fuel logs yet"
            actions={
              <div className="flex gap-2">
                <ExportCsvButton
                  data={fuelLogs.map((r) => ({
                    boat: r.boat_name || r.boat_id,
                    liters: r.liters,
                    cost: r.cost,
                    logged_at: new Date(r.logged_at).toLocaleString(),
                    notes: r.notes ?? '',
                  }))}
                  filename="boat-fuel-logs"
                  columns={[
                    { key: 'boat', label: 'Boat' },
                    { key: 'liters', label: 'Liters' },
                    { key: 'cost', label: 'Cost (KES)' },
                    { key: 'logged_at', label: 'Logged at' },
                    { key: 'notes', label: 'Notes' },
                  ]}
                />
                <Button onClick={() => setFuelOpen(true)}>
                  <Fuel className="mr-2 h-4 w-4" />
                  Log fuel
                </Button>
              </div>
            }
            columns={[
              {
                key: 'boat_name',
                header: 'Boat',
                cell: (row) => row.boat_name || row.boat_id.slice(0, 8),
              },
              {
                key: 'liters',
                header: 'Liters',
                cell: (row) => Number(row.liters).toLocaleString(),
              },
              {
                key: 'cost',
                header: 'Cost',
                cell: (row) => `KES ${Number(row.cost).toLocaleString()}`,
              },
              {
                key: 'logged_at',
                header: 'Logged',
                cell: (row) => new Date(row.logged_at).toLocaleString(),
              },
              {
                key: 'notes',
                header: 'Notes',
                cell: (row) => row.notes || '—',
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log fuel purchase</DialogTitle>
            <DialogDescription>Record fuel for a vessel from `boat_fuel_logs`</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Boat</Label>
              <Select value={fuelBoatId} onValueChange={setFuelBoatId}>
                <SelectTrigger><SelectValue placeholder="Select boat" /></SelectTrigger>
                <SelectContent>
                  {boats.map((b: Boat) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Liters</Label>
                <Input type="number" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cost (KES)</Label>
                <Input type="number" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={fuelNotes} onChange={(e) => setFuelNotes(e.target.value)} placeholder="Harbor refill" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFuelOpen(false)}>Cancel</Button>
            <Button onClick={handleLogFuel} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Catch and revenue by boat</CardTitle>
          <CardDescription>Aggregated from your recent trips (v2)</CardDescription>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (perfData?.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No trip totals yet.</p>
          ) : (
            <div className="relative w-full overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-3 font-medium">Boat</th>
                    <th className="text-right py-2 px-3 font-medium">Catch (kg)</th>
                    <th className="text-right py-2 px-3 font-medium">Revenue (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {(perfData?.data || []).map((row) => (
                    <tr key={row.boatId} className="border-b last:border-0">
                      <td className="py-2 px-3">{row.boatName}</td>
                      <td className="py-2 px-3 text-right">{row.catchKg.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">{row.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Upcoming and ongoing maintenance</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenance.map((record: MaintenanceRecord) => (
              <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{record.boatName}</p>
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={record.status} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {record.scheduledDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface BoatCardProps {
  boat: Boat
  trips: FishingTrip[]
  onView: () => void
  onStartTrip: () => void
  onMaintenance: () => void
  onManageCrew: () => void
}

function BoatCard({ boat, trips, onView, onStartTrip, onMaintenance, onManageCrew }: BoatCardProps) {
  const activeTrip = trips.find(t => t.boatId === boat.id && t.status === 'ongoing')
  const daysUntilLicenseExpiry = Math.ceil((new Date(boat.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const daysUntilInsuranceExpiry = Math.ceil((new Date(boat.insuranceExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{boat.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{boat.registrationNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={boat.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={onStartTrip}>Start Trip</DropdownMenuItem>
                <DropdownMenuItem onClick={onMaintenance}>Schedule Maintenance</DropdownMenuItem>
                <DropdownMenuItem onClick={onManageCrew}>Manage Crew</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{typeLabels[boat.type]}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Engine</p>
            <p className="font-medium">{boat.engineType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Capacity</p>
            <p className="font-medium">{boat.capacity.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Crew</p>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{boat.crew.length}</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{boat.totalTrips}</p>
              <p className="text-xs text-muted-foreground">Trips</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{(boat.totalCatch / 1000).toFixed(1)}T</p>
              <p className="text-xs text-muted-foreground">Total Catch</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{boat.fuelEfficiency}</p>
              <p className="text-xs text-muted-foreground">km/L</p>
            </div>
          </div>
        </div>

        {/* Active Trip */}
        {activeTrip && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Anchor className="h-4 w-4 text-muted-foreground" />
              <StatusBadge status="ongoing" label="Currently Fishing" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{activeTrip.fishingZone}</p>
          </div>
        )}

        {/* Alerts */}
        {(daysUntilLicenseExpiry <= 30 || daysUntilInsuranceExpiry <= 30) && (
          <div className="space-y-2">
            {daysUntilLicenseExpiry <= 30 && (
              <div className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <StatusBadge
                  status="warning"
                  label={`License expires in ${daysUntilLicenseExpiry} days`}
                />
              </div>
            )}
            {daysUntilInsuranceExpiry <= 30 && (
              <div className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <StatusBadge
                  status="warning"
                  label={`Insurance expires in ${daysUntilInsuranceExpiry} days`}
                />
              </div>
            )}
          </div>
        )}

        {/* GPS Status */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">GPS</span>
          </div>
          <StatusBadge
            status={boat.gpsEnabled ? 'active' : 'inactive'}
            label={boat.gpsEnabled ? 'Enabled' : 'Disabled'}
          />
        </div>
      </CardContent>
    </Card>
  )
}
