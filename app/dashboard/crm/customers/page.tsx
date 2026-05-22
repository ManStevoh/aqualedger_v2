'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Users, Loader2, Download, Clock, Phone, Mail, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  segment: string
  lifetime_value: number
  status: string
}

interface Activity {
  id: string
  customer_id: string | null
  lead_id: string | null
  activity_type: string
  subject: string
  body: string | null
  scheduled_at: string | null
  completed_at: string | null
  created_at: string
}

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: MessageSquare,
  whatsapp: MessageSquare,
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [activityDialog, setActivityDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [segment, setSegment] = useState('retail')
  const [status, setStatus] = useState('active')
  const [activityType, setActivityType] = useState('call')
  const [activitySubject, setActivitySubject] = useState('')
  const [activityBody, setActivityBody] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v2/crm/customers?limit=100', { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data?.customers) {
        setCustomers(data.data.customers)
      } else {
        setCustomers([])
      }
    } catch {
      setCustomers([])
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActivities = useCallback(async (customerId?: string | null) => {
    setActivitiesLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (customerId) params.set('customerId', customerId)
      const res = await fetch(`/api/v2/crm/activities?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data?.activities) {
        setActivities(data.data.activities)
      } else {
        setActivities([])
      }
    } catch {
      setActivities([])
      toast.error('Failed to load activities')
    } finally {
      setActivitiesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    fetchActivities(selectedCustomerId)
  }, [selectedCustomerId, fetchActivities])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/crm/customers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          segment,
          status,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create customer')
        return
      }
      toast.success('Customer created')
      setShowDialog(false)
      setName('')
      setEmail('')
      setPhone('')
      setSegment('retail')
      setStatus('active')
      await fetchCustomers()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateActivity = async () => {
    if (!activitySubject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!selectedCustomerId) {
      toast.error('Select a customer first')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/crm/activities', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          activityType,
          subject: activitySubject.trim(),
          body: activityBody.trim() || null,
          completedAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to log activity')
        return
      }
      toast.success('Activity logged')
      setActivityDialog(false)
      setActivitySubject('')
      setActivityBody('')
      await fetchActivities(selectedCustomerId)
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = async (customerId: string) => {
    setExporting(true)
    try {
      const res = await fetch(`/api/v2/crm/customers/${customerId}/export`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!data.success || !data.data?.export) {
        toast.error(data.error || 'Export failed')
        return
      }
      const blob = new Blob([JSON.stringify(data.data.export, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customer-${customerId}-gdpr-export.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('GDPR export downloaded')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const segmentLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const statusVariant = (s: string) => {
    if (s === 'active') return 'default'
    if (s === 'prospect') return 'secondary'
    return 'outline'
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  return (
    <DashboardPageLayout
      title="Customers"
      description="Manage customer relationships, activities, and GDPR exports"
    >
      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="activities">Activity Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Directory
              </CardTitle>
              <CardDescription>
                {loading ? 'Loading…' : `${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading customers…
                </div>
              ) : customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium">No customers yet</p>
                  <Button className="mt-4 gap-2" onClick={() => setShowDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Lifetime Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((c) => (
                      <TableRow
                        key={c.id}
                        className={selectedCustomerId === c.id ? 'bg-muted/50' : ''}
                        onClick={() => setSelectedCustomerId(c.id)}
                      >
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.email || '—'}</TableCell>
                        <TableCell>{c.phone || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{segmentLabel(c.segment)}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                          }).format(Number(c.lifetime_value))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(c.status)}>
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            disabled={exporting}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExport(c.id)
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  {selectedCustomer
                    ? `Activities for ${selectedCustomer.name}`
                    : 'Select a customer in the Directory tab to filter'}
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gap-2"
                disabled={!selectedCustomerId}
                onClick={() => setActivityDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Log Activity
              </Button>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading activities…
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No activities recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((a) => {
                    const Icon = ACTIVITY_ICONS[a.activity_type] ?? Clock
                    return (
                      <div key={a.id} className="flex gap-4 border-l-2 border-primary/30 pl-4 py-2">
                        <div className="mt-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{a.subject}</span>
                            <Badge variant="outline">{a.activity_type}</Badge>
                          </div>
                          {a.body && <p className="text-sm text-muted-foreground">{a.body}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(a.completed_at || a.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Register a new customer in CRM</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="cooperative">Cooperative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activityDialog} onOpenChange={setActivityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record a call, email, meeting, or note for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={activitySubject} onChange={(e) => setActivitySubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={activityBody} onChange={(e) => setActivityBody(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateActivity} disabled={submitting}>
              {submitting ? 'Saving…' : 'Log Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
