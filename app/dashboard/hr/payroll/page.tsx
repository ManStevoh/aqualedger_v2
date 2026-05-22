'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatCard } from '@/components/dashboard/stat-card'
import { Calculator, Calendar, DollarSign, FileText, Plus, Check, Banknote, BookOpen } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

interface PayrollLine {
  id: string
  employee_name?: string
  gross_pay: number
  tax_deduction: number
  other_deductions: number
  net_pay: number
}

interface PayrollRun {
  id: string
  period_start: string
  period_end: string
  status: string
  total_gross: number
  total_net: number
  gl_journal_id?: string | null
  created_at: string
  lines?: PayrollLine[]
}

export default function PayrollPage() {
  const meta = useDashboardPageMeta()

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPayroll = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { payrollRuns: PayrollRun[] }
      }>('/api/v2/hr/payroll?limit=100')
      if (data.success && data.data?.payrollRuns) {
        setPayrollRuns(data.data.payrollRuns)
      }
    } catch {
      toast.error('Failed to load payroll runs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayroll()
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const last = new Date(y, m + 1, 0).getDate()
    const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`
    setPeriodStart(start)
    setPeriodEnd(end)
  }, [])

  const loadDetail = async (id: string) => {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    const data = await authFetchJson<{ success: boolean; data?: { payrollRun: PayrollRun } }>(
      `/api/v2/hr/payroll/${id}`,
    )
    if (data.success && data.data?.payrollRun) {
      setPayrollRuns((runs) =>
        runs.map((r) => (r.id === id ? { ...r, lines: data.data!.payrollRun.lines } : r)),
      )
      setExpanded(id)
    }
  }

  const createRun = async () => {
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/hr/payroll', {
        method: 'POST',
        body: JSON.stringify({ periodStart, periodEnd }),
      })
      if (res.success) {
        toast.success('Payroll run created')
        setDialogOpen(false)
        await fetchPayroll()
      }
    } catch {
      toast.error('Failed to create payroll run')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id: string, status: 'approved' | 'paid') => {
    try {
      const res = await authFetchJson<{ success: boolean }>(`/api/v2/hr/payroll/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      if (res.success) {
        toast.success(`Payroll ${status}`)
        await fetchPayroll()
      }
    } catch {
      toast.error('Failed to update payroll')
    }
  }

  const postToGl = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean }>(`/api/v2/hr/payroll/${id}/post-gl`, {
        method: 'POST',
      })
      if (res.success) {
        toast.success('Posted to general ledger')
        await fetchPayroll()
      }
    } catch {
      toast.error('GL posting failed — approve payroll first')
    }
  }

  const draft = payrollRuns.filter((p) => p.status === 'draft').length
  const paid = payrollRuns.filter((p) => p.status === 'paid').length
  const totalNet = payrollRuns.reduce((sum, p) => sum + Number(p.total_net), 0)

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New payroll run
        </Button></>}>
<div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Runs" value={payrollRuns.length} icon={<FileText className="h-4 w-4" />} loading={loading} />
        <StatCard title="Draft" value={draft} icon={<Calendar className="h-4 w-4" />} loading={loading} />
        <StatCard title="Total Net" value={`KES ${totalNet.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
          <CardDescription>Click a row to view line items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {payrollRuns.map((run) => (
            <div key={run.id} className="border rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" className="text-left" onClick={() => loadDetail(run.id)}>
                  <p className="font-medium">
                    {String(run.period_start).slice(0, 10)} → {String(run.period_end).slice(0, 10)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gross KES {Number(run.total_gross).toLocaleString()} · Net KES {Number(run.total_net).toLocaleString()}
                  </p>
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>{run.status}</Badge>
                  {run.gl_journal_id && <Badge variant="secondary">GL posted</Badge>}
                  {run.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(run.id, 'approved')}>
                      <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                  )}
                  {run.status === 'approved' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(run.id, 'paid')}>
                        <Banknote className="h-3 w-3 mr-1" /> Mark paid
                      </Button>
                      {!run.gl_journal_id && (
                        <Button size="sm" onClick={() => postToGl(run.id)}>
                          <BookOpen className="h-3 w-3 mr-1" /> Post GL
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {expanded === run.id && run.lines && (
                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Employee</th>
                      <th className="text-right py-2">Gross</th>
                      <th className="text-right py-2">Tax</th>
                      <th className="text-right py-2">NHIF</th>
                      <th className="text-right py-2">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.lines.map((l) => (
                      <tr key={l.id} className="border-b">
                        <td className="py-2">{l.employee_name}</td>
                        <td className="text-right">{Number(l.gross_pay).toLocaleString()}</td>
                        <td className="text-right">{Number(l.tax_deduction).toLocaleString()}</td>
                        <td className="text-right">{Number(l.other_deductions).toLocaleString()}</td>
                        <td className="text-right font-medium">{Number(l.net_pay).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          {payrollRuns.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">No payroll runs — create one to calculate from active employee salaries</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New payroll run</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Period start</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <Label>Period end</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={createRun} disabled={submitting}>
              <Calculator className="h-4 w-4 mr-2" />
              Generate payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

