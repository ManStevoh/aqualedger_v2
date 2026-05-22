'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { authFetchJson } from '@/lib/api'
import {
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Webhook,
  Download,
  Share2,
  Send,
  BarChart3,
  CalendarClock,
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportDef {
  id: string
  name: string
  description: string
  category: string
  standards: string[]
  defaultFormat: string
}

interface DeliveryRow {
  id: string
  channel: string
  recipient: string
  status: string
  report_title?: string
  report_type?: string
  created_at: string
}

export default function ReportsHubPage() {
  const [catalog, setCatalog] = useState<ReportDef[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sendOpen, setSendOpen] = useState(false)
  const [reportType, setReportType] = useState('kpi-summary')
  const [format, setFormat] = useState('csv')
  const [periodDays, setPeriodDays] = useState('30')
  const [emails, setEmails] = useState('')
  const [phones, setPhones] = useState('')
  const [chEmail, setChEmail] = useState(true)
  const [chSms, setChSms] = useState(false)
  const [chWhatsapp, setChWhatsapp] = useState(false)
  const [chWebhook, setChWebhook] = useState(false)
  const [bcc, setBcc] = useState('')
  const [sending, setSending] = useState(false)
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [catRes, delRes] = await Promise.all([
        authFetchJson<{
          success: boolean
          data?: {
            catalog: ReportDef[]
            settings?: {
              default_report_emails: string[]
              default_report_phones: string[]
              default_bcc_emails: string[]
            }
          }
        }>('/api/v2/analytics/reports?view=config'),
        authFetchJson<{ success: boolean; data?: { deliveries: DeliveryRow[] } }>(
          '/api/v2/analytics/reports?view=deliveries',
        ),
      ])
      if (catRes.success && catRes.data?.catalog) setCatalog(catRes.data.catalog)
      if (catRes.success && catRes.data?.settings) {
        const s = catRes.data.settings
        if (s.default_report_emails?.length && !emails) {
          setEmails(s.default_report_emails.join(', '))
        }
        if (s.default_report_phones?.length && !phones) {
          setPhones(s.default_report_phones.join(', '))
        }
        if (s.default_bcc_emails?.length && !bcc) {
          setBcc(s.default_bcc_emails.join(', '))
        }
      }
      if (delRes.success && delRes.data?.deliveries) {
        setDeliveries(delRes.data.deliveries as DeliveryRow[])
      }
    } catch {
      toast.error('Failed to load reports hub')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const download = (type: string, fmt: string) => {
    window.open(
      `/api/v2/analytics/export?type=${encodeURIComponent(type)}&format=${fmt}&periodDays=${periodDays}`,
      '_blank',
    )
  }

  const sendReport = async () => {
    const emailList = emails.split(',').map((e) => e.trim()).filter(Boolean)
    const phoneList = phones.split(',').map((p) => p.trim()).filter(Boolean)
    const channels: string[] = []
    if (chEmail && emailList.length) channels.push('email')
    if (chSms && phoneList.length) channels.push('sms')
    if (chWhatsapp && phoneList.length) channels.push('whatsapp')
    if (chWebhook) channels.push('webhook')
    if (channels.length === 0) {
      toast.error('Select at least one channel with recipients')
      return
    }

    setSending(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { shareUrl: string | null; deliveries: { status: string }[] }
        error?: string
      }>('/api/v2/analytics/reports', {
        method: 'POST',
        body: JSON.stringify({
          action: 'deliver',
          reportType,
          format,
          periodDays: Number(periodDays),
          channels,
          emailRecipients: emailList,
          phoneRecipients: phoneList,
          bccRecipients: bcc.split(',').map((e) => e.trim()).filter(Boolean),
          shareExpiresHours: 168,
        }),
      })
      if (!res.success) throw new Error(res.error || 'Send failed')
      if (res.data?.shareUrl) setLastShareUrl(res.data.shareUrl)
      toast.success('Report sent')
      setSendOpen(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  const retryDelivery = async (deliveryId: string) => {
    try {
      const res = await authFetchJson<{ success: boolean }>(
        `/api/v2/analytics/reports/deliveries/${deliveryId}/retry`,
        { method: 'POST', body: '{}' },
      )
      if (res.success) {
        toast.success('Retry queued')
        load()
      }
    } catch {
      toast.error('Retry failed')
    }
  }

  const runScheduled = async () => {
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { processed: number }
      }>('/api/v2/analytics/reports/run-scheduled', { method: 'POST', body: '{}' })
      if (res.success) {
        toast.success(`Processed ${res.data?.processed ?? 0} scheduled report(s)`)
        load()
      }
    } catch {
      toast.error('Failed to run scheduled reports')
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Reports & delivery
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            ISO 8601 periods · UTF-8 CSV (Excel) · HTML email · HMAC webhooks · GDPR share links · IFRS financials · EU traceability
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/communications">Settings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics/scheduled">
              <CalendarClock className="h-4 w-4 mr-2" />
              Schedules
            </Link>
          </Button>
          <Button variant="outline" onClick={runScheduled}>
            Run due schedules
          </Button>
          <Button onClick={() => setSendOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send report
          </Button>
        </div>
      </div>

      {lastShareUrl && (
        <Card className="border-sky-200 bg-sky-50/50 dark:bg-sky-950/20">
          <CardContent className="pt-4 flex flex-wrap items-center gap-3">
            <Share2 className="h-5 w-5 text-sky-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Shareable link (7-day expiry)</p>
              <p className="text-xs text-muted-foreground truncate">{lastShareUrl}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(lastShareUrl)
                toast.success('Link copied')
              }}
            >
              Copy link
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {catalog.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base">{r.name}</CardTitle>
                <Badge variant="outline">{r.category}</Badge>
              </div>
              <CardDescription className="text-xs line-clamp-2">{r.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {r.standards.slice(0, 2).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => download(r.id, 'csv')}>
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => download(r.id, 'html')}>
                  HTML
                </Button>
                <Button size="sm" variant="outline" onClick={() => download(r.id, 'json')}>
                  JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && catalog.length === 0 && (
          <p className="text-muted-foreground col-span-full">No reports in catalog.</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent deliveries</CardTitle>
          <CardDescription>Email, SMS, WhatsApp, and webhook dispatch log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deliveries.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  {d.channel === 'email' && <Mail className="h-4 w-4" />}
                  {d.channel === 'sms' && <MessageSquare className="h-4 w-4" />}
                  {d.channel === 'webhook' && <Webhook className="h-4 w-4" />}
                  {d.channel === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                  <span className="font-medium">{d.report_title || d.report_type || 'Report'}</span>
                  <span className="text-muted-foreground">→ {d.recipient}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === 'sent' ? 'default' : 'destructive'}>{d.status}</Badge>
                  {d.status === 'failed' && (
                    <Button size="sm" variant="ghost" onClick={() => retryDelivery(d.id)}>
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {deliveries.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-6">No deliveries yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send report now</DialogTitle>
            <DialogDescription>
              Delivers via selected channels with CSV/HTML attachment and shareable download link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Report</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catalog.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Excel)</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Period (days)</Label>
                <Input value={periodDays} onChange={(e) => setPeriodDays(e.target.value)} type="number" min={1} max={365} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Channels</Label>
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
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={chWebhook} onCheckedChange={(v) => setChWebhook(v === true)} />
                  <Webhook className="h-4 w-4" /> Webhook
                </label>
              </div>
            </div>
            <div>
              <Label>Email recipients</Label>
              <Input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="ops@co.com, cfo@co.com" />
            </div>
            <div>
              <Label>Phone (SMS / WhatsApp), E.164 or 07…</Label>
              <Input value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="254712345678" />
            </div>
            <div>
              <Label>BCC (optional)</Label>
              <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="audit@co.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button onClick={sendReport} disabled={sending}>
              {sending ? 'Sending…' : 'Send report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
