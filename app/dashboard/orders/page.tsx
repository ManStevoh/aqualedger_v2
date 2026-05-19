'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import {
  ShoppingCart,
  Search,
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

function defaultOrderRole(role: UserRole | undefined): 'buyer' | 'seller' {
  if (role === 'fish_buyer' || role === 'investor') return 'buyer'
  return 'seller'
}

export default function OrdersPage() {
  const { currentUser } = useAppStore()
  const [orderRole, setOrderRole] = useState<'buyer' | 'seller'>(() =>
    defaultOrderRole(currentUser?.role),
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data: ordersData, isLoading, mutate } = useFishOrders(orderRole)

  const orders = ordersData?.data?.items || []

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-muted'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'pending') return <Clock className="h-4 w-4" />
    if (status === 'confirmed') return <CheckCircle2 className="h-4 w-4" />
    if (status === 'shipped') return <Truck className="h-4 w-4" />
    if (status === 'delivered') return <Package className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Track and manage your fish orders (live data)</p>
        </div>
        <Tabs value={orderRole} onValueChange={(v) => setOrderRole(v as 'buyer' | 'seller')}>
          <TabsList>
            <TabsTrigger value="buyer">As buyer</TabsTrigger>
            <TabsTrigger value="seller">As seller</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">Loading orders…</CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">
                {activeTab !== 'all' ? 'Try changing the filter or role tab' : 'Orders will appear here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order: FishOrder) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}…</span>
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
          ))
        )}
      </div>
    </div>
  )
}
