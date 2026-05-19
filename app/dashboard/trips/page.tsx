'use client'

import { useState } from 'react'
import { Anchor, Ship, Clock, Fish, DollarSign, Fuel, Plus, Play, Square, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { useTrips, useBoats, createTrip, completeTrip } from '@/lib/api'
import type { FishingTrip, Boat } from '@/lib/types'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700 border-blue-200',
  ongoing: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default function TripsPage() {
  const [showNewTripDialog, setShowNewTripDialog] = useState(false)
  const [selectedBoat, setSelectedBoat] = useState('')
  const [fishingZone, setFishingZone] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [endingId, setEndingId] = useState<string | null>(null)

  const { data: tripsData, isLoading, mutate } = useTrips()
  const { data: boatsData } = useBoats()

  const trips = tripsData?.data?.items || []
  const boats = boatsData?.data?.items || []

  const ongoingTrips = trips.filter((t: FishingTrip) => t.status === 'ongoing').length
  const completedTrips = trips.filter((t: FishingTrip) => t.status === 'completed').length
  const totalCatch = trips.reduce((sum: number, t: FishingTrip) => sum + t.totalCatch, 0)
  const totalRevenue = trips.reduce((sum: number, t: FishingTrip) => sum + t.totalRevenue, 0)

  const handleCreateTrip = async () => {
    if (!selectedBoat || !fishingZone) return

    setIsCreating(true)
    const boat = boats.find((b: Boat) => b.id === selectedBoat)
    if (boat) {
      try {
        const json = await createTrip({
          boatId: selectedBoat,
          captainId: boat.crew[0]?.id || '',
          crew: boat.crew.slice(1).map((c: { id: string }) => c.id),
          fishingZone,
        })
        if (!json.success) {
          toast.error(json.error || 'Could not start trip')
        } else {
          toast.success('Trip started')
          mutate()
          setShowNewTripDialog(false)
          setSelectedBoat('')
          setFishingZone('')
        }
      } catch {
        toast.error('Network error')
      }
    }
    setIsCreating(false)
  }

  const handleEndTrip = async (tripId: string) => {
    setEndingId(tripId)
    try {
      const json = await completeTrip(tripId)
      if (!json.success) {
        toast.error(json.error || 'Could not complete trip')
        return
      }
      toast.success('Trip completed')
      await mutate()
    } catch {
      toast.error('Network error')
    } finally {
      setEndingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fishing Trips</h1>
          <p className="text-muted-foreground">
            Manage and track fishing operations
          </p>
        </div>
        <Button onClick={() => setShowNewTripDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="Ongoing Trips"
          value={ongoingTrips}
          icon={<Anchor className="h-4 w-4 text-muted-foreground" />}
          description="Currently active"
          loading={isLoading}
        />
        <StatCard
          title="Completed Trips"
          value={completedTrips}
          icon={<Ship className="h-4 w-4 text-muted-foreground" />}
          description="This month"
          loading={isLoading}
        />
        <StatCard
          title="Total Catch"
          value={`${(totalCatch / 1000).toFixed(1)}T`}
          icon={<Fish className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8.5, isPositive: true }}
          description="All trips"
          loading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${(totalRevenue / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12.3, isPositive: true }}
          description="From catches"
          loading={isLoading}
        />
      </StatCardGrid>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Trips</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TripsList trips={trips} onEndTrip={handleEndTrip} endingId={endingId} />
        </TabsContent>
        <TabsContent value="ongoing" className="mt-6">
          <TripsList
            trips={trips.filter((t: FishingTrip) => t.status === 'ongoing')}
            onEndTrip={handleEndTrip}
            endingId={endingId}
          />
        </TabsContent>
        <TabsContent value="planned" className="mt-6">
          <TripsList
            trips={trips.filter((t: FishingTrip) => t.status === 'planned')}
            onEndTrip={handleEndTrip}
            endingId={endingId}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <TripsList
            trips={trips.filter((t: FishingTrip) => t.status === 'completed')}
            onEndTrip={handleEndTrip}
            endingId={endingId}
          />
        </TabsContent>
      </Tabs>

      {/* New Trip Dialog */}
      <Dialog open={showNewTripDialog} onOpenChange={setShowNewTripDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Trip</DialogTitle>
            <DialogDescription>
              Select a boat and fishing zone to begin a new trip
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Boat</Label>
              <Select value={selectedBoat} onValueChange={setSelectedBoat}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a boat" />
                </SelectTrigger>
                <SelectContent>
                  {boats
                    .filter((b: Boat) => b.status === 'active')
                    .map((boat: Boat) => (
                      <SelectItem key={boat.id} value={boat.id}>
                        {boat.name} ({boat.registrationNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fishing Zone</Label>
              <Select value={fishingZone} onValueChange={setFishingZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zone A - Mombasa Deep Waters">Zone A - Mombasa Deep Waters</SelectItem>
                  <SelectItem value="Zone B - Watamu Reef">Zone B - Watamu Reef</SelectItem>
                  <SelectItem value="Zone C - Malindi Coast">Zone C - Malindi Coast</SelectItem>
                  <SelectItem value="Lake Victoria - Dunga Beach">Lake Victoria - Dunga Beach</SelectItem>
                  <SelectItem value="Lake Victoria - Kisumu Bay">Lake Victoria - Kisumu Bay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedBoat && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Selected Boat Details</p>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>Crew: {boats.find((b: Boat) => b.id === selectedBoat)?.crew.length || 0} members</p>
                  <p>Capacity: {boats.find((b: Boat) => b.id === selectedBoat)?.capacity.toLocaleString() || 0} kg</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTripDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTrip} disabled={isCreating || !selectedBoat || !fishingZone}>
              <Play className="mr-2 h-4 w-4" />
              {isCreating ? 'Starting...' : 'Start Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TripsListProps {
  trips: FishingTrip[]
  onEndTrip: (id: string) => void
  endingId: string | null
}

function TripsList({ trips, onEndTrip, endingId }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No trips found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} onEndTrip={onEndTrip} endingId={endingId} />
      ))}
    </div>
  )
}

function TripCard({
  trip,
  onEndTrip,
  endingId,
}: {
  trip: FishingTrip
  onEndTrip: (id: string) => void
  endingId: string | null
}) {
  const duration = trip.endTime
    ? Math.round((new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / (1000 * 60 * 60))
    : Math.round((Date.now() - new Date(trip.startTime).getTime()) / (1000 * 60 * 60))

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              trip.status === 'ongoing' ? 'bg-green-100' : 
              trip.status === 'completed' ? 'bg-gray-100' : 'bg-blue-100'
            }`}>
              <Anchor className={`h-6 w-6 ${
                trip.status === 'ongoing' ? 'text-green-600' : 
                trip.status === 'completed' ? 'text-gray-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{trip.boatName}</h3>
                <Badge variant="outline" className={statusColors[trip.status]}>
                  {trip.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{trip.fishingZone}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Captain: {trip.captainName} | Crew: {trip.crew.length + 1}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center sm:text-right">
            <div>
              <div className="flex items-center gap-1 justify-center sm:justify-end text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Duration</span>
              </div>
              <p className="font-semibold">{duration}h</p>
            </div>
            <div>
              <div className="flex items-center gap-1 justify-center sm:justify-end text-muted-foreground">
                <Fish className="h-3 w-3" />
                <span className="text-xs">Catch</span>
              </div>
              <p className="font-semibold">{trip.totalCatch.toLocaleString()} kg</p>
            </div>
            <div>
              <div className="flex items-center gap-1 justify-center sm:justify-end text-muted-foreground">
                <Fuel className="h-3 w-3" />
                <span className="text-xs">Fuel</span>
              </div>
              <p className="font-semibold">{trip.fuelUsed}L</p>
            </div>
            <div>
              <div className="flex items-center gap-1 justify-center sm:justify-end text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span className="text-xs">Revenue</span>
              </div>
              <p className="font-semibold text-green-600">
                {trip.totalRevenue > 0 ? `KES ${(trip.totalRevenue / 1000).toFixed(0)}K` : '-'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            {trip.status === 'ongoing' && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={endingId === trip.id}
                onClick={() => onEndTrip(trip.id)}
              >
                <Square className="mr-2 h-4 w-4" />
                {endingId === trip.id ? 'Ending…' : 'End Trip'}
              </Button>
            )}
          </div>
        </div>

        {trip.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">{trip.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
