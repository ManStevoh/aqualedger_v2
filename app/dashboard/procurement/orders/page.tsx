'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SupplierOption {
  id: string
  name: string
  code: string
}

interface PurchaseOrder {
  id: string
  po_number: string
  supplier_name?: string
  status: string
  currency: string
  total_amount: number
  expected_date: string | null
  created_at: string
}

interface GoodsReceipt {
  id: string
  grn_number: string
  po_number?: string
  received_date: string
  status: string
}

interface PurchaseRequest {
  id: string
  pr_number: string
  department: string | null
  status: string
  needed_by: string | null
  created_at: string
}

interface Rfq {
  id: string
  rfq_number: string
  title: string
  status: string
  closing_date: string | null
  created_at: string
}

function ProcurementOrdersContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'orders'
  const [activeTab, setActiveTab] = useState(initialTab)

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([])
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [rfqs, setRfqs] = useState<Rfq[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [loading, setLoading] = useState(true)

  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showGrnDialog, setShowGrnDialog] = useState(false)
  const [showPrDialog, setShowPrDialog] = useState(false)
  const [showRfqDialog, setShowRfqDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [supplierId, setSupplierId] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')

  const [grnPoId, setGrnPoId] = useState('')
  const [grnDate, setGrnDate] = useState(new Date().toISOString().split('T')[0])
  const [grnNotes, setGrnNotes] = useState('')

  const [prDepartment, setPrDepartment] = useState('')
  const [prNeededBy, setPrNeededBy] = useState('')
  const [prNotes, setPrNotes] = useState('')

  const [rfqTitle, setRfqTitle] = useState('')
  const [rfqClosing, setRfqClosing] = useState('')
  const [prStatusFilter, setPrStatusFilter] = useState('all')
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/v2/procurement/orders?limit=100', { credentials: 'include' })
    const data = await res.json()
    setOrders(data.success && data.data?.orders ? data.data.orders : [])
  }, [])

  const fetchReceipts = useCallback(async () => {
    const res = await fetch('/api/v2/procurement/grn?limit=100', { credentials: 'include' })
    const data = await res.json()
    setReceipts(data.success && data.data?.receipts ? data.data.receipts : [])
  }, [])

  const fetchRequests = useCallback(async () => {
    const params = new URLSearchParams({ limit: '100' })
    if (prStatusFilter !== 'all') params.set('status', prStatusFilter)
    const res = await fetch(`/api/v2/procurement/requests?${params}`, { credentials: 'include' })
    const data = await res.json()
    setRequests(data.success && data.data?.requests ? data.data.requests : [])
  }, [prStatusFilter])

  const handleApprovePr = async (id: string, status: 'approved' | 'rejected') => {
    setApprovingId(id)
    try {
      const res = await fetch(`/api/v2/procurement/requests/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || `Failed to ${status} request`)
        return
      }
      toast.success(`Purchase request ${status}`)
      await fetchRequests()
    } catch {
      toast.error('Network error')
    } finally {
      setApprovingId(null)
    }
  }

  const fetchRfqs = useCallback(async () => {
    const res = await fetch('/api/v2/procurement/rfqs?limit=100', { credentials: 'include' })
    const data = await res.json()
    setRfqs(data.success && data.data?.rfqs ? data.data.rfqs : [])
  }, [])

  const fetchSuppliers = useCallback(async () => {
    const res = await fetch('/api/v2/procurement/suppliers?limit=100&status=active', {
      credentials: 'include',
    })
    const data = await res.json()
    if (data.success && data.data?.suppliers) {
      setSuppliers(data.data.suppliers)
    }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchOrders(), fetchReceipts(), fetchRequests(), fetchRfqs(), fetchSuppliers()])
    } catch {
      toast.error('Failed to load procurement data')
    } finally {
      setLoading(false)
    }
  }, [fetchOrders, fetchReceipts, fetchRequests, fetchRfqs, fetchSuppliers])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (activeTab === 'pr') fetchRequests()
  }, [prStatusFilter, activeTab, fetchRequests])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const handleCreateOrder = async () => {
    if (!supplierId || !description.trim() || !quantity || !unitPrice) {
      toast.error('Supplier, description, quantity, and unit price are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/procurement/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          expectedDate: expectedDate || null,
          notes: notes.trim() || null,
          lines: [
            {
              description: description.trim(),
              quantity: parseFloat(quantity),
              unit: 'kg',
              unitPrice: parseFloat(unitPrice),
            },
          ],
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create purchase order')
        return
      }
      toast.success('Purchase order created')
      setShowOrderDialog(false)
      await fetchOrders()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateGrn = async () => {
    if (!grnPoId || !grnDate) {
      toast.error('Purchase order and received date are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/procurement/grn', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseOrderId: grnPoId,
          receivedDate: grnDate,
          notes: grnNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to post goods receipt')
        return
      }
      toast.success('Goods receipt posted — PO marked received')
      setShowGrnDialog(false)
      await Promise.all([fetchReceipts(), fetchOrders()])
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreatePr = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/procurement/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: prDepartment.trim() || null,
          neededBy: prNeededBy || null,
          notes: prNotes.trim() || null,
          status: 'submitted',
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create purchase request')
        return
      }
      toast.success('Purchase request submitted')
      setShowPrDialog(false)
      await fetchRequests()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateRfq = async () => {
    if (!rfqTitle.trim()) {
      toast.error('RFQ title is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/procurement/rfqs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rfqTitle.trim(),
          closingDate: rfqClosing || null,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create RFQ')
        return
      }
      toast.success('RFQ created')
      setShowRfqDialog(false)
      await fetchRfqs()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'received' || s === 'posted' || s === 'approved') return 'default'
    if (s === 'cancelled' || s === 'rejected' || s === 'void') return 'destructive'
    if (s === 'sent' || s === 'partial' || s === 'open' || s === 'submitted') return 'secondary'
    return 'outline'
  }

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount)

  const receivableOrders = orders.filter((o) => o.status !== 'received' && o.status !== 'cancelled')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Procurement</h1>
        <p className="text-muted-foreground">Purchase orders, goods receipt, PRs, and RFQs</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="grn">GRN</TabsTrigger>
          <TabsTrigger value="pr">PR</TabsTrigger>
          <TabsTrigger value="rfq">RFQ</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setShowOrderDialog(true)}>
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Purchase Orders
              </CardTitle>
              <CardDescription>
                {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading…
                </div>
              ) : orders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No purchase orders yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Expected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-sm">{o.po_number}</TableCell>
                        <TableCell>{o.supplier_name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(Number(o.total_amount), o.currency)}</TableCell>
                        <TableCell>
                          {o.expected_date ? new Date(o.expected_date).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grn" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setShowGrnDialog(true)}>
              <Plus className="h-4 w-4" />
              Post GRN
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Goods Receipt Notes</CardTitle>
              <CardDescription>3-way match — links to purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No goods receipts yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN</TableHead>
                      <TableHead>PO</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm">{r.grn_number}</TableCell>
                        <TableCell>{r.po_number || '—'}</TableCell>
                        <TableCell>{new Date(r.received_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pr" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Select value={prStatusFilter} onValueChange={setPrStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2" onClick={() => setShowPrDialog(true)}>
              <Plus className="h-4 w-4" />
              New PR
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No purchase requests yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PR Number</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Needed By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm">{r.pr_number}</TableCell>
                        <TableCell>{r.department || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.needed_by ? new Date(r.needed_by).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {['draft', 'submitted'].includes(r.status) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={approvingId === r.id}
                                onClick={() => handleApprovePr(r.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={approvingId === r.id}
                                onClick={() => handleApprovePr(r.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfq" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setShowRfqDialog(true)}>
              <Plus className="h-4 w-4" />
              New RFQ
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Requests for Quotation</CardTitle>
            </CardHeader>
            <CardContent>
              {rfqs.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No RFQs yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Closes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfqs.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm">{r.rfq_number}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.closing_date ? new Date(r.closing_date).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity (kg)</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateOrder} disabled={submitting}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGrnDialog} onOpenChange={setShowGrnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Goods Receipt</DialogTitle>
            <DialogDescription>Marks linked PO as received</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Purchase Order</Label>
              <Select value={grnPoId} onValueChange={setGrnPoId}>
                <SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger>
                <SelectContent>
                  {receivableOrders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.po_number} — {o.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Received Date</Label>
              <Input type="date" value={grnDate} onChange={(e) => setGrnDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={grnNotes} onChange={(e) => setGrnNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrnDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateGrn} disabled={submitting}>Post GRN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrDialog} onOpenChange={setShowPrDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Purchase Request</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={prDepartment} onChange={(e) => setPrDepartment(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Needed By</Label>
              <Input type="date" value={prNeededBy} onChange={(e) => setPrNeededBy(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={prNotes} onChange={(e) => setPrNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePr} disabled={submitting}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRfqDialog} onOpenChange={setShowRfqDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New RFQ</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={rfqTitle} onChange={(e) => setRfqTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Closing Date</Label>
              <Input type="date" value={rfqClosing} onChange={(e) => setRfqClosing(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRfqDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateRfq} disabled={submitting}>Create RFQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PurchaseOrdersPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
      <ProcurementOrdersContent />
    </Suspense>
  )
}
