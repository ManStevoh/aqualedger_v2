'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import {
  Users, MapPin, TrendingUp, AlertCircle, Plus, Fish,
  Scale, FileText, ShieldCheck, ShieldAlert, ExternalLink,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
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
  totalCatchKg: number
  revenue: number
  status: 'active' | 'inactive'
  manager: string
  activeLicenses: number
  expiringLicenses: number
  expiredLicenses: number
}

export default function BMUPage() {
  const meta = useDashboardPageMeta()

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
            totalCatches: Number(b.total_catches) || 0,
            totalCatchKg: Number(b.total_catch_kg) || 0,
            revenue: Number(b.catch_revenue) || 0,
            status: (b.status as string) === 'active' ? 'active' : 'inactive',
            manager: (b.chairman_name as string) || '—',
            activeLicenses: Number(b.active_licenses) || 0,
            expiringLicenses: Number(b.expiring_licenses) || 0,
            expiredLicenses: Number(b.expired_licenses) || 0,
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
  const totalCatchKg = bmus.reduce((sum, b) => sum + b.totalCatchKg, 0)
  const totalCatches = bmus.reduce((sum, b) => sum + b.totalCatches, 0)
  const totalActiveLicenses = bmus.reduce((sum, b) => sum + b.activeLicenses, 0)
  const totalExpiringLicenses = bmus.reduce((sum, b) => sum + b.expiringLicenses, 0)
  const totalExpiredLicenses = bmus.reduce((sum, b) => sum + b.expiredLicenses, 0)

  const revenueChartData = bmus
    .filter(b => b.revenue > 0)
    .map(bmu => ({
      name: bmu.name,
      value: bmu.revenue,
    }))

  const catchChartData = bmus
    .filter(b => b.totalCatchKg > 0)
    .map(bmu => ({
      name: bmu.name.length > 12 ? bmu.name.slice(0, 12) + '…' : bmu.name,
      catchKg: Math.round(bmu.totalCatchKg),
      revenue: Math.round(bmu.revenue),
    }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4" />
          Add BMU
        </Button></>}>

      {/* KPI Stats Row */}
      <StatCardGrid>
        <StatCard
          title="Active BMUs"
          value={activeBMUs}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          description={`${bmus.length} total registered`}
          loading={loading}
        />
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Across all BMUs"
          loading={loading}
        />
        <StatCard
          title="Total Catch"
          value={totalCatchKg > 1000 ? `${(totalCatchKg / 1000).toFixed(1)}T` : `${totalCatchKg.toLocaleString()} kg`}
          icon={<Fish className="h-4 w-4 text-muted-foreground" />}
          description={`${totalCatches.toLocaleString()} catch records`}
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={totalRevenue > 1000000 ? `KES ${(totalRevenue / 1000000).toFixed(2)}M` : `KES ${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="From catch sales"
          loading={loading}
        />
      </StatCardGrid>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Catch revenue by BMU</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No revenue data yet. Catches must be linked to landing sites with BMU associations.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catch Volume by BMU</CardTitle>
            <CardDescription>Total catch weight (kg) per BMU</CardDescription>
          </CardHeader>
          <CardContent>
            {catchChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No catch data yet. Log catches from fishing trips linked to BMU landing sites.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={catchChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} kg`} />
                  <Bar dataKey="catchKg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Catch (kg)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certifications & Compliance */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certifications &amp; Compliance
            </CardTitle>
            <CardDescription>
              License status across all BMU-linked members
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href="/dashboard/licenses">
              <ExternalLink className="h-3.5 w-3.5" />
              View all licenses
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalActiveLicenses}</p>
                <p className="text-sm text-muted-foreground">Active licenses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExpiringLicenses}</p>
                <p className="text-sm text-muted-foreground">Expiring within 30 days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExpiredLicenses}</p>
                <p className="text-sm text-muted-foreground">Expired licenses</p>
              </div>
            </div>
          </div>
          {totalExpiringLicenses > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ {totalExpiringLicenses} license{totalExpiringLicenses > 1 ? 's' : ''} expiring soon across BMUs.{' '}
                <Link href="/dashboard/licenses" className="underline underline-offset-2 font-semibold">
                  Review & renew →
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BMU Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>All BMUs</CardTitle>
          <CardDescription>Complete list of Beach Management Units with performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-right py-3 px-4 font-medium">Members</th>
                  <th className="text-right py-3 px-4 font-medium">Boats</th>
                  <th className="text-right py-3 px-4 font-medium">Catches</th>
                  <th className="text-right py-3 px-4 font-medium">Catch (kg)</th>
                  <th className="text-right py-3 px-4 font-medium">Revenue</th>
                  <th className="text-center py-3 px-4 font-medium">Licenses</th>
                  <th className="text-left py-3 px-4 font-medium">Chairman</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
                      Loading BMU data…
                    </td>
                  </tr>
                ) : bmus.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
                      No BMUs registered yet. Click &quot;Add BMU&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  bmus.map((bmu) => (
                    <tr key={bmu.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{bmu.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{bmu.location} {bmu.region && bmu.region !== bmu.location ? `• ${bmu.region}` : ''}</td>
                      <td className="py-3 px-4 text-right">{bmu.members}</td>
                      <td className="py-3 px-4 text-right">{bmu.activeBoats}</td>
                      <td className="py-3 px-4 text-right">{bmu.totalCatches.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {bmu.totalCatchKg > 1000
                          ? `${(bmu.totalCatchKg / 1000).toFixed(1)}T`
                          : `${bmu.totalCatchKg.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {bmu.revenue > 0 ? `KES ${bmu.revenue.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {bmu.activeLicenses > 0 && (
                            <Badge variant="default" className="text-xs">{bmu.activeLicenses}</Badge>
                          )}
                          {bmu.expiringLicenses > 0 && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">{bmu.expiringLicenses}</Badge>
                          )}
                          {bmu.expiredLicenses > 0 && (
                            <Badge variant="destructive" className="text-xs">{bmu.expiredLicenses}</Badge>
                          )}
                          {bmu.activeLicenses === 0 && bmu.expiringLicenses === 0 && bmu.expiredLicenses === 0 && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{bmu.manager}</td>
                      <td className="py-3 px-4">
                        <Badge variant={bmu.status === 'active' ? 'default' : 'secondary'}>
                          {bmu.status.charAt(0).toUpperCase() + bmu.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
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
