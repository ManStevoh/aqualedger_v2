'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { DataTableShell } from '@/components/dashboard/data-table-shell'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { FileText, Plus, Receipt, BookOpen, Loader2, Send, Printer } from 'lucide-react'

interface ApInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  currency: string
  gl_journal_id?: string | null
}

interface ArInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  currency: string
  gl_journal_id?: string | null
  order_number?: string | null
  customer_name?: string | null
  order_id?: string | null
}

interface CrmCustomer {
  id: string
  name: string
}

interface OrderOption {
  id: string
  order_number: string
  total: number
  status: string
}

export default function InvoicesPage() {
  const meta = useDashboardPageMeta({
    title: 'Invoices',
    description: 'Create AP & AR invoices, post to the general ledger, invoice from orders',
  })

  const [apInvoices, setApInvoices] = useState<ApInvoice[]>([])
  const [arInvoices, setArInvoices] = useState<ArInvoice[]>([])
  const [customers, setCustomers] = useState<CrmCustomer[]>([])
  const [orders, setOrders] = useState<OrderOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [postingId, setPostingId] = useState<string | null>(null)

  const [apOpen, setApOpen] = useState(false)
  const [arOpen, setArOpen] = useState(false)
  const [fromOrderOpen, setFromOrderOpen] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })

  const [apNumber, setApNumber] = useState('')
  const [apSubtotal, setApSubtotal] = useState('')
  const [apTax, setApTax] = useState('')

  const [arNumber, setArNumber] = useState('')
  const [arSubtotal, setArSubtotal] = useState('')
  const [arTax, setArTax] = useState('')
  const [arCustomerId, setArCustomerId] = useState('')

  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [postOrderToGl, setPostOrderToGl] = useState(true)

  const fmt = (n: number, currency = 'KES') =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(n)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ap, ar, cust, ord] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { invoices: ApInvoice[] } }>(
          '/api/v2/accounting/ap?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { invoices: ArInvoice[] } }>(
          '/api/v2/accounting/ar?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { customers: CrmCustomer[] } }>(
          '/api/v2/crm/customers?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { orders: OrderOption[] } }>(
          '/api/v2/orders?limit=50',
        ),
      ])
      setApInvoices(ap.success && ap.data?.invoices ? ap.data.invoices : [])
      setArInvoices(ar.success && ar.data?.invoices ? ar.data.invoices : [])
      setCustomers(cust.success && cust.data?.customers ? cust.data.customers : [])
      const orderList =
        ord.success && ord.data?.orders
          ? ord.data.orders.filter((o) => o.status !== 'cancelled')
          : []
      setOrders(orderList)
    } catch {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const apOutstanding = useMemo(
    () =>
      apInvoices
        .filter((i) => ['draft', 'approved'].includes(i.status))
        .reduce((s, i) => s + Number(i.total_amount), 0),
    [apInvoices],
  )

  const arOutstanding = useMemo(
    () =>
      arInvoices
        .filter((i) => ['draft', 'sent', 'overdue'].includes(i.status))
        .reduce((s, i) => s + Number(i.total_amount), 0),
    [arInvoices],
  )

  const printInvoice = (kind: 'ap' | 'ar', id: string) => {
    window.open(`/api/v2/accounting/${kind}/${id}/document`, '_blank')
  }

  const postInvoice = async (kind: 'ap' | 'ar', id: string) => {
    setPostingId(id)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/accounting/${kind}/${id}/post`,
        { method: 'POST' },
      )
      if (!res.success) throw new Error(res.error || 'Post failed')
      toast.success('Invoice posted to general ledger')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Post failed')
    } finally {
      setPostingId(null)
    }
  }

  const createAp = async () => {
    const subtotal = Number(apSubtotal)
    const taxAmount = Number(apTax) || 0
    if (!apNumber.trim() || !Number.isFinite(subtotal)) {
      toast.error('Invoice number and subtotal required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/accounting/ap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: apNumber.trim(),
          invoiceDate,
          dueDate: dueDate || null,
          subtotal,
          taxAmount,
          totalAmount: subtotal + taxAmount,
          status: 'draft',
        }),
      })
      if (!res.success) throw new Error(res.error || 'Create failed')
      toast.success('AP invoice created')
      setApOpen(false)
      setApNumber('')
      setApSubtotal('')
      setApTax('')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const createAr = async () => {
    const subtotal = Number(arSubtotal)
    const taxAmount = Number(arTax) || 0
    if (!arNumber.trim() || !Number.isFinite(subtotal)) {
      toast.error('Invoice number and subtotal required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/accounting/ar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: arNumber.trim(),
          invoiceDate,
          dueDate: dueDate || null,
          customerId: arCustomerId || null,
          subtotal,
          taxAmount,
          totalAmount: subtotal + taxAmount,
          status: 'sent',
        }),
      })
      if (!res.success) throw new Error(res.error || 'Create failed')
      toast.success('AR invoice created')
      setArOpen(false)
      setArNumber('')
      setArSubtotal('')
      setArTax('')
      setArCustomerId('')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const createFromOrder = async () => {
    if (!selectedOrderId) {
      toast.error('Select an order')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        error?: string
        data?: { invoice: ArInvoice; journalEntryId?: string }
      }>('/api/v2/accounting/ar/from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId, postToGl: postOrderToGl }),
      })
      if (!res.success) throw new Error(res.error || 'Could not create invoice')
      toast.success(
        res.data?.journalEntryId
          ? `Invoice ${res.data.invoice.invoice_number} created and posted to GL`
          : `Invoice ${res.data?.invoice.invoice_number} created`,
      )
      setFromOrderOpen(false)
      setSelectedOrderId('')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invoice from order failed')
    } finally {
      setSubmitting(false)
    }
  }

  const invoicedOrderIds = new Set(arInvoices.map((i) => i.order_id).filter(Boolean))

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button className="gap-2" onClick={() => setArOpen(true)}>
          <Plus className="h-4 w-4" />
          New customer invoice
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setApOpen(true)}>
          <Plus className="h-4 w-4" />
          New supplier invoice
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setFromOrderOpen(true)}>
          <FileText className="h-4 w-4" />
          Invoice from order
        </Button>
        <Button variant="ghost" className="gap-2" asChild>
          <Link href="/dashboard/accounting/ledger">
            <BookOpen className="h-4 w-4" />
            General ledger
          </Link>
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="AP outstanding"
          value={fmt(apOutstanding)}
          loading={loading}
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          title="AR outstanding"
          value={fmt(arOutstanding)}
          loading={loading}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Payable invoices"
          value={apInvoices.length}
          loading={loading}
        />
        <StatCard
          title="Receivable invoices"
          value={arInvoices.length}
          loading={loading}
        />
      </StatCardGrid>

      <Tabs defaultValue="receivable" className="mt-4">
        <TabsList>
          <TabsTrigger value="receivable">Customer (AR)</TabsTrigger>
          <TabsTrigger value="payable">Supplier (AP)</TabsTrigger>
        </TabsList>

        <TabsContent value="receivable" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts receivable</CardTitle>
              <CardDescription>Customer invoices — bill buyers for orders and services</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DataTableShell label="AR invoices">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Invoice #</th>
                        <th className="text-left py-2 px-3">Customer</th>
                        <th className="text-left py-2 px-3">Order</th>
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-right py-2 px-3">Total</th>
                        <th className="text-left py-2 px-3">Status</th>
                        <th className="text-right py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arInvoices.map((inv) => (
                        <tr key={inv.id} className="border-b hover:bg-muted/40">
                          <td className="py-2 px-3 font-mono">{inv.invoice_number}</td>
                          <td className="py-2 px-3">{inv.customer_name || '—'}</td>
                          <td className="py-2 px-3">
                            {inv.order_id ? (
                              <Link
                                href={`/dashboard/orders/${inv.order_id}`}
                                className="text-primary hover:underline font-mono text-xs"
                              >
                                {inv.order_number || inv.order_id.slice(0, 8)}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2 px-3">{inv.invoice_date}</td>
                          <td className="py-2 px-3 text-right">{fmt(Number(inv.total_amount))}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{inv.status}</Badge>
                            {inv.gl_journal_id && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                GL
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => printInvoice('ar', inv.id)}
                                title="Print invoice"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                              {!inv.gl_journal_id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={postingId === inv.id}
                                  onClick={() => postInvoice('ar', inv.id)}
                                >
                                  {postingId === inv.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3 mr-1" />
                                  )}
                                  Post GL
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {arInvoices.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-muted-foreground">
                            No customer invoices yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </DataTableShell>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payable" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts payable</CardTitle>
              <CardDescription>Supplier invoices — record bills from vendors</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DataTableShell label="AP invoices">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Invoice #</th>
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-left py-2 px-3">Due</th>
                        <th className="text-right py-2 px-3">Total</th>
                        <th className="text-left py-2 px-3">Status</th>
                        <th className="text-right py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apInvoices.map((inv) => (
                        <tr key={inv.id} className="border-b hover:bg-muted/40">
                          <td className="py-2 px-3 font-mono">{inv.invoice_number}</td>
                          <td className="py-2 px-3">{inv.invoice_date}</td>
                          <td className="py-2 px-3">{inv.due_date || '—'}</td>
                          <td className="py-2 px-3 text-right">{fmt(Number(inv.total_amount))}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{inv.status}</Badge>
                            {inv.gl_journal_id && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                GL
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => printInvoice('ap', inv.id)}
                                title="Print invoice"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                              {!inv.gl_journal_id && inv.status === 'draft' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={postingId === inv.id}
                                  onClick={() => postInvoice('ap', inv.id)}
                                >
                                  {postingId === inv.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3 mr-1" />
                                  )}
                                  Post GL
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {apInvoices.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-muted-foreground">
                            No supplier invoices yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </DataTableShell>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={apOpen} onOpenChange={setApOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New supplier invoice (AP)</DialogTitle>
            <DialogDescription>Record a bill from a supplier before payment</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Invoice number</Label>
              <Input value={apNumber} onChange={(e) => setApNumber(e.target.value)} placeholder="SUP-2026-001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Invoice date</Label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subtotal (KES)</Label>
                <Input type="number" min={0} value={apSubtotal} onChange={(e) => setApSubtotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>VAT / tax (KES)</Label>
                <Input type="number" min={0} value={apTax} onChange={(e) => setApTax(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApOpen(false)}>Cancel</Button>
            <Button onClick={createAp} disabled={submitting}>Create invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={arOpen} onOpenChange={setArOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New customer invoice (AR)</DialogTitle>
            <DialogDescription>Bill a customer for products or services</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Invoice number</Label>
              <Input value={arNumber} onChange={(e) => setArNumber(e.target.value)} placeholder="INV-2026-001" />
            </div>
            <div className="space-y-2">
              <Label>Customer (optional)</Label>
              <Select value={arCustomerId || 'none'} onValueChange={(v) => setArCustomerId(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Invoice date</Label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subtotal (KES)</Label>
                <Input type="number" min={0} value={arSubtotal} onChange={(e) => setArSubtotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>VAT / tax (KES)</Label>
                <Input type="number" min={0} value={arTax} onChange={(e) => setArTax(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArOpen(false)}>Cancel</Button>
            <Button onClick={createAr} disabled={submitting}>Create invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fromOrderOpen} onOpenChange={setFromOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice from sales order</DialogTitle>
            <DialogDescription>
              Creates an AR invoice from order subtotal, tax, and total. Links CRM customer when possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem
                      key={o.id}
                      value={o.id}
                      disabled={invoicedOrderIds.has(o.id)}
                    >
                      {o.order_number} — KES {Number(o.total).toLocaleString()}
                      {invoicedOrderIds.has(o.id) ? ' (invoiced)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={postOrderToGl}
                onChange={(e) => setPostOrderToGl(e.target.checked)}
              />
              Post to general ledger immediately
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFromOrderOpen(false)}>Cancel</Button>
            <Button onClick={createFromOrder} disabled={submitting}>Create invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
