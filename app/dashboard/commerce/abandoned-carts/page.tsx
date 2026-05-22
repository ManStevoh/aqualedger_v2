'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableShell } from '@/components/dashboard/data-table-shell'
import { authFetchJson } from '@/lib/api'
import { Mail, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GuestCartRow {
  id: string
  guest_email: string | null
  status: string
  item_count: number
  subtotal: number
  updated_at: string
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<GuestCartRow[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = statusFilter ? `?status=${statusFilter}` : ''
      const res = await authFetchJson<{ success: boolean; data?: { carts: GuestCartRow[] } }>(
        `/api/v2/commerce/abandoned-carts${q}`,
      )
      if (res.success && res.data?.carts) setCarts(res.data.carts)
      else setCarts([])
    } catch {
      toast.error('Failed to load guest carts')
      setCarts([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const runRecovery = async () => {
    setProcessing(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { abandoned: number; recovery: { emailed: number } }
        error?: string
      }>('/api/v2/commerce/abandoned-carts', { method: 'POST' })
      if (!res.success) {
        toast.error(res.error || 'Recovery failed')
        return
      }
      toast.success(
        `Marked ${res.data?.abandoned ?? 0} abandoned · emailed ${res.data?.recovery?.emailed ?? 0}`,
      )
      await load()
    } catch {
      toast.error('Network error')
    } finally {
      setProcessing(false)
    }
  }

  const abandoned = carts.filter((c) => c.status === 'abandoned')
  const active = carts.filter((c) => c.status === 'active')

  return (
    <DashboardPageLayout
      title="Abandoned carts"
      description="Recover guest storefront carts with email capture"
      actions={
        <Button className="gap-2" onClick={runRecovery} disabled={processing}>
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Mark idle & send recovery
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {['', 'active', 'abandoned', 'converted'].map((s) => (
          <Button
            key={s || 'all'}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s || 'All'}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active carts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{active.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Abandoned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{abandoned.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recovery value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              KES {abandoned.reduce((s, c) => s + c.subtotal, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest carts</CardTitle>
          <CardDescription>Storefront sessions with optional email for recovery</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableShell label="Guest carts">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : carts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No guest carts
                    </TableCell>
                  </TableRow>
                ) : (
                  carts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.guest_email || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'abandoned' ? 'destructive' : 'secondary'}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.item_count}</TableCell>
                      <TableCell>KES {c.subtotal.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(c.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </DataTableShell>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
