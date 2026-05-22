'use client'

import { use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ObjectPageShell } from '@/components/dashboard/object-page-shell'
import { COMMERCE_WORKSPACE_NAV } from '@/components/dashboard/workspace-nav'
import { authFetchJson, updateOrderStatus } from '@/lib/api'
import { formatStatusLabel } from '@/lib/ui/status-colors'
import { toast } from 'sonner'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading, mutate } = useSWR(
    id ? `/api/v2/orders/${id}` : null,
    (url) => authFetchJson<{ success: boolean; data?: { order: Record<string, unknown>; statusHistory: Record<string, unknown>[] }; error?: string }>(url),
  )

  const order = data?.data?.order
  const items = (order?.items as Record<string, unknown>[]) ?? []
  const history = data?.data?.statusHistory ?? []

  const runAction = async (action: string) => {
    const json = await updateOrderStatus(id, action)
    if (!json.success) {
      toast.error(json.error || 'Update failed')
      return
    }
    toast.success('Order updated')
    await mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/dashboard/orders">Back to orders</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const orderNumber = String(order.order_number || order.id)
  const status = String(order.status || 'pending')
  const total = Number(order.total) || 0

  const overview = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Buyer:</span>{' '}
            {String(order.buyer_name || '—')}
          </p>
          <p>
            <span className="text-muted-foreground">Seller:</span>{' '}
            {String(order.seller_name || '—')}
          </p>
          <p>
            <span className="text-muted-foreground">Delivery:</span>{' '}
            {String(order.delivery_address || '—')}
          </p>
          <p>
            <span className="text-muted-foreground">Payment:</span>{' '}
            {formatStatusLabel(String(order.payment_status || 'pending'))}
          </p>
          <p>
            <span className="text-muted-foreground">Created:</span>{' '}
            {order.created_at ? new Date(String(order.created_at)).toLocaleString() : '—'}
          </p>
          <p className="text-lg font-semibold pt-2">Total: {formatMoney(total)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
          <CardDescription>Update fulfillment status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {status === 'pending' && (
            <>
              <Button size="sm" onClick={() => runAction('confirmed')}>
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => runAction('cancelled')}>
                Cancel
              </Button>
            </>
          )}
          {status === 'confirmed' && (
            <Button size="sm" onClick={() => runAction('shipped')}>
              Mark shipped
            </Button>
          )}
          {status === 'shipped' && (
            <Button size="sm" onClick={() => runAction('delivered')}>
              Mark delivered
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const lines = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Line items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Species / type</TableHead>
              <TableHead>Qty (kg)</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No line items
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, i) => (
                <TableRow key={String(item.id ?? i)}>
                  <TableCell>
                    {String(item.species_name || item.fish_type || '—')}
                  </TableCell>
                  <TableCell>{Number(item.quantity_kg) || 0}</TableCell>
                  <TableCell>{formatMoney(Number(item.unit_price) || 0)}</TableCell>
                  <TableCell>{formatMoney(Number(item.total_price) || 0)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const historyTab = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status history</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((h, i) => (
              <li key={String(h.id ?? i)} className="flex justify-between border-b pb-2">
                <span>{formatStatusLabel(String(h.status))}</span>
                <span className="text-muted-foreground">
                  {h.created_at ? new Date(String(h.created_at)).toLocaleString() : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )

  return (
    <ObjectPageShell
      title={orderNumber}
      subtitle={`Commerce order · ${formatMoney(total)}`}
      status={status}
      backHref="/dashboard/orders"
      workspaceNav={COMMERCE_WORKSPACE_NAV}
      breadcrumbs={[
        { label: 'Command Center', href: '/dashboard' },
        { label: 'Orders', href: '/dashboard/orders' },
        { label: orderNumber },
      ]}
      tabs={[
        { id: 'overview', label: 'Overview', content: overview },
        { id: 'lines', label: 'Line items', content: lines },
        { id: 'history', label: 'History', content: historyTab },
        {
          id: 'documents',
          label: 'Documents',
          content: (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Export and delivery documents — connect from{' '}
                <Button variant="link" className="h-auto p-0" asChild>
                  <Link href="/dashboard/export/documents">Export docs</Link>
                </Button>
              </CardContent>
            </Card>
          ),
        },
      ]}
    />
  )
}
