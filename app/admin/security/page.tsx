'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { RecaptchaVersion } from '@/lib/modules/security/recaptcha'
import {
  ExternalLink,
  Loader2,
  Save,
  ShieldCheck,
  Shield,
  TestTube2,
} from 'lucide-react'
import { toast } from 'sonner'

interface RecaptchaAdminState {
  enabled: boolean
  version: RecaptchaVersion
  siteKey: string
  secretKeyConfigured: boolean
  secretKeyHint: string | null
  minScore: number
  protectLogin: boolean
  protectRegister: boolean
  protectGuestCheckout: boolean
  hostnameAllowlist: string[]
}

interface RecaptchaAuditRow {
  id: string
  outcome: string
  recaptchaAction: string
  code?: string
  score?: number
  ipAddress?: string
  createdAt: string
}

const DEFAULT: RecaptchaAdminState = {
  enabled: false,
  version: 'v3',
  siteKey: '',
  secretKeyConfigured: false,
  secretKeyHint: null,
  minScore: 0.5,
  protectLogin: true,
  protectRegister: true,
  protectGuestCheckout: true,
  hostnameAllowlist: [],
}

export default function PlatformSecurityPage() {
  const { currentRole } = useAppStore()
  const [recaptcha, setRecaptcha] = useState<RecaptchaAdminState>(DEFAULT)
  const [secretKeyInput, setSecretKeyInput] = useState('')
  const [hostnameText, setHostnameText] = useState('')
  const [testToken, setTestToken] = useState('')
  const [testKeys, setTestKeys] = useState<{ siteKey: string; secretKey: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [recentEvents, setRecentEvents] = useState<RecaptchaAuditRow[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: {
          recaptcha: RecaptchaAdminState
          recentEvents?: RecaptchaAuditRow[]
          testKeys?: { siteKey: string; secretKey: string }
        }
        error?: string
      }>('/api/v2/platform/recaptcha')
      if (!res.success || !res.data?.recaptcha) {
        toast.error(res.error || 'Failed to load security settings')
        return
      }
      setRecaptcha(res.data.recaptcha)
      setHostnameText(res.data.recaptcha.hostnameAllowlist.join('\n'))
      if (res.data.testKeys) setTestKeys(res.data.testKeys)
      setRecentEvents(res.data.recentEvents ?? [])
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
      const hostnameAllowlist = hostnameText
        .split(/[\n,]+/)
        .map((h) => h.trim())
        .filter(Boolean)

      const body: Record<string, unknown> = {
        enabled: recaptcha.enabled,
        version: recaptcha.version,
        siteKey: recaptcha.siteKey,
        minScore: recaptcha.minScore,
        protectLogin: recaptcha.protectLogin,
        protectRegister: recaptcha.protectRegister,
        hostnameAllowlist,
      }
      if (secretKeyInput.trim()) {
        body.secretKey = secretKeyInput.trim()
      }

      const res = await authFetchJson<{
        success: boolean
        data?: { recaptcha: RecaptchaAdminState }
        error?: string
      }>('/api/v2/platform/recaptcha', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.success) {
        toast.error(res.error || 'Save failed')
        return
      }
      toast.success('reCAPTCHA settings saved')
      setSecretKeyInput('')
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const applyTestKeys = () => {
    if (!testKeys) return
    setRecaptcha((prev) => ({
      ...prev,
      enabled: true,
      siteKey: testKeys.siteKey,
      version: 'v3',
    }))
    setSecretKeyInput(testKeys.secretKey)
    toast.message('Test keys applied — save to persist')
  }

  const runTest = async () => {
    if (!testToken.trim()) {
      toast.error('Paste a token from a login attempt or Google test widget')
      return
    }
    setTesting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { verified: boolean; score?: number; error?: string; code?: string }
        error?: string
      }>('/api/v2/platform/recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: testToken.trim() }),
      })
      if (res.data?.verified) {
        toast.success(
          `Verification OK${res.data.score != null ? ` (score ${res.data.score})` : ''}`,
        )
      } else {
        toast.error(res.data?.error || res.error || 'Verification failed')
      }
    } catch {
      toast.error('Test request failed')
    } finally {
      setTesting(false)
    }
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
    <DashboardPageLayout title="Security &amp; reCAPTCHA" description="Google reCAPTCHA v3 (invisible) or v2 (checkbox) — GDPR-ready bot protection for auth" actions={
        <Button className="gap-2" onClick={save} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      }>


      <AdminHubNav />

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Google reCAPTCHA</CardTitle>
              <CardDescription>
                Register keys at{' '}
                <a
                  href="https://www.google.com/recaptcha/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 underline"
                >
                  Google reCAPTCHA Admin
                  <ExternalLink className="h-3 w-3" />
                </a>
                . v3 is recommended (ISO 27001-aligned providers, WCAG-friendly when configured).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="recaptcha-enabled">Enable reCAPTCHA protection</Label>
                <Switch
                  id="recaptcha-enabled"
                  checked={recaptcha.enabled}
                  onCheckedChange={(checked) =>
                    setRecaptcha((p) => ({ ...p, enabled: checked }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Select
                    value={recaptcha.version}
                    onValueChange={(v) =>
                      setRecaptcha((p) => ({ ...p, version: v as RecaptchaVersion }))
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v3">v3 — Invisible (score-based)</SelectItem>
                      <SelectItem value="v2_checkbox">v2 — &quot;I&apos;m not a robot&quot;</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {recaptcha.version === 'v3' && (
                  <div className="space-y-2">
                    <Label htmlFor="min-score">Minimum score (0.0–1.0)</Label>
                    <Input
                      id="min-score"
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={recaptcha.minScore}
                      onChange={(e) =>
                        setRecaptcha((p) => ({
                          ...p,
                          minScore: Number(e.target.value) || 0.5,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Google recommends 0.5 for production; use 0.3 for stricter regions.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site-key">Site key (public)</Label>
                  <Input
                    id="site-key"
                    value={recaptcha.siteKey}
                    onChange={(e) => setRecaptcha((p) => ({ ...p, siteKey: e.target.value }))}
                    placeholder="6Lc…"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-key">
                    Secret key {recaptcha.secretKeyConfigured && recaptcha.secretKeyHint
                      ? `(saved ${recaptcha.secretKeyHint})`
                      : ''}
                  </Label>
                  <Input
                    id="secret-key"
                    type="password"
                    value={secretKeyInput}
                    onChange={(e) => setSecretKeyInput(e.target.value)}
                    placeholder={
                      recaptcha.secretKeyConfigured
                        ? 'Leave blank to keep current secret'
                        : '6Lc…'
                    }
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {testKeys && (
                  <Button type="button" variant="secondary" size="sm" onClick={applyTestKeys}>
                    Use Google test keys (dev)
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <Label htmlFor="protect-login">Protect login</Label>
                  <Switch
                    id="protect-login"
                    checked={recaptcha.protectLogin}
                    onCheckedChange={(checked) =>
                      setRecaptcha((p) => ({ ...p, protectLogin: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <Label htmlFor="protect-register">Protect registration</Label>
                  <Switch
                    id="protect-register"
                    checked={recaptcha.protectRegister}
                    onCheckedChange={(checked) =>
                      setRecaptcha((p) => ({ ...p, protectRegister: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <Label htmlFor="protect-checkout">Guest checkout</Label>
                  <Switch
                    id="protect-checkout"
                    checked={recaptcha.protectGuestCheckout}
                    onCheckedChange={(checked) =>
                      setRecaptcha((p) => ({ ...p, protectGuestCheckout: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostnames">Hostname allowlist (optional)</Label>
                <Textarea
                  id="hostnames"
                  value={hostnameText}
                  onChange={(e) => setHostnameText(e.target.value)}
                  placeholder={'localhost\napp.yourdomain.com'}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  One hostname per line. Empty = accept any hostname returned by Google.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5" />
                Verify configuration
              </CardTitle>
              <CardDescription>
                Submit a token from login/register after enabling protection. With Google test keys in
                dev, use token <code className="text-xs">google-sandbox-pass</code> or run{' '}
                <code className="text-xs">node scripts/test-recaptcha-flow.mjs</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="reCAPTCHA response token"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={runTest} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test token'}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Recent verification events</CardTitle>
              <CardDescription>Audit trail for login, registration, and guest checkout</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="p-2 font-medium">Time</th>
                        <th className="p-2 font-medium">Action</th>
                        <th className="p-2 font-medium">Outcome</th>
                        <th className="p-2 font-medium">Score</th>
                        <th className="p-2 font-medium">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((ev) => (
                        <tr key={ev.id} className="border-b last:border-0">
                          <td className="p-2 whitespace-nowrap text-muted-foreground">
                            {new Date(ev.createdAt).toLocaleString()}
                          </td>
                          <td className="p-2">{ev.recaptchaAction}</td>
                          <td className="p-2">
                            <span
                              className={
                                ev.outcome === 'pass'
                                  ? 'text-green-600'
                                  : ev.outcome === 'fail'
                                    ? 'text-destructive'
                                    : 'text-amber-600'
                              }>
                              {ev.outcome}
                              {ev.code ? ` (${ev.code})` : ''}
                            </span>
                          </td>
                          <td className="p-2">{ev.score != null ? ev.score.toFixed(2) : '—'}</td>
                          <td className="p-2 font-mono text-xs">{ev.ipAddress ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Compliance &amp; privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                reCAPTCHA is operated by Google LLC. When enabled, Google may process device and
                interaction data per their{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Terms of Service
                </a>
                . Disclose this in your platform privacy notice (GDPR Art. 13 / CCPA).
              </p>
              <p>
                Server-side verification follows Google&apos;s siteverify API; tokens are single-use
                and never stored.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardPageLayout>
  )
}
