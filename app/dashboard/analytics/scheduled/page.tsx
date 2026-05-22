'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarClock, Plus, Mail, MessageSquare } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

interface ScheduledReport {
  id: string
  report_type: string
  frequency: string
  recipients: string[] | unknown
  last_run_at: string | null
  active: number
  created_at: string
}

export default function ScheduledReportsPage() {
  const meta = useDashboardPageMeta()

  const [reports, setReports] = useState<ScheduledReport[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reportType, setReportType] = useState('kpi-summary')
  const [frequency, setFrequency] = useState('weekly')
  const [recipients, setRecipients] = useState('')
  const [phones, setPhones] = useState('')
  const [chEmail, setChEmail] = useState(true)
  const [chSms, setChSms] = useState(false)
  const [chWhatsapp, setChWhatsapp] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { reports: ScheduledReport[] }
      }>('/api/v2/analytics/scheduled?limit=100')
      if (data.success && data.data?.reports) {
        setReports(data.data.reports)
      }
    } catch {
      toast.error('Failed to load scheduled reports')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const emailList = recipients.split(',').map((e) => e.trim()).filter(Boolean)
    if (emailList.length === 0) {
      toast.error('At least one recipient email is required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/analytics/scheduled',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType,
            frequency,
            recipients: emailList,
            phoneRecipients: phones.split(',').map((p) => p.trim()).filter(Boolean),
            deliveryChannels: [
              ...(chEmail && emailList.length ? ['email'] : []),
              ...(chSms ? ['sms'] : []),
              ...(chWhatsapp ? ['whatsapp'] : []),
            ],
            exportFormat,
            periodDays: 30,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create report')
        return
      }
      toast.success('Scheduled report created')
      setAddOpen(false)
      setRecipients('')
      await fetchReports()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (report: ScheduledReport) => {
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/analytics/scheduled',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: report.id, active: !report.active }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not update report')
        return
      }
      await fetchReports()
    } catch {
      toast.error('Network error')
    }
  }

  const parseRecipients = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed.map(String) : []
      } catch {
        return []
      }
    }
    return []
  }

  const activeCount = reports.filter((r) => r.active).length

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Schedule Report
        </Button></>}>
<div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total schedules" value={reports.length} icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Active" value={activeCount} icon={<Mail className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Paused" value={reports.length - activeCount} icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report schedules</CardTitle>
          <CardDescription>
            Email, SMS, and webhook delivery — configure channels in API or use{' '}
            <a href="/dashboard/analytics/reports" className="text-primary underline">Reports hub</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => {
              const emails = parseRecipients(report.recipients)
              return (
                <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{report.report_type}</p>
                      <Badge variant="outline">{report.frequency}</Badge>
                      <Badge className={report.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {report.active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {emails.join(', ') || 'No recipients'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last run: {report.last_run_at ? String(report.last_run_at).slice(0, 16) : 'Never'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(report)}>
                    {report.active ? 'Pause' : 'Activate'}
                  </Button>
                </div>
              )
            })}
            {reports.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-8">No scheduled reports yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a report</DialogTitle>
            <DialogDescription>Recipients receive exports on the chosen cadence.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Report type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpi-summary">KPI Summary</SelectItem>
                  <SelectItem value="executive-summary">Executive Dashboard</SelectItem>
                  <SelectItem value="traceability">Traceability (EU)</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="profit-loss">Profit & Loss (IFRS)</SelectItem>
                  <SelectItem value="trial-balance">Trial Balance</SelectItem>
                  <SelectItem value="commerce-orders">Commerce Orders</SelectItem>
                  <SelectItem value="coldchain-compliance">Cold Chain / HACCP</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="fishing-operations">Fishing Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="ops@example.com, finance@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phones (SMS / WhatsApp)</Label>
              <Input value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="254712345678" />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={chEmail} onCheckedChange={(v) => setChEmail(v === true)} />
                <Mail className="h-4 w-4" /> Email
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={chSms} onCheckedChange={(v) => setChSms(v === true)} />
                <MessageSquare className="h-4 w-4" /> SMS
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={chWhatsapp} onCheckedChange={(v) => setChWhatsapp(v === true)} />
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </label>
            </div>
            <div className="space-y-2">
              <Label>Export format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

