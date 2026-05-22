'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { Users, MapPin, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { authFetchJson, createBmu } from '@/lib/api'
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
import { toast } from 'sonner'

interface BMU {
  id: string
  name: string
  location: string
  region: string
  members: number
  activeBoats: number
  totalCatches: number
  revenue: number
  status: 'active' | 'inactive'
  manager: string
}

export default function BMUPage() {
  const [bmus, setBMUs] = useState<BMU[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bmuName, setBmuName] = useState('')
  const [bmuCode, setBmuCode] = useState('')
  const [bmuCounty, setBmuCounty] = useState('')

  useEffect(() => {
    fetchBMUData()
  }, [])

  const fetchBMUData = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { bmus: Record<string, unknown>[] }
      }>('/api/v2/bmu?resource=bmus&limit=100')
      if (data.success && data.data?.bmus) {
        setBMUs(
          data.data.bmus.map((b) => ({
            id: b.id as string,
            name: (b.name as string) || '',
            location: (b.landing_site_name as string) || (b.county as string) || '',
            region: (b.county as string) || '',
            members: Number(b.total_members) || 0,
            activeBoats: Number(b.total_boats) || 0,
            totalCatches: 0,
            revenue: 0,
            status: (b.status as string) === 'active' ? 'active' : 'inactive',
            manager: (b.chairman_name as string) || '—',
          })),
        )
      } else {
        setBMUs([])
      }
    } catch (error) {
      console.error('Failed to fetch BMU data:', error)
      setBMUs([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddBmu = async () => {
    if (!bmuName.trim() || !bmuCode.trim() || !bmuCounty.trim()) {
      toast.error('Name, code, and county are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await createBmu({ name: bmuName.trim(), code: bmuCode.trim(), county: bmuCounty.trim() })
      if (!result.success) {
        toast.error(result.error || 'Failed to create BMU')
        return
      }
      toast.success('BMU created')
      setShowAddDialog(false)
      setBmuName('')
      setBmuCode('')
      setBmuCounty('')
      await fetchBMUData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const activeBMUs = bmus.filter(b => b.status === 'active').length
  const totalMembers = bmus.reduce((sum, b) => sum + b.members, 0)
  const totalRevenue = bmus.reduce((sum, b) => sum + b.revenue, 0)
  const avgCatchesPerBMU = bmus.reduce((sum, b) => sum + b.totalCatches, 0) / (bmus.length || 1)

  const chartData = bmus.map(bmu => ({
    name: bmu.name,
    value: bmu.revenue,
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <DashboardPageLayout
      title="Beach Management Units"
      description="Manage and monitor all BMUs"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Active BMUs"
          value={activeBMUs}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Avg Catches/BMU"
          value={Math.round(avgCatchesPerBMU)}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Revenue by BMU</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BMU Performance</CardTitle>
            <CardDescription>Key metrics by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bmus.map((bmu) => (
                <div key={bmu.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{bmu.name}</p>
                    <p className="text-sm text-muted-foreground">{bmu.location} • {bmu.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${bmu.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{bmu.members} members</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All BMUs</CardTitle>
          <CardDescription>Complete list of Beach Management Units</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Members</th>
                  <th className="text-left py-3 px-4 font-medium">Active Boats</th>
                  <th className="text-left py-3 px-4 font-medium">Catches</th>
                  <th className="text-left py-3 px-4 font-medium">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium">Manager</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bmus.map((bmu) => (
                  <tr key={bmu.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{bmu.name}</td>
                    <td className="py-3 px-4">{bmu.location}</td>
                    <td className="py-3 px-4">{bmu.members}</td>
                    <td className="py-3 px-4">{bmu.activeBoats}</td>
                    <td className="py-3 px-4">{bmu.totalCatches}</td>
                    <td className="py-3 px-4 font-semibold">${bmu.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">{bmu.manager}</td>
                    <td className="py-3 px-4">
                      <Badge variant={bmu.status === 'active' ? 'default' : 'secondary'}>
                        {bmu.status.charAt(0).toUpperCase() + bmu.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add BMU</DialogTitle>
            <DialogDescription>Register a new Beach Management Unit</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={bmuName} onChange={(e) => setBmuName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={bmuCode} onChange={(e) => setBmuCode(e.target.value)} placeholder="BMU-001" />
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Input value={bmuCounty} onChange={(e) => setBmuCounty(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBmu} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create BMU'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
