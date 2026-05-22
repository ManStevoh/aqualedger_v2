'use client'

import { useState, useEffect } from 'react'
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
import { StatCard } from '@/components/dashboard/stat-card'
import { BookOpen, Plus, Scale, Receipt, FileText, Percent } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { ModulePageHeader } from '@/components/dashboard/module-page-header'
import { ListPageToolbar } from '@/components/dashboard/list-page-toolbar'
import { ACCOUNTING_WORKSPACE_NAV, WorkspaceNav } from '@/components/dashboard/workspace-nav'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'

interface GlAccount {
  id: string
  code: string
  name: string
  type: string
}

interface JournalLine {
  id: string
  account_id: string
  debit: number
  credit: number
  memo: string | null
  account_code?: string
  account_name?: string
}

interface JournalEntry {
  id: string
  entry_number: string
  entry_date: string
  description: string
  status: string
  lines?: JournalLine[]
}

interface TaxCode {
  id: string
  code: string
  name: string
  rate_pct: number
  type: string
  country_code: string
  active: number
}

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
}

interface ArInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  total_amount: number
  status: string
  currency: string
}

export default function LedgerPage() {
  const meta = useDashboardPageMeta({
    description: 'Chart of accounts, journal entries, AP/AR, and tax codes',
  })
  const [accounts, setAccounts] = useState<GlAccount[]>([])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([])
  const [apInvoices, setApInvoices] = useState<ApInvoice[]>([])
  const [arInvoices, setArInvoices] = useState<ArInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [taxOpen, setTaxOpen] = useState(false)
  const [apOpen, setApOpen] = useState(false)
  const [arOpen, setArOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [debitAccountId, setDebitAccountId] = useState('')
  const [creditAccountId, setCreditAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [taxCode, setTaxCode] = useState('')
  const [taxName, setTaxName] = useState('')
  const [taxRate, setTaxRate] = useState('16')
  const [apNumber, setApNumber] = useState('')
  const [apSubtotal, setApSubtotal] = useState('')
  const [apTax, setApTax] = useState('')
  const [arNumber, setArNumber] = useState('')
  const [arSubtotal, setArSubtotal] = useState('')
  const [arTax, setArTax] = useState('')
  const [entryStatusFilter, setEntryStatusFilter] = useState<string>('all')
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [apStatusFilter, setApStatusFilter] = useState<string>('all')
  const [arStatusFilter, setArStatusFilter] = useState<string>('all')
  const [seedingCoa, setSeedingCoa] = useState(false)

  const seedDefaultChart = async () => {
    setSeedingCoa(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { created: number; message?: string }
        error?: string
      }>('/api/v2/accounting/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingOnly: true }),
      })
      if (!res.success) {
        toast.error(res.error || 'Could not seed chart')
        return
      }
      toast.success(res.data?.message || `Added ${res.data?.created ?? 0} accounts`)
      await fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setSeedingCoa(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [entryStatusFilter, accountTypeFilter, fromDate, toDate, apStatusFilter, arStatusFilter])

  const fetchAll = async () => {
    try {
      const ledgerParams = new URLSearchParams({ resource: 'all', limit: '100' })
      if (entryStatusFilter !== 'all') ledgerParams.set('status', entryStatusFilter)
      if (accountTypeFilter !== 'all') ledgerParams.set('accountType', accountTypeFilter)
      if (fromDate) ledgerParams.set('fromDate', fromDate)
      if (toDate) ledgerParams.set('toDate', toDate)
      const apParams = new URLSearchParams({ limit: '50' })
      if (apStatusFilter !== 'all') apParams.set('status', apStatusFilter)
      const arParams = new URLSearchParams({ limit: '50' })
      if (arStatusFilter !== 'all') arParams.set('status', arStatusFilter)

      const [ledger, tax, ap, ar] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { accounts: GlAccount[]; entries: JournalEntry[] } }>(
          `/api/v2/accounting/ledger?${ledgerParams}`,
        ),
        authFetchJson<{ success: boolean; data?: { taxCodes: TaxCode[] } }>(
          '/api/v2/accounting/tax-codes',
        ),
        authFetchJson<{ success: boolean; data?: { invoices: ApInvoice[] } }>(
          `/api/v2/accounting/ap?${apParams}`,
        ),
        authFetchJson<{ success: boolean; data?: { invoices: ArInvoice[] } }>(
          `/api/v2/accounting/ar?${arParams}`,
        ),
      ])
      if (ledger.success && ledger.data) {
        setAccounts(ledger.data.accounts ?? [])
        setEntries(ledger.data.entries ?? [])
      }
      if (tax.success && tax.data) setTaxCodes(tax.data.taxCodes ?? [])
      if (ap.success && ap.data) setApInvoices(ap.data.invoices ?? [])
      if (ar.success && ar.data) setArInvoices(ar.data.invoices ?? [])
    } catch {
      toast.error('Failed to load accounting data')
    } finally {
      setLoading(false)
    }
  }

  const handlePostEntry = async () => {
    if (!description.trim() || !debitAccountId || !creditAccountId || !amount) {
      toast.error('Fill in all fields')
      return
    }
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (debitAccountId === creditAccountId) {
      toast.error('Debit and credit accounts must differ')
      return
    }

    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/accounting/ledger',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryDate,
            description: description.trim(),
            lines: [
              { accountId: debitAccountId, debit: amt, credit: 0 },
              { accountId: creditAccountId, debit: 0, credit: amt },
            ],
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not post entry')
        return
      }
      toast.success('Journal entry posted')
      setAddOpen(false)
      setDescription('')
      setAmount('')
      await fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateTaxCode = async () => {
    if (!taxCode.trim() || !taxName.trim()) {
      toast.error('Code and name are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/accounting/tax-codes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: taxCode.trim(),
            name: taxName.trim(),
            ratePct: Number(taxRate) || 0,
            type: 'vat',
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create tax code')
        return
      }
      toast.success('Tax code created')
      setTaxOpen(false)
      setTaxCode('')
      setTaxName('')
      await fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAp = async () => {
    const subtotal = Number(apSubtotal)
    const taxAmount = Number(apTax) || 0
    if (!apNumber.trim() || !Number.isFinite(subtotal)) {
      toast.error('Invoice number and subtotal are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/accounting/ap',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: apNumber.trim(),
            invoiceDate: entryDate,
            subtotal,
            taxAmount,
            totalAmount: subtotal + taxAmount,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create AP invoice')
        return
      }
      toast.success('AP invoice created')
      setApOpen(false)
      setApNumber('')
      setApSubtotal('')
      setApTax('')
      await fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAr = async () => {
    const subtotal = Number(arSubtotal)
    const taxAmount = Number(arTax) || 0
    if (!arNumber.trim() || !Number.isFinite(subtotal)) {
      toast.error('Invoice number and subtotal are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/accounting/ar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: arNumber.trim(),
            invoiceDate: entryDate,
            subtotal,
            taxAmount,
            totalAmount: subtotal + taxAmount,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create AR invoice')
        return
      }
      toast.success('AR invoice created')
      setArOpen(false)
      setArNumber('')
      setArSubtotal('')
      setArTax('')
      await fetchAll()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const totalDebits = entries.reduce(
    (sum, e) => sum + (e.lines?.reduce((s, l) => s + Number(l.debit), 0) ?? 0),
    0,
  )

  const fmt = (n: number, currency = 'KES') =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(n)

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" />
            Post Entry
          </Button>
        }
      />
      <WorkspaceNav items={ACCOUNTING_WORKSPACE_NAV} />

      {!loading && accounts.length < 28 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Standard chart of accounts</p>
              <p className="text-sm text-muted-foreground">
                Each company gets a default fisheries GL (cash, inventory, AP/AR, payroll, VAT, vessel
                costs). You have {accounts.length} account(s) — load the full template to post AP/AR and
                payroll correctly.
              </p>
            </div>
            <Button variant="secondary" onClick={seedDefaultChart} disabled={seedingCoa}>
              {seedingCoa ? 'Loading…' : 'Load default chart'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="GL Accounts"
          value={accounts.length}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Journal Entries"
          value={entries.length}
          icon={<Scale className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Posted Debits"
          value={`KES ${totalDebits.toLocaleString()}`}
          icon={<Scale className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      <Tabs defaultValue="ledger">
        <TabsList className="flex-wrap">
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="tax">Tax Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4 space-y-4">
          <ListPageToolbar
            filters={
              <>
                <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Account type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entryStatusFilter} onValueChange={setEntryStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Entry status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" className="w-[160px]" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="From" />
                <Input type="date" className="w-[160px]" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="To" />
              </>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chart of Accounts</CardTitle>
                <CardDescription>
                  {accounts.length} accounts · standard fisheries template (IFRS-style codes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Code</th>
                        <th className="text-left py-2 px-3 font-medium">Name</th>
                        <th className="text-left py-2 px-3 font-medium">Type</th>
                        <th className="text-left py-2 px-3 font-medium">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono">{a.code}</td>
                          <td className="py-2 px-3">{a.name}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{a.type}</Badge>
                          </td>
                          <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{a.id.slice(0, 8)}…</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Journal Entries</CardTitle>
                <CardDescription>Double-entry postings with lines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-auto">
                  {entries.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground">No journal entries yet.</p>
                  )}
                  {entries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{entry.entry_number}</span>
                        <Badge>{entry.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {entry.entry_date} — {entry.description}
                      </p>
                      <div className="text-xs space-y-1">
                        {entry.lines?.map((line) => (
                          <div key={line.id} className="flex justify-between">
                            <span>{line.account_code} {line.account_name}</span>
                            <span>
                              {Number(line.debit) > 0 && `Dr ${Number(line.debit).toLocaleString()}`}
                              {Number(line.credit) > 0 && `Cr ${Number(line.credit).toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ap" className="mt-4 space-y-4">
          <ListPageToolbar
            filters={
              <Select value={apStatusFilter} onValueChange={setApStatusFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            }
            actions={
              <Button size="sm" className="gap-2" onClick={() => setApOpen(true)}>
                <Plus className="h-4 w-4" />
                New AP Invoice
              </Button>
            }
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Accounts Payable
              </CardTitle>
              <CardDescription>Supplier invoices (AP)</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Invoice #</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Due</th>
                    <th className="text-right py-2 px-3">Subtotal</th>
                    <th className="text-right py-2 px-3">Total</th>
                    <th className="text-left py-2 px-3">Currency</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono">{inv.invoice_number}</td>
                      <td className="py-2 px-3">{inv.invoice_date}</td>
                      <td className="py-2 px-3">{inv.due_date || '—'}</td>
                      <td className="py-2 px-3 text-right">{fmt(Number(inv.subtotal ?? inv.total_amount), inv.currency)}</td>
                      <td className="py-2 px-3 text-right">{fmt(Number(inv.total_amount), inv.currency)}</td>
                      <td className="py-2 px-3">{inv.currency}</td>
                      <td className="py-2 px-3"><Badge variant="outline">{inv.status}</Badge></td>
                    </tr>
                  ))}
                  {apInvoices.length === 0 && !loading && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No AP invoices yet</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ar" className="mt-4 space-y-4">
          <ListPageToolbar
            filters={
              <Select value={arStatusFilter} onValueChange={setArStatusFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            }
            actions={
              <Button size="sm" className="gap-2" onClick={() => setArOpen(true)}>
                <Plus className="h-4 w-4" />
                New AR Invoice
              </Button>
            }
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Accounts Receivable
              </CardTitle>
              <CardDescription>Customer invoices (AR)</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Invoice #</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Due</th>
                    <th className="text-right py-2 px-3">Total</th>
                    <th className="text-left py-2 px-3">Currency</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {arInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono">{inv.invoice_number}</td>
                      <td className="py-2 px-3">{inv.invoice_date}</td>
                      <td className="py-2 px-3">{inv.due_date || '—'}</td>
                      <td className="py-2 px-3 text-right">{fmt(Number(inv.total_amount), inv.currency)}</td>
                      <td className="py-2 px-3">{inv.currency}</td>
                      <td className="py-2 px-3"><Badge variant="outline">{inv.status}</Badge></td>
                    </tr>
                  ))}
                  {arInvoices.length === 0 && !loading && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No AR invoices yet</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="mt-4 space-y-4">
          <ListPageToolbar
            actions={
              <Button size="sm" className="gap-2" onClick={() => setTaxOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Tax Code
              </Button>
            }
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Tax Codes
              </CardTitle>
              <CardDescription>VAT and withholding tax rates</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Code</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-right py-2 px-3">Rate</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Country</th>
                  </tr>
                </thead>
                <tbody>
                  {taxCodes.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono">{t.code}</td>
                      <td className="py-2 px-3">{t.name}</td>
                      <td className="py-2 px-3 text-right">{Number(t.rate_pct).toFixed(2)}%</td>
                      <td className="py-2 px-3"><Badge variant="outline">{t.type}</Badge></td>
                      <td className="py-2 px-3">{t.country_code}</td>
                    </tr>
                  ))}
                  {taxCodes.length === 0 && !loading && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No tax codes yet</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post journal entry</DialogTitle>
            <DialogDescription>Creates a balanced two-line journal entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Debit account</Label>
              <Select value={debitAccountId} onValueChange={setDebitAccountId}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Credit account</Label>
              <Select value={creditAccountId} onValueChange={setCreditAccountId}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input type="number" min={0.01} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handlePostEntry} disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={taxOpen} onOpenChange={setTaxOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add tax code</DialogTitle>
            <DialogDescription>Register a VAT or withholding tax rate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder="VAT16" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={taxName} onChange={(e) => setTaxName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rate (%)</Label>
              <Input type="number" min={0} step={0.001} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaxOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTaxCode} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={apOpen} onOpenChange={setApOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New AP invoice</DialogTitle>
            <DialogDescription>Record a supplier payable.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Invoice number</Label>
              <Input value={apNumber} onChange={(e) => setApNumber(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <Input type="number" min={0} step={0.01} value={apSubtotal} onChange={(e) => setApSubtotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input type="number" min={0} step={0.01} value={apTax} onChange={(e) => setApTax(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAp} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={arOpen} onOpenChange={setArOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New AR invoice</DialogTitle>
            <DialogDescription>Record a customer receivable.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Invoice number</Label>
              <Input value={arNumber} onChange={(e) => setArNumber(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <Input type="number" min={0} step={0.01} value={arSubtotal} onChange={(e) => setArSubtotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input type="number" min={0} step={0.01} value={arTax} onChange={(e) => setArTax(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAr} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
