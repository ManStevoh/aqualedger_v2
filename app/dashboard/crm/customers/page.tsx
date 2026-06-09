'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
import { DataTableShell } from '@/components/dashboard/data-table-shell'
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
import { Plus, Pencil, Users, Loader2, Download, Clock, Phone, Mail, MessageSquare, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import {
  PortalInviteDialog,
  portalDefaultsFromCustomer,
} from '@/components/dashboard/portal-invite-dialog'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  segment: string
  lifetime_value: number
  status: string
  notes?: string | null
  credit_score?: number | null
  credit_grade?: string | null
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
  const { tenantSlug } = useAppStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [activityDialog, setActivityDialog] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'b2b' | 'storefront'>('all')

  // Create Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [segment, setSegment] = useState('retail')
  const [status, setStatus] = useState('active')
  
  // Edit Form State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSegment, setEditSegment] = useState('retail')
  const [editStatus, setEditStatus] = useState('active')
  const [editNotes, setEditNotes] = useState('')

  // Activity Form State
  const [activityType, setActivityType] = useState('call')
  const [activitySubject, setActivitySubject] = useState('')
  const [activityBody, setActivityBody] = useState('')
  const [portalInviteOpen, setPortalInviteOpen] = useState(false)
  const [portalInviteCustomer, setPortalInviteCustomer] = useState<Customer | null>(null)

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

  const handleEdit = async () => {
    if (!editingCustomer) return
    if (!editName.trim()) {
      toast.error('Name is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v2/crm/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim() || null,
          phone: editPhone.trim() || null,
          segment: editSegment,
          status: editStatus,
          notes: editNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to update customer')
        return
      }
      toast.success('Customer updated successfully')
      setEditDialogOpen(false)
      await fetchCustomers()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditName(customer.name)
    setEditEmail(customer.email || '')
    setEditPhone(customer.phone || '')
    setEditSegment(customer.segment)
    setEditStatus(customer.status)
    setEditNotes(customer.notes || '')
    setEditDialogOpen(true)
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

  const openPortalInvite = (customer?: Customer) => {
    setPortalInviteCustomer(customer ?? null)
    setPortalInviteOpen(true)
  }

  const filteredCustomers = customers.filter((c) => {
    if (typeFilter === 'all') return true
    if (typeFilter === 'storefront') return c.segment === 'retail'
    if (typeFilter === 'b2b') return c.segment !== 'retail'
    return true
  })

  return (
    <DashboardPageLayout
      title="Customers"
      description="Manage customer relationships, activities, and buyer portal access"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Button className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
        <Button className="gap-2" variant="outline" onClick={() => openPortalInvite()}>
          <LogIn className="h-4 w-4" />
          Invite client portal
        </Button>
      </div>

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="activities">Activity Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Directory
                </CardTitle>
                <CardDescription>
                  {loading ? 'Loading…' : `${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}`}
                </CardDescription>
              </div>
              <div className="flex gap-1 border rounded-lg p-0.5 bg-muted/50 w-fit shrink-0">
                <Button
                  variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 text-xs font-semibold px-3"
                  onClick={() => setTypeFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={typeFilter === 'b2b' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 text-xs font-semibold px-3"
                  onClick={() => setTypeFilter('b2b')}
                >
                  B2B Wholesale
                </Button>
                <Button
                  variant={typeFilter === 'storefront' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 text-xs font-semibold px-3"
                  onClick={() => setTypeFilter('storefront')}
                >
                  Storefront Retail
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading customers…
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium">No customers found</p>
                  <Button className="mt-4 gap-2" onClick={() => setShowDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              ) : (
                <DataTableShell label="CRM customers">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Credit Score</TableHead>
                      <TableHead>Lifetime Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow
                        key={c.id}
                        className={`${selectedCustomerId === c.id ? 'bg-muted/50 cursor-pointer' : 'cursor-pointer'}`}
                        onClick={() => setSelectedCustomerId(c.id)}
                      >
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.email || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={c.segment === 'retail' ? 'secondary' : 'default'} className={c.segment === 'retail' ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}>
                            {c.segment === 'retail' ? 'Storefront' : 'B2B Buyer'}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.phone || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{segmentLabel(c.segment)}</Badge>
                        </TableCell>
                        <TableCell>
                          {c.segment !== 'retail' && c.credit_score != null ? (
                            <span className="font-semibold text-slate-700" title={`Grade: ${c.credit_grade}`}>
                              {c.credit_score} ({c.credit_grade})
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            maximumFractionDigits: 0,
                          }).format(Number(c.lifetime_value))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(c.status)}>
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          {c.segment === 'retail' && tenantSlug && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                              asChild
                            >
                              <Link href={`/store/${tenantSlug}`} target="_blank">
                                <LogIn className="h-4 w-4" />
                                Storefront
                              </Link>
                            </Button>
                          )}
                          {c.segment !== 'retail' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              asChild
                            >
                              <Link href="/dashboard/credit-score">
                                Credit
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => openEditDialog(c)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            disabled={!c.email}
                            title={c.email ? 'Grant buyer portal login' : 'Add email first'}
                            onClick={() => openPortalInvite(c)}
                          >
                            <LogIn className="h-4 w-4" />
                            Portal
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            disabled={exporting}
                            onClick={() => handleExport(c.id)}
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </DataTableShell>
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

      {/* Add Dialog */}
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
                    <SelectItem value="retail">Retail (Storefront)</SelectItem>
                    <SelectItem value="wholesale">Wholesale (B2B)</SelectItem>
                    <SelectItem value="export">Export (B2B)</SelectItem>
                    <SelectItem value="restaurant">Restaurant (B2B)</SelectItem>
                    <SelectItem value="cooperative">Cooperative (B2B)</SelectItem>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update details for {editingCustomer?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select value={editSegment} onValueChange={setEditSegment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail (Storefront)</SelectItem>
                    <SelectItem value="wholesale">Wholesale (B2B)</SelectItem>
                    <SelectItem value="export">Export (B2B)</SelectItem>
                    <SelectItem value="restaurant">Restaurant (B2B)</SelectItem>
                    <SelectItem value="cooperative">Cooperative (B2B)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PortalInviteDialog
        kind="customer"
        open={portalInviteOpen}
        onOpenChange={setPortalInviteOpen}
        onSuccess={fetchCustomers}
        defaults={
          portalInviteCustomer ? portalDefaultsFromCustomer(portalInviteCustomer) : undefined
        }
      />

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
