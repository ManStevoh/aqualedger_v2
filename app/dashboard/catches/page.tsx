'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState } from 'react'
import { Fish, DollarSign, Scale, Star, Plus, Filter, Award, Printer, QrCode, Receipt, ShieldCheck, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPageToolbar } from '@/components/dashboard/list-page-toolbar'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ExportCsvButton } from '@/components/dashboard/export-csv-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select'
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
  Tooltip } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

function displayGrade(grade: string): string {
  const g = grade.toUpperCase()
  if (g === 'A' || grade === 'premium') return 'A'
  if (g === 'B' || grade === 'export') return 'B'
  if (g === 'C' || grade === 'local') return 'C'
  return grade
}

/** Map catch grade to status strings aligned with resolveGradeTone semantics */
function gradeStatusForBadge(grade: string): string {
  const d = displayGrade(grade)
  if (d === 'A') return 'premium'
  if (d === 'B') return 'export'
  return 'local'
}

export default function CatchesPage() {
  const meta = useDashboardPageMeta({
    title: 'Catch Management',
    description: 'Log, track, and sell your fish catches',
  })
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [selectedReceiptCatch, setSelectedReceiptCatch] = useState<Catch | null>(null)
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [selectedTrip, setSelectedTrip] = useState('')
  const [fishType, setFishType] = useState('')
  const [weight, setWeight] = useState('')
  const [grade, setGrade] = useState('B')
  const [pricePerKg, setPricePerKg] = useState('')
  const [mscCertified, setMscCertified] = useState(false)
  const [isLogging, setIsLogging] = useState(false)

  const catchFilters = gradeFilter !== 'all' ? { grade: gradeFilter } : undefined
  const { data: catchesData, isLoading, mutate } = useCatches(catchFilters)
  const { data: tripsData } = useTrips()
  const { data: speciesList = [] } = useFishSpecies()
  const { data: distributionData } = useCatchDistribution()

  const catches = catchesData?.data?.items || []
  const trips = tripsData?.data?.items || []
  const distribution = distributionData?.data || []
  const ongoingTrips = trips.filter((t: FishingTrip) => t.status === 'ongoing')

  const totalWeight = catches.reduce((sum: number, c: Catch) => sum + c.weight, 0)
  const totalValue = catches.reduce((sum: number, c: Catch) => sum + c.totalValue, 0)
  const premiumCatch = catches.filter((c: Catch) => displayGrade(c.grade) === 'A').reduce((sum: number, c: Catch) => sum + c.weight, 0)
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
        mscCertified,
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
      setGrade('B')
      setPricePerKg('')
      setMscCertified(false)
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
        <StatusBadge
          status={gradeStatusForBadge(item.grade)}
          label={`Grade ${displayGrade(item.grade)}`}
        />
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
    {
      key: 'actions',
      header: 'Actions',
      cell: (item: Catch) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedReceiptCatch(item)}>
          View Receipt
        </Button>
      ),
    },
  ]

  return (
    <DashboardPageLayout
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/api/v2/analytics/export?type=fishing-operations&format=csv" download>
                <Download className="mr-2 h-4 w-4" /> Export Report
              </a>
            </Button>
            <Button onClick={() => setShowLogDialog(true)} disabled={ongoingTrips.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Log Catch
            </Button>
          </div>
        }
      >

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
          title="Grade A"
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
                    <StatusBadge
                      status={gradeStatusForBadge(c.grade)}
                      label={`Grade ${displayGrade(c.grade)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ListPageToolbar
        filters={
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="h-9 filter-control">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Grade filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grades</SelectItem>
              <SelectItem value="A">Grade A</SelectItem>
              <SelectItem value="B">Grade B</SelectItem>
              <SelectItem value="C">Grade C</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={
          <ExportCsvButton
            data={catches.map((c) => ({
              fishType: c.fishType,
              weight: c.weight,
              grade: displayGrade(c.grade),
              pricePerKg: c.pricePerKg,
              totalValue: c.totalValue,
            }))}
            filename="catches"
            columns={[
              { key: 'fishType', label: 'Species' },
              { key: 'weight', label: 'Weight (kg)' },
              { key: 'grade', label: 'Grade' },
              { key: 'pricePerKg', label: 'Price/kg' },
              { key: 'totalValue', label: 'Total value' },
            ]}
          />
        }
      />

      {!isLoading && catches.length === 0 ? (
        <EmptyState
          icon={Fish}
          title="No catches logged yet"
          description={
            gradeFilter !== 'all'
              ? 'No catches match this grade filter. Try another grade or log a new catch.'
              : ongoingTrips.length === 0
                ? 'Start an ongoing trip before logging catches.'
                : 'Log your first catch from an active fishing trip.'
          }
          actionLabel={ongoingTrips.length > 0 ? 'Log Catch' : undefined}
          onAction={ongoingTrips.length > 0 ? () => setShowLogDialog(true) : undefined}
        />
      ) : (
        <DataTable
          title="All Catches"
          description="Complete catch history"
          columns={columns}
          data={catches}
          loading={isLoading}
          emptyMessage="No catches logged yet"
        />
      )}

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
                <Label>Grade (A/B/C)</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A — Premium</SelectItem>
                    <SelectItem value="B">Grade B — Export</SelectItem>
                    <SelectItem value="C">Grade C — Local</SelectItem>
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
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox
                id="msc"
                checked={mscCertified}
                onCheckedChange={(v) => setMscCertified(v === true)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="msc" className="flex items-center gap-2 cursor-pointer">
                  <Award className="h-4 w-4 text-emerald-600" />
                  MSC certified catch
                </Label>
                <p className="text-xs text-muted-foreground">
                  Creates a traceability lot flagged for Marine Stewardship Council compliance
                </p>
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

      {/* Digital Catch Receipt Dialog */}
      <Dialog open={selectedReceiptCatch !== null} onOpenChange={(open) => !open && setSelectedReceiptCatch(null)}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Digital Catch Receipt &amp; Evidence Trail
            </DialogTitle>
            <DialogDescription>
              ERP generated transaction evidence of catch &amp; sale
            </DialogDescription>
          </DialogHeader>

          {selectedReceiptCatch && (
            <div className="space-y-4 py-2 text-sm" id="printable-receipt">
              {/* Receipt Body */}
              <div className="border border-dashed border-muted-foreground/30 rounded-lg p-5 bg-muted/20 space-y-4 relative overflow-hidden">
                {/* Watermark/Stamp */}
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 pointer-events-none">
                  <ShieldCheck className="h-32 w-32 text-green-600" />
                </div>

                <div className="flex justify-between items-start border-b pb-3 border-dashed">
                  <div>
                    <h4 className="font-bold text-lg text-primary">AQUA-ERP RECEIPT</h4>
                    <p className="text-xs text-muted-foreground">ID: #{selectedReceiptCatch.id.slice(0, 16)}...</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck className="h-3 w-3" />
                      SECURE LOG
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-b pb-3 border-dashed">
                  <div>
                    <span className="text-muted-foreground block">Vessel / Boat</span>
                    <span className="font-semibold">{selectedReceiptCatch.boatName || 'Showcase Vessel'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Logged By</span>
                    <span className="font-semibold">{selectedReceiptCatch.recordedByName || 'BMU Official'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date &amp; Time</span>
                    <span className="font-semibold">
                      {selectedReceiptCatch.loggedAt ? new Date(selectedReceiptCatch.loggedAt).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Trip Reference</span>
                    <span className="font-mono font-semibold text-[10px] truncate max-w-[120px] block">
                      {selectedReceiptCatch.tripId.slice(0, 12)}...
                    </span>
                  </div>
                </div>

                {/* Catch Details */}
                <div className="space-y-2 border-b pb-3 border-dashed">
                  <div className="flex justify-between font-semibold">
                    <span>Species / Grade</span>
                    <span>Total Value</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {selectedReceiptCatch.fishType} (Grade {displayGrade(selectedReceiptCatch.grade)})
                    </span>
                    <span className="font-semibold text-foreground">
                      KES {selectedReceiptCatch.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-3">
                    <span>{selectedReceiptCatch.weight} kg @ KES {selectedReceiptCatch.pricePerKg}/kg</span>
                    <span>MSC Certified: {selectedReceiptCatch.grade === 'premium' ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {/* Proof of Sale */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block tracking-wider">Sale &amp; Transfer Evidence</span>
                  {selectedReceiptCatch.buyerName ? (
                    <div className="rounded bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Transaction Completed
                      </p>
                      <p>Sold to: <strong className="text-emerald-900">{selectedReceiptCatch.buyerName}</strong></p>
                      <p>Transfer Date: {selectedReceiptCatch.soldAt ? new Date(selectedReceiptCatch.soldAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <div className="rounded bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 space-y-1">
                      <p className="font-semibold">Listing / Stock Status</p>
                      <p>Available in Marketplace or Cold Chain Storage.</p>
                      <p className="text-[10px] text-amber-700">Awaiting purchase dispatch / contract call.</p>
                    </div>
                  )}
                </div>

                {/* QR Code Placeholder for Traceability Verification */}
                <div className="flex items-center gap-3 pt-2 bg-background border rounded p-2.5">
                  <QrCode className="h-10 w-10 text-muted-foreground shrink-0" />
                  <div className="text-[10px] text-muted-foreground">
                    <p className="font-semibold text-foreground">Scan for Traceability Audit</p>
                    <p className="leading-tight">Verify vessel safety checks, crew licenses, cold storage log, and landing cert on-chain.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                const style = document.createElement('style')
                style.innerHTML = `
                  @media print {
                    body * { visibility: hidden; }
                    #printable-receipt, #printable-receipt * { visibility: visible; }
                    #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none; }
                  }
                `
                document.head.appendChild(style)
                window.print()
                document.head.removeChild(style)
              }}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </Button>
            <Button onClick={() => setSelectedReceiptCatch(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

