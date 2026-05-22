'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Mail, MessageSquare, Settings, FileText, Send, BarChart3 } from 'lucide-react'

interface Settings {
  brand_name: string | null
  reply_to_email: string | null
  default_report_emails: string[]
  default_report_phones: string[]
  default_bcc_emails: string[]
  email_footer_html: string | null
  logo_url: string | null
}

interface Template {
  id: string
  template_key: string
  name: string
  subject: string | null
  body_html: string | null
  channel: string
}

interface Message {
  id: string
  channel: string
  recipient: string
  subject: string | null
  status: string
  message_type: string
  created_at: string
}

export default function CommunicationsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [emailProvider, setEmailProvider] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [broadcastTo, setBroadcastTo] = useState('')
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [setRes, tplRes, msgRes] = await Promise.all([
        authFetchJson<{
          success: boolean
          data?: { settings: Settings; emailStatus: { provider: string; configured: boolean } }
        }>('/api/v2/communications/settings'),
        authFetchJson<{ success: boolean; data?: { templates: Template[] } }>(
          '/api/v2/communications/templates',
        ),
        authFetchJson<{ success: boolean; data?: { messages: Message[] } }>(
          '/api/v2/communications/messages?limit=50',
        ),
      ])
      if (setRes.success && setRes.data) {
        setSettings(setRes.data.settings)
        setEmailProvider(setRes.data.emailStatus.provider)
      }
      if (tplRes.success && tplRes.data?.templates) setTemplates(tplRes.data.templates)
      if (msgRes.success && msgRes.data?.messages) setMessages(msgRes.data.messages as Message[])
    } catch {
      toast.error('Failed to load communications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveSettings = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/communications/settings', {
        method: 'PUT',
        body: JSON.stringify({
          brandName: settings.brand_name,
          replyToEmail: settings.reply_to_email || '',
          defaultReportEmails: settings.default_report_emails,
          defaultReportPhones: settings.default_report_phones,
          defaultBccEmails: settings.default_bcc_emails,
          emailFooterHtml: settings.email_footer_html,
          logoUrl: settings.logo_url || '',
        }),
      })
      if (res.success) {
        toast.success('Settings saved')
        load()
      }
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const saveTemplate = async (tpl: Template) => {
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/communications/templates', {
        method: 'PATCH',
        body: JSON.stringify({
          id: tpl.id,
          subject: tpl.subject,
          bodyHtml: tpl.body_html,
        }),
      })
      if (res.success) toast.success('Template updated')
    } catch {
      toast.error('Template save failed')
    }
  }

  const sendBroadcast = async () => {
    const recipients = broadcastTo.split(',').map((e) => e.trim()).filter(Boolean)
    if (!recipients.length) {
      toast.error('Enter at least one email')
      return
    }
    try {
      const res = await authFetchJson<{ success: boolean; data?: { sent: number; failed: number } }>(
        '/api/v2/communications/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            channel: 'email',
            recipients,
            subject: broadcastSubject,
            body: broadcastBody,
            html: `<p>${broadcastBody.replace(/\n/g, '<br/>')}</p>`,
            messageType: 'broadcast',
          }),
        },
      )
      if (res.success) {
        toast.success(`Sent ${res.data?.sent ?? 0}, failed ${res.data?.failed ?? 0}`)
        load()
      }
    } catch {
      toast.error('Broadcast failed')
    }
  }

  if (loading && !settings) {
    return <p className="p-6 text-muted-foreground">Loading communications…</p>
  }

  return (
    <DashboardPageLayout title="Communications" description="Email (SMTP / Resend / SendGrid), SMS, WhatsApp — branded reports and CRM campaigns" actions={
        <div className="flex gap-2">
          <Badge variant={emailProvider === 'stub' ? 'destructive' : 'default'}>
            Email: {emailProvider}
          </Badge>
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports hub
            </Link>
          </Button>
      }>

      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" />Settings</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1" />Templates</TabsTrigger>
          <TabsTrigger value="send"><Send className="h-4 w-4 mr-1" />Send</TabsTrigger>
          <TabsTrigger value="log"><MessageSquare className="h-4 w-4 mr-1" />Message log</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant communication settings</CardTitle>
              <CardDescription>Defaults pre-fill the Reports hub send dialog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div>
                <Label>Brand name</Label>
                <Input
                  value={settings?.brand_name ?? ''}
                  onChange={(e) =>
                    setSettings((s) => (s ? { ...s, brand_name: e.target.value } : s))
                  }
                />
              </div>
              <div>
                <Label>Reply-to email</Label>
                <Input
                  type="email"
                  value={settings?.reply_to_email ?? ''}
                  onChange={(e) =>
                    setSettings((s) => (s ? { ...s, reply_to_email: e.target.value } : s))
                  }
                />
              </div>
              <div>
                <Label>Default report emails (comma-separated)</Label>
                <Input
                  value={(settings?.default_report_emails ?? []).join(', ')}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            default_report_emails: e.target.value.split(',').map((x) => x.trim()),
                          }
                        : s,
                    )
                  }
                />
              </div>
              <div>
                <Label>Default BCC</Label>
                <Input
                  value={(settings?.default_bcc_emails ?? []).join(', ')}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            default_bcc_emails: e.target.value.split(',').map((x) => x.trim()),
                          }
                        : s,
                    )
                  }
                />
              </div>
              <div>
                <Label>Email footer (HTML)</Label>
                <Textarea
                  rows={3}
                  value={settings?.email_footer_html ?? ''}
                  onChange={(e) =>
                    setSettings((s) => (s ? { ...s, email_footer_html: e.target.value } : s))
                  }
                />
              </div>
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving…' : 'Save settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-4">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tpl.name}</CardTitle>
                <CardDescription>{tpl.template_key} · {tpl.channel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={tpl.subject ?? ''}
                    onChange={(e) =>
                      setTemplates((list) =>
                        list.map((t) =>
                          t.id === tpl.id ? { ...t, subject: e.target.value } : t,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Body HTML (use {'{{reportTitle}}'}, {'{{shareUrl}}'}, etc.)</Label>
                  <Textarea
                    rows={4}
                    value={tpl.body_html ?? ''}
                    onChange={(e) =>
                      setTemplates((list) =>
                        list.map((t) =>
                          t.id === tpl.id ? { ...t, body_html: e.target.value } : t,
                        ),
                      )
                    }
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => saveTemplate(tpl)}>
                  Save template
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="send" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick email broadcast</CardTitle>
              <CardDescription>Send to multiple recipients; logged in message history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div>
                <Label>Recipients</Label>
                <Input
                  value={broadcastTo}
                  onChange={(e) => setBroadcastTo(e.target.value)}
                  placeholder="ops@co.com, finance@co.com"
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={broadcastSubject} onChange={(e) => setBroadcastSubject(e.target.value)} />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={5} value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} />
              </div>
              <Button onClick={sendBroadcast}>
                <Send className="h-4 w-4 mr-2" />
                Send email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Outbound message log</CardTitle>
              <CardDescription>Reports, campaigns, and manual sends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="flex justify-between border-b py-2 text-sm">
                  <span>
                    <Badge variant="outline" className="mr-2">{m.channel}</Badge>
                    {m.recipient}
                    {m.subject ? ` — ${m.subject}` : ''}
                  </span>
                  <Badge variant={m.status === 'sent' ? 'default' : 'destructive'}>{m.status}</Badge>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-muted-foreground py-4">No messages yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  )
}
