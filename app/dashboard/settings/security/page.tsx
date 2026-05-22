'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { authFetchJson } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { Monitor, Shield, LogOut, ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

interface UserSession {
  id: string
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown device'
  if (ua.includes('Mobile')) return 'Mobile browser'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  return ua.slice(0, 48) + (ua.length > 48 ? '…' : '')
}

export default function SecuritySessionsPage() {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [enrollmentUri, setEnrollmentUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const fetchMfa = useCallback(async () => {
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { mfa?: { enabled: boolean } }
      }>('/api/v2/auth/mfa')
      if (res.success && res.data?.mfa) setMfaEnabled(res.data.mfa.enabled)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    fetchMfa()
  }, [fetchMfa])

  const startMfa = async () => {
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { enrollment?: { otpauthUri: string; backupCodes: string[] } }
      }>('/api/v2/auth/mfa', { method: 'POST', body: JSON.stringify({}) })
      if (res.success && res.data?.enrollment) {
        setEnrollmentUri(res.data.enrollment.otpauthUri)
        setBackupCodes(res.data.enrollment.backupCodes || [])
        toast.success('Scan QR in your authenticator app')
      }
    } catch {
      toast.error('Could not start MFA setup')
    }
  }

  const confirmMfa = async () => {
    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/auth/mfa', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirm', token: mfaToken }),
      })
      if (res.success) {
        setMfaEnabled(true)
        setEnrollmentUri(null)
        toast.success('Two-factor authentication enabled')
      }
    } catch {
      toast.error('Invalid code')
    }
  }

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { sessions: UserSession[]; currentSessionId?: string }
      }>('/api/v2/auth/sessions')
      if (res.success && res.data) {
        setSessions(res.data.sessions || [])
        setCurrentSessionId(res.data.currentSessionId || null)
      } else {
        setSessions([])
      }
    } catch {
      setSessions([])
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const revokeOne = async (id: string) => {
    if (id === currentSessionId) {
      toast.error('Cannot revoke your current session here — use logout instead')
      return
    }
    try {
      const res = await authFetchJson<{ success: boolean; data?: { revoked: boolean }; error?: string }>(
        `/api/v2/auth/sessions?id=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      if (!res.success || !res.data?.revoked) {
        toast.error(res.error || 'Could not revoke session')
        return
      }
      toast.success('Session revoked')
      fetchSessions()
    } catch {
      toast.error('Network error')
    }
  }

  const revokeAllOthers = async () => {
    setRevoking(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { revokedCount: number }
        error?: string
      }>('/api/v2/auth/sessions?all=true', { method: 'DELETE' })
      if (!res.success) {
        toast.error(res.error || 'Could not revoke sessions')
        return
      }
      toast.success(`Revoked ${res.data?.revokedCount ?? 0} other session(s)`)
      fetchSessions()
    } catch {
      toast.error('Network error')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Security & sessions"
      description="Active logins across devices. Revoke suspicious sessions; your current browser session is kept when using Revoke all others."
      actions={
        <Button
          variant="destructive"
          className="gap-2"
          onClick={revokeAllOthers}
          disabled={revoking || sessions.length <= 1}
        >
          <LogOut className="h-4 w-4" />
          Revoke all others
        </Button>
      }
    >
      <Button variant="ghost" size="sm" className="-ml-2 gap-2" asChild>
        <Link href="/dashboard/settings">
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Two-factor authentication (TOTP)
          </CardTitle>
          <CardDescription>WCAG-compliant MFA · Google Authenticator, Authy, 1Password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Status:{' '}
            <Badge variant={mfaEnabled ? 'default' : 'secondary'}>
              {mfaEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </p>
          {!mfaEnabled && !enrollmentUri && (
            <Button onClick={startMfa}>Set up authenticator app</Button>
          )}
          {enrollmentUri && (
            <div className="space-y-3">
              <p className="text-xs break-all text-muted-foreground font-mono">{enrollmentUri}</p>
              {backupCodes.length > 0 && (
                <p className="text-xs">Backup codes: {backupCodes.join(', ')}</p>
              )}
              <div>
                <Label htmlFor="mfaToken">6-digit code</Label>
                <Input
                  id="mfaToken"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  maxLength={6}
                  className="mt-1 max-w-[200px]"
                />
              </div>
              <Button onClick={confirmMfa}>Confirm and enable</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active sessions
          </CardTitle>
          <CardDescription>
            Login events are also recorded in `login_alerts` after each successful sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            data={sessions}
            emptyMessage="No active sessions"
            columns={[
              {
                key: 'current',
                header: '',
                cell: (row) =>
                  row.id === currentSessionId ? (
                    <Badge className="bg-primary/15 text-primary border-primary/30">This device</Badge>
                  ) : null,
              },
              {
                key: 'device',
                header: 'Device',
                cell: (row) => parseUserAgent(row.user_agent),
              },
              {
                key: 'ip_address',
                header: 'IP',
                cell: (row) => row.ip_address || '—',
              },
              {
                key: 'created_at',
                header: 'Signed in',
                cell: (row) => new Date(row.created_at).toLocaleString(),
              },
              {
                key: 'expires_at',
                header: 'Expires',
                cell: (row) => new Date(row.expires_at).toLocaleString(),
              },
              {
                key: 'actions',
                header: '',
                cell: (row) =>
                  row.id !== currentSessionId ? (
                    <Button size="sm" variant="outline" onClick={() => revokeOne(row.id)}>
                      Revoke
                    </Button>
                  ) : null,
              },
            ]}
          />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
