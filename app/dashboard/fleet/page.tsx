'use client'

import { useState } from 'react'
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
import { useBoats, useTrips, useMaintenance, createBoat, useBoatPerformance } from '@/lib/api'
import type { Boat, FishingTrip, MaintenanceRecord } from '@/lib/types'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  docked: 'bg-blue-100 text-blue-700 border-blue-200',
  retired: 'bg-gray-100 text-gray-700 border-gray-200',
}

const typeLabels: Record<string, string> = {
  deep_sea: 'Deep Sea',
  lake: 'Lake',
  river: 'River',
  coastal: 'Coastal',
}

export default function FleetPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reg, setReg] = useState('')
  const [boatName, setBoatName] = useState('')
  const [hullType, setHullType] = useState('fiber')
  const [capacityKg, setCapacityKg] = useState('')
  const [engineType, setEngineType] = useState('')
  const [engineHp, setEngineHp] = useState('')

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">
            Manage your boats, crew, and operations
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Boat
        </Button>
      </div>

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

      <Tabs defaultValue="boats">
        <TabsList>
          <TabsTrigger value="boats">All Boats</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="maintenance">In Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="boats" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {boats.map((boat: Boat) => (
              <BoatCard key={boat.id} boat={boat} trips={trips} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {boats
              .filter((b: Boat) => b.status === 'active')
              .map((boat: Boat) => (
                <BoatCard key={boat.id} boat={boat} trips={trips} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {boats
              .filter((b: Boat) => b.status === 'maintenance')
              .map((boat: Boat) => (
                <BoatCard key={boat.id} boat={boat} trips={trips} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

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
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    record.status === 'in_progress' ? 'bg-yellow-100' : 
                    record.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Wrench className={`h-5 w-5 ${
                      record.status === 'in_progress' ? 'text-yellow-600' : 
                      record.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{record.boatName}</p>
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={
                    record.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700' :
                    record.status === 'completed' ? 'bg-green-50 text-green-700' : ''
                  }>
                    {record.status.replace('_', ' ')}
                  </Badge>
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
}

function BoatCard({ boat, trips }: BoatCardProps) {
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
            <Badge variant="outline" className={statusColors[boat.status]}>
              {boat.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Start Trip</DropdownMenuItem>
                <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                <DropdownMenuItem>Manage Crew</DropdownMenuItem>
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
          <div className="rounded-lg bg-green-50 p-3">
            <div className="flex items-center gap-2 text-green-700">
              <Anchor className="h-4 w-4" />
              <span className="font-medium text-sm">Currently Fishing</span>
            </div>
            <p className="text-sm text-green-600 mt-1">{activeTrip.fishingZone}</p>
          </div>
        )}

        {/* Alerts */}
        {(daysUntilLicenseExpiry <= 30 || daysUntilInsuranceExpiry <= 30) && (
          <div className="space-y-2">
            {daysUntilLicenseExpiry <= 30 && (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>License expires in {daysUntilLicenseExpiry} days</span>
              </div>
            )}
            {daysUntilInsuranceExpiry <= 30 && (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Insurance expires in {daysUntilInsuranceExpiry} days</span>
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
          <Badge variant="outline" className={boat.gpsEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
            {boat.gpsEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
