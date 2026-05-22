'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { Loader2, Save, Settings, Shield, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface PlatformSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
  signupLocked: boolean
  announcementEnabled: boolean
  announcementTitle: string
  announcementBody: string
}

const DEFAULT_SETTINGS: PlatformSettings = {
  maintenanceMode: false,
  maintenanceMessage: '',
  signupLocked: false,
  announcementEnabled: false,
  announcementTitle: '',
  announcementBody: '',
}

export default function PlatformSettingsPage() {
  const { currentRole } = useAppStore()
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: PlatformSettings; error?: string }>(
        '/api/v2/platform/settings',
      )
      if (!res.success) {
        toast.error(res.error || 'Failed to load settings')
        return
      }
      if (res.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...res.data })
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

  const save = async () => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: PlatformSettings; error?: string }>(
        '/api/v2/platform/settings',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Save failed')
        return
      }
      toast.success('Platform settings saved')
      if (res.data) setSettings({ ...DEFAULT_SETTINGS, ...res.data })
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const sendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      toast.error('Subject and body are required')
      return
    }
    setBroadcasting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { enqueued: number; recipients: string[] }
        error?: string
      }>('/api/v2/platform/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: broadcastSubject.trim(), body: broadcastBody.trim() }),
      })
      if (!res.success) {
        toast.error(res.error || 'Broadcast failed')
        return
      }
      const count = res.data?.enqueued ?? 0
      toast.success(`Queued ${count} email${count === 1 ? '' : 's'} to tenant owners`)
      setBroadcastSubject('')
      setBroadcastBody('')
    } catch {
      toast.error('Network error')
    } finally {
      setBroadcasting(false)
    }
  }

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (currentRole !== 'super_admin') {
    return (
      <div className="py-12 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-medium">Super administrator access required</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Platform settings
          </h1>
          <p className="text-muted-foreground">Maintenance mode, signup lock, and announcements</p>
        </div>
        <Button className="gap-2" onClick={save} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <AdminHubNav />

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading settings…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance mode</CardTitle>
              <CardDescription>
                When enabled, non-admin users see a maintenance banner and may be blocked from write operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="maintenance-mode">Enable maintenance mode</Label>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => update('maintenanceMode', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance message</Label>
                <Textarea
                  id="maintenance-message"
                  value={settings.maintenanceMessage}
                  onChange={(e) => update('maintenanceMessage', e.target.value)}
                  placeholder="We are performing scheduled maintenance…"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signup lock</CardTitle>
              <CardDescription>Prevent new tenant registrations while locked.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="signup-lock">Lock new signups</Label>
                <Switch
                  id="signup-lock"
                  checked={settings.signupLocked}
                  onCheckedChange={(checked) => update('signupLocked', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Platform announcement</CardTitle>
              <CardDescription>
                Display a banner to all dashboard users when enabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="announcement-enabled">Show announcement</Label>
                <Switch
                  id="announcement-enabled"
                  checked={settings.announcementEnabled}
                  onCheckedChange={(checked) => update('announcementEnabled', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  value={settings.announcementTitle}
                  onChange={(e) => update('announcementTitle', e.target.value)}
                  placeholder="Scheduled upgrade this weekend"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-body">Body</Label>
                <Textarea
                  id="announcement-body"
                  value={settings.announcementBody}
                  onChange={(e) => update('announcementBody', e.target.value)}
                  placeholder="Details shown in the dashboard banner…"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email broadcast
              </CardTitle>
              <CardDescription>
                Send an email to every tenant owner across active organizations. Messages are queued in the
                notification outbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-subject">Subject</Label>
                <Input
                  id="broadcast-subject"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="Important platform update"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-body">Body</Label>
                <Textarea
                  id="broadcast-body"
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Message sent to all tenant owners…"
                  rows={5}
                />
              </div>
              <Button className="gap-2" onClick={sendBroadcast} disabled={broadcasting || loading}>
                {broadcasting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {broadcasting ? 'Sending…' : 'Send broadcast'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
