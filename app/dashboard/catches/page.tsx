'use client'

import { useState } from 'react'
import { Fish, DollarSign, Scale, Star, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { DataTable } from '@/components/dashboard/data-table'
import { useCatches, useTrips, logCatch, useFishSpecies } from '@/lib/api'
import { toast } from 'sonner'
import { useCatchDistribution } from '@/lib/api'
import type { Catch, FishingTrip } from '@/lib/types'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const gradeColors: Record<string, string> = {
  premium: 'bg-green-100 text-green-700 border-green-200',
  export: 'bg-blue-100 text-blue-700 border-blue-200',
  local: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function CatchesPage() {
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState('')
  const [fishType, setFishType] = useState('')
  const [weight, setWeight] = useState('')
  const [grade, setGrade] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [isLogging, setIsLogging] = useState(false)

  const { data: catchesData, isLoading, mutate } = useCatches()
  const { data: tripsData } = useTrips()
  const { data: speciesList = [] } = useFishSpecies()
  const { data: distributionData } = useCatchDistribution()

  const catches = catchesData?.data?.items || []
  const trips = tripsData?.data?.items || []
  const distribution = distributionData?.data || []
  const ongoingTrips = trips.filter((t: FishingTrip) => t.status === 'ongoing')

  const totalWeight = catches.reduce((sum: number, c: Catch) => sum + c.weight, 0)
  const totalValue = catches.reduce((sum: number, c: Catch) => sum + c.totalValue, 0)
  const premiumCatch = catches.filter((c: Catch) => c.grade === 'premium').reduce((sum: number, c: Catch) => sum + c.weight, 0)
  const avgPrice = catches.length > 0 ? totalValue / totalWeight : 0

  const handleLogCatch = async () => {
    if (!selectedTrip || !fishType || !weight || !grade || !pricePerKg) return

    setIsLogging(true)
    try {
      const json = await logCatch({
        tripId: selectedTrip,
        fishType,
        weight: Number(weight),
        grade,
        pricePerKg: Number(pricePerKg),
      })
      if (!json.success) {
        toast.error(json.error || 'Could not log catch')
        return
      }
      toast.success('Catch logged')
      mutate()
      setShowLogDialog(false)
      setSelectedTrip('')
      setFishType('')
      setWeight('')
      setGrade('')
      setPricePerKg('')
    } catch {
      toast.error('Network error')
    } finally {
      setIsLogging(false)
    }
  }

  const columns = [
    {
      key: 'fishType',
      header: 'Fish Type',
      cell: (item: Catch) => (
        <div className="flex items-center gap-2">
          <Fish className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.fishType}</span>
        </div>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      cell: (item: Catch) => `${item.weight.toLocaleString()} kg`,
    },
    {
      key: 'grade',
      header: 'Grade',
      cell: (item: Catch) => (
        <Badge variant="outline" className={gradeColors[item.grade]}>
          {item.grade}
        </Badge>
      ),
    },
    {
      key: 'pricePerKg',
      header: 'Price/kg',
      cell: (item: Catch) => `KES ${item.pricePerKg}`,
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      cell: (item: Catch) => (
        <span className="font-semibold text-green-600">
          KES {item.totalValue.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'buyerName',
      header: 'Buyer',
      cell: (item: Catch) => item.buyerName || '-',
    },
    {
      key: 'soldAt',
      header: 'Sold At',
      cell: (item: Catch) => item.soldAt ? new Date(item.soldAt).toLocaleDateString() : '-',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catch Management</h1>
          <p className="text-muted-foreground">
            Log, track, and sell your fish catches
          </p>
        </div>
        <Button onClick={() => setShowLogDialog(true)} disabled={ongoingTrips.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Log Catch
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="Total Catch"
          value={`${(totalWeight / 1000).toFixed(1)}T`}
          icon={<Fish className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8.5, isPositive: true }}
          description="This month"
          loading={isLoading}
        />
        <StatCard
          title="Total Value"
          value={`KES ${(totalValue / 1000000).toFixed(2)}M`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12.3, isPositive: true }}
          description="Market value"
          loading={isLoading}
        />
        <StatCard
          title="Premium Grade"
          value={`${(premiumCatch / 1000).toFixed(1)}T`}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          description={`${((premiumCatch / totalWeight) * 100 || 0).toFixed(0)}% of total`}
          loading={isLoading}
        />
        <StatCard
          title="Avg Price"
          value={`KES ${avgPrice.toFixed(0)}/kg`}
          icon={<Scale className="h-4 w-4 text-muted-foreground" />}
          description="Across all grades"
          loading={isLoading}
        />
      </StatCardGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Distribution Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Catch Distribution</CardTitle>
            <CardDescription>By fish type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distribution.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Catches */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Catches</CardTitle>
            <CardDescription>Latest logged catches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {catches.slice(0, 5).map((c: Catch) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Fish className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{c.fishType}</p>
                      <p className="text-sm text-muted-foreground">{c.weight} kg</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">KES {c.totalValue.toLocaleString()}</p>
                    <Badge variant="outline" className={gradeColors[c.grade]}>
                      {c.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Catches Table */}
      <DataTable
        title="All Catches"
        description="Complete catch history"
        columns={columns}
        data={catches}
        loading={isLoading}
        emptyMessage="No catches logged yet"
      />

      {/* Log Catch Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log New Catch</DialogTitle>
            <DialogDescription>
              Record catch details from an ongoing trip
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Trip</Label>
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose ongoing trip" />
                </SelectTrigger>
                <SelectContent>
                  {ongoingTrips.map((trip: FishingTrip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.boatName} - {trip.fishingZone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fish Type</Label>
                <Select value={fishType} onValueChange={setFishType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fish species" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesList.map((sp) => (
                      <SelectItem key={sp.id} value={sp.name}>
                        {sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="export">Export Quality</SelectItem>
                    <SelectItem value="local">Local Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price per kg (KES)</Label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                />
              </div>
            </div>
            {weight && pricePerKg && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-bold text-green-600">
                    KES {(Number(weight) * Number(pricePerKg)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLogCatch}
              disabled={isLogging || !selectedTrip || !fishType || !weight || !grade || !pricePerKg}
            >
              {isLogging ? 'Logging...' : 'Log Catch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
