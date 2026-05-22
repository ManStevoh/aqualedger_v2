'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import type { License } from '@/lib/types'
import { 
  FileText, Search, Plus, CheckCircle2, AlertCircle, 
  XCircle, Calendar, DollarSign, RefreshCw, Ship, Users
} from 'lucide-react'
import { authFetchJson, issueLicense } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    valid: 0,
    expired: 0,
    suspended: 0,
    totalFeesCollected: 0,
    byType: {} as Record<string, number>
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [holderUserId, setHolderUserId] = useState('')
  const [licenseType, setLicenseType] = useState<'fishing' | 'trading' | 'transportation'>('fishing')
  const [expiresDate, setExpiresDate] = useState('')

  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    try {
      const result = await authFetchJson<{
        success: boolean
        data?: { licenses: Record<string, unknown>[] }
      }>('/api/v2/licenses?limit=200')

      if (result.success && result.data?.licenses) {
        const mapped: License[] = result.data.licenses.map((row) => {
          const cat = (row.license_type as string) || 'fishing'
          const typeMap: Record<string, License['type']> = {
            fishing: 'fishing',
            trading: 'trader',
            transportation: 'trader',
          }
          const st = (row.status as string) || 'active'
          const uiStatus: License['status'] =
            st === 'active' ? 'valid' : st === 'expired' ? 'expired' : st === 'suspended' ? 'suspended' : 'revoked'
          return {
            id: row.id as string,
            type: typeMap[cat] || 'fishing',
            holderId: row.user_id as string,
            holderName: (row.holder_name as string) || '',
            bmuId: '',
            licenseNumber: (row.license_number as string) || '',
            issuedDate: String(row.issued_date || '').split('T')[0],
            expiryDate: String(row.expires_date || '').split('T')[0],
            status: uiStatus,
            fee: 0,
          }
        })
        setLicenses(mapped)
        const valid = mapped.filter((l) => l.status === 'valid').length
        const expired = mapped.filter((l) => l.status === 'expired').length
        const suspended = mapped.filter((l) => l.status === 'suspended').length
        const totalFeesCollected = mapped.reduce((s, l) => s + l.fee, 0)
        const byType: Record<string, number> = {}
        mapped.forEach((l) => {
          byType[l.type] = (byType[l.type] || 0) + 1
        })
        setSummary({
          total: mapped.length,
          valid,
          expired,
          suspended,
          totalFeesCollected,
          byType,
        })
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'valid') return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (status === 'expired') return <AlertCircle className="h-4 w-4 text-red-600" />
    return <XCircle className="h-4 w-4 text-orange-600" />
  }

  const getTypeIcon = (type: string) => {
    if (type === 'boat') return <Ship className="h-4 w-4" />
    if (type === 'fishing') return <Users className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || license.type === selectedType
    return matchesSearch && matchesType
  })

  const handleIssueLicense = async () => {
    if (!holderUserId.trim() || !expiresDate) {
      toast.error('User ID and expiry date are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await issueLicense({
        userId: holderUserId.trim(),
        licenseType,
        expiresDate,
      })
      if (!result.success) {
        toast.error(result.error || 'Failed to issue license')
        return
      }
      toast.success('License issued')
      setShowIssueDialog(false)
      setHolderUserId('')
      setExpiresDate('')
      await fetchLicenses()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <DashboardPageLayout
      title="License Management"
      description="Manage fishing, boat, and trading licenses"
    >
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Licenses"
          value={summary.total}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Valid Licenses"
          value={summary.valid}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Expired/Suspended"
          value={summary.expired + summary.suspended}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 1, isPositive: false }}
        />
        <StatCard
          title="Fees Collected"
          value={`KES ${summary.totalFeesCollected.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* License Types Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        {['fishing', 'boat', 'trader', 'exporter', 'transporter'].map((type) => (
          <Card 
            key={type} 
            className={`cursor-pointer transition-colors ${selectedType === type ? 'border-primary' : ''}`}
            onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {getTypeIcon(type)}
                <Badge variant="outline">{summary.byType[type] || 0}</Badge>
              </div>
              <div className="mt-2 font-medium capitalize">{type}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or license number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedType !== 'all' && (
          <Button variant="outline" onClick={() => setSelectedType('all')}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Licenses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">License Number</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Holder</th>
                  <th className="text-left py-3 px-4 font-medium">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium">Expiry Date</th>
                  <th className="text-left py-3 px-4 font-medium">Fee</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No licenses found
                    </td>
                  </tr>
                ) : (
                  filteredLicenses.map((license) => {
                    const daysLeft = getDaysUntilExpiry(license.expiryDate)
                    return (
                      <tr key={license.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{license.licenseNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(license.type)}
                            <span className="capitalize">{license.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{license.holderName}</td>
                        <td className="py-3 px-4">{license.issuedDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span>{license.expiryDate}</span>
                            {license.status === 'valid' && daysLeft <= 30 && (
                              <StatusBadge status="warning" label={`${daysLeft}d left`} />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">KES {license.fee.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(license.status)}
                            <StatusBadge status={license.status} />
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {license.status === 'expired' && (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Renew
                              </Button>
                            )}
                            {license.status === 'valid' && (
                              <Button variant="ghost" size="sm">View</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Licenses Expiring Soon
          </CardTitle>
          <CardDescription>
            Licenses expiring within the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {licenses.filter(l => l.status === 'valid' && getDaysUntilExpiry(l.expiryDate) <= 30).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No licenses expiring within 30 days
            </p>
          ) : (
            <div className="space-y-3">
              {licenses
                .filter(l => l.status === 'valid' && getDaysUntilExpiry(l.expiryDate) <= 30)
                .map((license) => (
                  <div key={license.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{license.holderName}</div>
                      <div className="text-sm text-muted-foreground">
                        {license.licenseNumber} - {license.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge
                        status="warning"
                        label={`${getDaysUntilExpiry(license.expiryDate)} days left`}
                      />
                      <Button variant="link" size="sm" className="mt-1">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue license</DialogTitle>
            <DialogDescription>Creates a row in the licenses table for aqualedger32</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Holder user ID (UUID)</Label>
              <Input value={holderUserId} onChange={(e) => setHolderUserId(e.target.value)} placeholder="From Users page" />
            </div>
            <div className="space-y-2">
              <Label>License type</Label>
              <Select value={licenseType} onValueChange={(v) => setLicenseType(v as typeof licenseType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fishing">Fishing</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expires date</Label>
              <Input type="date" value={expiresDate} onChange={(e) => setExpiresDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Cancel</Button>
            <Button onClick={handleIssueLicense} disabled={submitting}>
              {submitting ? 'Issuing…' : 'Issue license'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
