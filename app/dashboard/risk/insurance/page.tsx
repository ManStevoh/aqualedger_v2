'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { DataTableShell } from '@/components/dashboard/data-table-shell'
import { ResponsiveFormGrid } from '@/components/dashboard/responsive-form-grid'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson, useBoats } from '@/lib/api'
import { Shield, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Policy {
  id: string
  policy_number: string
  insurer_name: string
  policy_type: string
  boat_name: string | null
  premium_amount: number
  coverage_amount: number
  start_date: string
  end_date: string
  status: string
}

interface Claim {
  id: string
  claim_number: string
  policy_number: string
  incident_date: string
  description: string
  claimed_amount: number
  approved_amount: number | null
  status: string
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [summary, setSummary] = useState({
    activePolicies: 0,
    expiringSoon: 0,
    totalCoverage: 0,
    openClaims: 0,
    openClaimValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [policyDialog, setPolicyDialog] = useState(false)
  const [claimDialog, setClaimDialog] = useState(false)
  const [policyNumber, setPolicyNumber] = useState('')
  const [insurer, setInsurer] = useState('')
  const [policyType, setPolicyType] = useState('hull')
  const [boatId, setBoatId] = useState<string>('none')
  const [premium, setPremium] = useState('')
  const [coverage, setCoverage] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [claimPolicyId, setClaimPolicyId] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [claimDesc, setClaimDesc] = useState('')
  const [claimAmount, setClaimAmount] = useState('')

  const { data: boatsData } = useBoats()
  const boats = boatsData?.data?.items || []

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { policies: Policy[] } }>(
          '/api/v2/risk/insurance?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { claims: Claim[] } }>(
          '/api/v2/risk/insurance?resource=claims&limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { summary: typeof summary } }>(
          '/api/v2/risk/insurance?summary=1',
        ),
      ])
      if (pRes.success && pRes.data?.policies) setPolicies(pRes.data.policies)
      if (cRes.success && cRes.data?.claims) setClaims(cRes.data.claims)
      if (sRes.success && sRes.data?.summary) setSummary(sRes.data.summary)
    } catch {
      toast.error('Failed to load insurance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createPolicy = async () => {
    if (!policyNumber.trim() || !insurer.trim()) {
      toast.error('Policy number and insurer name are required')
      return
    }
    const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/risk/insurance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'policy',
        boatId: boatId === 'none' ? null : boatId,
        policyNumber: policyNumber.trim(),
        insurerName: insurer.trim(),
        policyType,
        premiumAmount: parseFloat(premium) || 0,
        coverageAmount: parseFloat(coverage) || 0,
        startDate,
        endDate,
      }),
    })
    if (!res.success) {
      toast.error(res.error || 'Failed to create policy')
      return
    }
    toast.success('Insurance policy created successfully')
    setPolicyDialog(false)
    setPolicyNumber('')
    setInsurer('')
    setBoatId('none')
    load()
  }

  const createClaim = async () => {
    if (!claimPolicyId) {
      toast.error('Select a policy')
      return
    }
    const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/risk/insurance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'claim',
        policyId: claimPolicyId,
        incidentDate,
        description: claimDesc.trim(),
        claimedAmount: parseFloat(claimAmount),
      }),
    })
    if (!res.success) {
      toast.error(res.error || 'Failed')
      return
    }
    toast.success('Claim filed')
    setClaimDialog(false)
    load()
  }

  const updateClaim = async (id: string, status: string) => {
    const res = await authFetchJson<{ success: boolean; error?: string }>(
      `/api/v2/risk/insurance/claims/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
    )
    if (!res.success) {
      toast.error(res.error || 'Update failed')
      return
    }
    toast.success(`Claim ${status}`)
    load()
  }

  const kes = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)

  return (
    <DashboardPageLayout
      title="Insurance & claims"
      description="Hull, liability, and cargo cover for fleet operations"
      actions={
        <>
          <Button variant="outline" className="gap-2" onClick={() => setClaimDialog(true)}>
            <Plus className="h-4 w-4" />
            File claim
          </Button>
          <Button className="gap-2" onClick={() => setPolicyDialog(true)}>
            <Plus className="h-4 w-4" />
            Add policy
          </Button>
        </>
      }
    >
      <StatCardGrid>
        <StatCard title="Active policies" value={summary.activePolicies} icon={<Shield className="h-4 w-4" />} loading={loading} />
        <StatCard title="Expiring (30d)" value={summary.expiringSoon} loading={loading} />
        <StatCard title="Total coverage" value={kes(summary.totalCoverage)} loading={loading} />
        <StatCard title="Open claims" value={summary.openClaims} loading={loading} />
      </StatCardGrid>

      <Tabs defaultValue="policies">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 sm:inline-flex sm:w-auto">
          <TabsTrigger value="policies" className="min-h-11 flex-1 sm:flex-none">
            Policies
          </TabsTrigger>
          <TabsTrigger value="claims" className="min-h-11 flex-1 sm:flex-none">
            Claims
          </TabsTrigger>
        </TabsList>
        <TabsContent value="policies" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
            <CardContent>
              <DataTableShell label="Insurance policies">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy #</TableHead>
                      <TableHead>Insurer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Vessel / Boat</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm">{p.policy_number}</TableCell>
                        <TableCell>{p.insurer_name}</TableCell>
                        <TableCell className="capitalize">{p.policy_type}</TableCell>
                        <TableCell className="font-medium">{p.boat_name || 'General Fleet'}</TableCell>
                        <TableCell>{kes(Number(p.coverage_amount))}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="block">{p.start_date} → {p.end_date}</span>
                          <Badge className="mt-1 capitalize" variant="outline">
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTableShell>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Claims</CardTitle></CardHeader>
            <CardContent>
              <DataTableShell label="Insurance claims">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Incident</TableHead>
                      <TableHead>Claimed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.claim_number}</TableCell>
                        <TableCell>{c.policy_number}</TableCell>
                        <TableCell>{c.incident_date}</TableCell>
                        <TableCell>{kes(Number(c.claimed_amount))}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{c.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
                            {c.status === 'submitted' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                  onClick={() => updateClaim(c.id, 'reviewing')}
                                >
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => updateClaim(c.id, 'approved')}
                                >
                                  Approve
                                </Button>
                              </>
                            )}
                            {c.status === 'approved' && (
                              <Button
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => updateClaim(c.id, 'paid')}
                              >
                                Mark paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTableShell>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Insurance Policy Dialog */}
      <Dialog open={policyDialog} onOpenChange={setPolicyDialog}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Insurance Policy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Target Vessel Selection Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Vessel / Boat</Label>
              <Select value={boatId} onValueChange={setBoatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select boat (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General / All Fleet Cover</SelectItem>
                  {boats.map((b: { id: string; name: string; registration_number?: string }) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} {b.registration_number ? `(${b.registration_number})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ResponsiveFormGrid>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Policy #</Label>
                <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g. POL-1082" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Insurer Name</Label>
                <Input value={insurer} onChange={(e) => setInsurer(e.target.value)} placeholder="e.g. Kenya Marine Insurance" />
              </div>
            </ResponsiveFormGrid>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Coverage Type</Label>
              <Select value={policyType} onValueChange={setPolicyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hull">Hull & Machinery</SelectItem>
                  <SelectItem value="liability">Third Party Liability</SelectItem>
                  <SelectItem value="cargo">Fish Cargo & Catch</SelectItem>
                  <SelectItem value="crew">Crew Personal Injury</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive All-Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ResponsiveFormGrid>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Premium (KES)</Label>
                <Input type="number" value={premium} onChange={(e) => setPremium(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Coverage Amount (KES)</Label>
                <Input type="number" value={coverage} onChange={(e) => setCoverage(e.target.value)} placeholder="0" />
              </div>
            </ResponsiveFormGrid>

            <ResponsiveFormGrid>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </ResponsiveFormGrid>
          </div>
          <DialogFooter>
            <Button onClick={createPolicy}>Save Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Insurance Claim Dialog */}
      <Dialog open={claimDialog} onOpenChange={setClaimDialog}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>File Insurance Claim</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Policy</Label>
              <Select value={claimPolicyId} onValueChange={setClaimPolicyId}>
                <SelectTrigger><SelectValue placeholder="Select policy..." /></SelectTrigger>
                <SelectContent>
                  {policies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.policy_number} — {p.insurer_name} ({p.boat_name || 'Fleet'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Incident Date</Label><Input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Incident Description</Label><Input value={claimDesc} onChange={(e) => setClaimDesc(e.target.value)} placeholder="Describe damage or loss..." /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Amount Claimed (KES)</Label><Input type="number" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} placeholder="0" /></div>
          </div>
          <DialogFooter><Button onClick={createClaim}>Submit Claim</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
