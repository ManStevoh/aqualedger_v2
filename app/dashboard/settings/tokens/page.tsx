'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { authFetchJson } from '@/lib/api'
import { Copy, Key, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ApiToken {
  id: string
  name: string
  scopes: string[] | null
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export default function ApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchTokens = () => {
    setLoading(true)
    authFetchJson<{ success: boolean; data?: { tokens: ApiToken[] } }>('/api/v2/auth/tokens')
      .then((res) => {
        if (res.success && res.data?.tokens) setTokens(res.data.tokens)
        else setTokens([])
      })
      .catch(() => setTokens([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  const handleCreate = async () => {
    if (!newTokenName.trim()) {
      toast.error('Token name is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { token: ApiToken & { token: string } }
        error?: string
      }>('/api/v2/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTokenName.trim() }),
      })
      if (!res.success || !res.data?.token?.token) {
        toast.error(res.error || 'Could not create token')
        return
      }
      setCreatedToken(res.data.token.token)
      setNewTokenName('')
      fetchTokens()
      toast.success('Token created — copy it now')
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/auth/tokens?id=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not revoke token')
        return
      }
      toast.success('Token revoked')
      fetchTokens()
    } catch {
      toast.error('Network error')
    }
  }

  const copyToken = async () => {
    if (!createdToken) return
    await navigator.clipboard.writeText(createdToken)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API tokens</h1>
          <p className="text-muted-foreground">
            Scoped tokens for programmatic access (OAuth2-style). Stored as SHA-256 hashes.
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setCreatedToken(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" />
          Create token
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security note
          </CardTitle>
          <CardDescription>
            Token secrets are shown once at creation. Revoke compromised tokens immediately.
          </CardDescription>
        </CardHeader>
      </Card>

      <DataTable
        title="Active tokens"
        loading={loading}
        data={tokens}
        emptyMessage="No API tokens yet"
        columns={[
          { key: 'name', header: 'Name' },
          {
            key: 'scopes',
            header: 'Scopes',
            cell: (row) =>
              row.scopes?.length ? (
                <div className="flex flex-wrap gap-1">
                  {row.scopes.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : (
                'Full access'
              ),
          },
          {
            key: 'created_at',
            header: 'Created',
            cell: (row) => new Date(row.created_at).toLocaleDateString(),
          },
          {
            key: 'last_used_at',
            header: 'Last used',
            cell: (row) =>
              row.last_used_at ? new Date(row.last_used_at).toLocaleString() : 'Never',
          },
          {
            key: 'expires_at',
            header: 'Expires',
            cell: (row) =>
              row.expires_at ? new Date(row.expires_at).toLocaleDateString() : 'Never',
          },
          {
            key: 'actions',
            header: '',
            cell: (row) => (
              <Button size="sm" variant="ghost" onClick={() => handleRevoke(row.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdToken ? 'Token created' : 'Create API token'}</DialogTitle>
            <DialogDescription>
              {createdToken
                ? 'Copy this token now — it will not be shown again.'
                : 'Give the token a descriptive name for audit purposes.'}
            </DialogDescription>
          </DialogHeader>
          {createdToken ? (
            <div className="space-y-3">
              <div className="rounded-md bg-muted p-3 font-mono text-xs break-all">{createdToken}</div>
              <Button className="gap-2 w-full" onClick={copyToken}>
                <Copy className="h-4 w-4" />
                Copy token
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Token name</Label>
              <Input
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="e.g. BI export script"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {createdToken ? 'Done' : 'Cancel'}
            </Button>
            {!createdToken && (
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
