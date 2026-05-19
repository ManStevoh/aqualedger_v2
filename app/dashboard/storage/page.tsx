'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { Warehouse, Thermometer, AlertTriangle, TrendingUp, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { authFetchJson, createStorageFacility } from '@/lib/api'
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
import { toast } from 'sonner'

interface StorageFacility {
  id: string
  name: string
  location: string
  capacity: number
  currentStock: number
  temperature: number
  humidity: number
  fishTypes: string[]
  lastRestockDate: string
  status: 'operational' | 'maintenance' | 'offline'
}

export default function StoragePage() {
  const [facilities, setFacilities] = useState<StorageFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [facName, setFacName] = useState('')
  const [facCode, setFacCode] = useState('')
  const [facCounty, setFacCounty] = useState('')
  const [facCapacity, setFacCapacity] = useState('')
  const [facType, setFacType] = useState('cold_room')

  useEffect(() => {
    fetchStorageData()
  }, [])

  const fetchStorageData = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { facilities: Record<string, unknown>[] }
      }>('/api/v2/storage?type=units&limit=100')
      if (data.success && data.data?.facilities) {
        setFacilities(
          data.data.facilities.map((f) => ({
            id: f.id as string,
            name: (f.name as string) || '',
            location: (f.location as string) || (f.county as string) || '',
            capacity: Number(f.capacity_kg) || 0,
            currentStock: Number(f.current_stock_kg) || 0,
            temperature: Number(f.current_temperature) || 0,
            humidity: 0,
            fishTypes: [],
            lastRestockDate: '',
            status: ((f.status as string) || 'operational') as StorageFacility['status'],
          })),
        )
      } else {
        setFacilities([])
      }
    } catch (error) {
      console.error('Failed to fetch storage data:', error)
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddFacility = async () => {
    if (!facName.trim() || !facCode.trim() || !facCounty.trim() || !facCapacity) {
      toast.error('Name, code, county, and capacity are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await createStorageFacility({
        name: facName.trim(),
        code: facCode.trim(),
        county: facCounty.trim(),
        capacityKg: Number(facCapacity),
        type: facType,
      })
      if (!result.success) {
        toast.error(result.error || 'Failed to create facility')
        return
      }
      toast.success('Storage facility created')
      setShowAddDialog(false)
      setFacName('')
      setFacCode('')
      setFacCounty('')
      setFacCapacity('')
      await fetchStorageData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0)
  const totalStock = facilities.reduce((sum, f) => sum + f.currentStock, 0)
  const capacityUtilization = Math.round((totalStock / totalCapacity) * 100)
  const operationalFacilities = facilities.filter(f => f.status === 'operational').length

  const chartData = facilities.map(f => ({
    name: f.name.split(' ')[0],
    capacity: f.capacity,
    current: f.currentStock,
    utilization: Math.round((f.currentStock / f.capacity) * 100),
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Facilities</h1>
          <p className="text-muted-foreground">Monitor cold storage and inventory</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4" />
          Add Facility
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Operational Facilities"
          value={operationalFacilities}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Total Stock"
          value={`${totalStock.toLocaleString()} kg`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 18, isPositive: true }}
        />
        <StatCard
          title="Capacity Utilization"
          value={`${capacityUtilization}%`}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Avg Temperature"
          value="-4°C"
          icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storage Utilization</CardTitle>
            <CardDescription>Capacity used by facility</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="capacity" fill="#3b82f6" name="Capacity (kg)" />
                <Bar yAxisId="left" dataKey="current" fill="#10b981" name="Current Stock (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Climate Control</CardTitle>
            <CardDescription>Temperature and humidity by facility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facilities.map((facility) => (
                <div key={facility.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{facility.name}</p>
                    <Badge variant={facility.status === 'operational' ? 'default' : 'secondary'}>
                      {facility.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4" />
                      <span>{facility.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity: {facility.humidity}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Storage Facilities</CardTitle>
          <CardDescription>Complete inventory of cold storage units</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Capacity</th>
                  <th className="text-left py-3 px-4 font-medium">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium">Temperature</th>
                  <th className="text-left py-3 px-4 font-medium">Humidity</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => {
                  const utilization = Math.round((facility.currentStock / facility.capacity) * 100)
                  return (
                    <tr key={facility.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{facility.name}</td>
                      <td className="py-3 px-4">{facility.location}</td>
                      <td className="py-3 px-4">{facility.capacity.toLocaleString()} kg</td>
                      <td className="py-3 px-4">{facility.currentStock.toLocaleString()} kg</td>
                      <td className="py-3 px-4 font-semibold">{utilization}%</td>
                      <td className="py-3 px-4">{facility.temperature}°C</td>
                      <td className="py-3 px-4">{facility.humidity}%</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(facility.status)}>
                          {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add storage facility</DialogTitle>
            <DialogDescription>Register a cold storage unit in storage_facilities</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={facName} onChange={(e) => setFacName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={facCode} onChange={(e) => setFacCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={facCounty} onChange={(e) => setFacCounty(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Capacity (kg)</Label>
                <Input type="number" value={facCapacity} onChange={(e) => setFacCapacity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={facType} onValueChange={setFacType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold_room">Cold room</SelectItem>
                    <SelectItem value="freezer">Freezer</SelectItem>
                    <SelectItem value="ice_plant">Ice plant</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFacility} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create facility'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
