'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import { ModulePageHeader } from '@/components/dashboard/module-page-header'
import { ListPageToolbar } from '@/components/dashboard/list-page-toolbar'
import { TablePagination, paginateItems } from '@/components/dashboard/table-pagination'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { EmptyState } from '@/components/dashboard/empty-state'
import { WorkspaceNav, COMMERCE_WORKSPACE_NAV } from '@/components/dashboard/workspace-nav'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useFishOrders, updateOrderStatus } from '@/lib/api'
import type { FishOrder, UserRole } from '@/lib/types'
import { toast } from 'sonner'

const PAGE_SIZE = 25

function defaultOrderRole(role: UserRole | undefined): 'buyer' | 'seller' {
  if (role === 'fish_buyer' || role === 'investor') return 'buyer'
  return 'seller'
}

function getStatusIcon(status: string) {
  if (status === 'pending') return <Clock className="h-4 w-4" />
  if (status === 'confirmed') return <CheckCircle2 className="h-4 w-4" />
  if (status === 'shipped') return <Truck className="h-4 w-4" />
  if (status === 'delivered') return <Package className="h-4 w-4" />
  return <XCircle className="h-4 w-4" />
}

export default function OrdersPage() {
  const meta = useDashboardPageMeta({
    title: 'Orders',
    description: 'Track and manage your fish orders (live data)',
  })
  const { currentUser } = useAppStore()
  const [orderRole, setOrderRole] = useState<'buyer' | 'seller'>(() =>
    defaultOrderRole(currentUser?.role),
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data: ordersData, isLoading, mutate } = useFishOrders(orderRole)

  const orders = ordersData?.data?.items || []

  const filteredOrders = useMemo(() => {
    return orders.filter((order: FishOrder) => {
      const matchesSearch =
        order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === 'all' || order.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [orders, searchTerm, activeTab])

  const paginatedOrders = useMemo(
    () => paginateItems(filteredOrders, page, PAGE_SIZE),
    [filteredOrders, page],
  )

  useEffect(() => {
    setPage(1)
  }, [searchTerm, activeTab, orderRole])

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o: FishOrder) => o.status === 'pending').length
  const completedOrders = orders.filter((o: FishOrder) => o.status === 'delivered').length
  const totalRevenue = orders
    .filter((o: FishOrder) => o.status === 'delivered')
    .reduce((sum: number, o: FishOrder) => sum + o.totalAmount, 0)

  const runStatusUpdate = async (orderId: string, action: string) => {
    setUpdatingId(orderId)
    try {
      const json = await updateOrderStatus(orderId, action)
      if (!json.success) {
        toast.error(json.error || 'Update failed')
        return
      }
      toast.success('Order updated')
      await mutate()
    } catch {
      toast.error('Network error')
    } finally {
      setUpdatingId(null)
    }
  }

  const sellerActions = (order: FishOrder) => {
    const busy = updatingId === order.id
    if (order.status === 'pending') {
      return (
        <>
          <Button size="sm" disabled={busy} onClick={() => runStatusUpdate(order.id, 'confirmed')}>
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => runStatusUpdate(order.id, 'cancelled')}
          >
            Cancel
          </Button>
        </>
      )
    }
    if (order.status === 'confirmed') {
      return (
        <Button size="sm" disabled={busy} onClick={() => runStatusUpdate(order.id, 'shipped')}>
          Mark shipped
        </Button>
      )
    }
    if (order.status === 'shipped') {
      return (
        <Button size="sm" disabled={busy} onClick={() => runStatusUpdate(order.id, 'delivered')}>
          Mark delivered
        </Button>
      )
    }
    return (
      <Button size="sm" variant="outline" disabled>
        No action
      </Button>
    )
  }

  const buyerActions = (order: FishOrder) => {
    const busy = updatingId === order.id
    if (order.status === 'pending') {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => runStatusUpdate(order.id, 'cancelled')}
        >
          Cancel order
        </Button>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <WorkspaceNav items={COMMERCE_WORKSPACE_NAV} />

      <ModulePageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Tabs value={orderRole} onValueChange={(v) => setOrderRole(v as 'buyer' | 'seller')}>
            <TabsList>
              <TabsTrigger value="buyer">As buyer</TabsTrigger>
              <TabsTrigger value="seller">As seller</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={isLoading ? '…' : totalOrders}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Pending"
          value={isLoading ? '…' : pendingOrders}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Completed"
          value={isLoading ? '…' : completedOrders}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Delivered volume (KES)"
          value={isLoading ? '…' : `KES ${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <ListPageToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders…"
        views={
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-9">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs">
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="shipped" className="text-xs">
                Shipped
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs">
                Delivered
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">Loading orders…</CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description={
              activeTab !== 'all'
                ? 'Try changing the status filter or buyer/seller view.'
                : 'Orders will appear here when you place or receive them.'
            }
          />
        ) : (
          <>
            {paginatedOrders.map((order: FishOrder) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={order.status} />
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {getStatusIcon(order.status)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Order #{order.id.slice(0, 8)}…
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <div className="font-semibold text-lg">
                          {order.quantity} kg {order.fishType}
                        </div>
                        {order.pricePerKg > 0 && (
                          <div className="text-muted-foreground">@ KES {order.pricePerKg}/kg</div>
                        )}
                        <div className="font-bold text-primary">
                          KES {order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Buyer</div>
                        <div className="font-medium">{order.buyerName}</div>
                        {order.buyerPhone ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {order.buyerPhone}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <div className="text-muted-foreground">Seller</div>
                        <div className="font-medium">{order.sellerName}</div>
                      </div>
                    </div>

                    <div className="flex-1 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <div className="text-muted-foreground">Delivery</div>
                          <div>{order.deliveryAddress || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {orderRole === 'seller' ? sellerActions(order) : buyerActions(order)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <TablePagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filteredOrders.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
