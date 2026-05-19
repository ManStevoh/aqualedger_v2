'use client'

import { useState } from 'react'
import { Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useMaintenance, useBoats, scheduleMaintenance } from '@/lib/api'
import { toast } from 'sonner'
import type { MaintenanceRecord, Boat } from '@/lib/types'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}

const typeColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  emergency: 'bg-red-100 text-red-700',
  inspection: 'bg-purple-100 text-purple-700',
}

export default function MaintenancePage() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedBoat, setSelectedBoat] = useState('')
  const [maintenanceType, setMaintenanceType] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [technicianName, setTechnicianName] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const { data: maintenanceData, isLoading, mutate } = useMaintenance()
  const { data: boatsData } = useBoats()

  const records = maintenanceData?.data?.items || []
  const boats = boatsData?.data?.items || []

  const scheduled = records.filter((r: MaintenanceRecord) => r.status === 'scheduled').length
  const inProgress = records.filter((r: MaintenanceRecord) => r.status === 'in_progress').length
  const completed = records.filter((r: MaintenanceRecord) => r.status === 'completed').length
  const totalCost = records.reduce((sum: number, r: MaintenanceRecord) => sum + r.cost, 0)

  const handleSchedule = async () => {
    if (!selectedBoat || !maintenanceType || !description || !cost || !technicianName || !scheduledDate) return

    setIsScheduling(true)
    try {
      const json = await scheduleMaintenance({
        boatId: selectedBoat,
        type: maintenanceType,
        description,
        cost: Number(cost),
        technicianName,
        scheduledDate,
      })
      if (!json.success) {
        toast.error(json.error || 'Could not schedule')
        return
      }
      toast.success('Maintenance scheduled')
      mutate()
      setShowScheduleDialog(false)
      setSelectedBoat('')
      setMaintenanceType('')
      setDescription('')
      setCost('')
      setTechnicianName('')
      setScheduledDate('')
    } catch {
      toast.error('Network error')
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Schedule and track boat maintenance
          </p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="Scheduled"
          value={scheduled}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          description="Upcoming maintenance"
          loading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          description="Currently being serviced"
          loading={isLoading}
        />
        <StatCard
          title="Completed"
          value={completed}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description="This month"
          loading={isLoading}
        />
        <StatCard
          title="Total Cost"
          value={`KES ${totalCost.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="All maintenance"
          loading={isLoading}
        />
      </StatCardGrid>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <MaintenanceList records={records} />
        </TabsContent>
        <TabsContent value="scheduled" className="mt-6">
          <MaintenanceList records={records.filter((r: MaintenanceRecord) => r.status === 'scheduled')} />
        </TabsContent>
        <TabsContent value="in_progress" className="mt-6">
          <MaintenanceList records={records.filter((r: MaintenanceRecord) => r.status === 'in_progress')} />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <MaintenanceList records={records.filter((r: MaintenanceRecord) => r.status === 'completed')} />
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Schedule maintenance for one of your boats
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Boat</Label>
                <Select value={selectedBoat} onValueChange={setSelectedBoat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose boat" />
                  </SelectTrigger>
                  <SelectContent>
                    {boats.map((boat: Boat) => (
                      <SelectItem key={boat.id} value={boat.id}>
                        {boat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Maintenance Type</Label>
                <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the maintenance work needed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Cost (KES)</Label>
                <Input
                  type="number"
                  placeholder="Enter cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Technician Name</Label>
              <Input
                placeholder="Enter technician name"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isScheduling || !selectedBoat || !maintenanceType || !description || !cost || !technicianName || !scheduledDate}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MaintenanceList({ records }: { records: MaintenanceRecord[] }) {
  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No maintenance records found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${typeColors[record.type]}`}>
                  {record.type === 'emergency' ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : record.type === 'inspection' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Wrench className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{record.boatName}</h3>
                    <Badge variant="outline" className={statusColors[record.status]}>
                      {record.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{record.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Technician: {record.technicianName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="font-semibold">KES {record.cost.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="font-medium">{record.scheduledDate}</p>
                </div>
                {record.status !== 'completed' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {record.status === 'scheduled' ? 'Start' : 'Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {record.parts.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">Parts: {record.parts.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
