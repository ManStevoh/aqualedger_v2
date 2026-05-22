'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authFetchJson } from '@/lib/api'
import { MapPin, Truck, CheckCircle, Snowflake } from 'lucide-react'
import { toast } from 'sonner'

interface Delivery {
  id: string
  order_id: string
  status: string
  delivery_address: string | null
  cold_chain_required?: number
  scheduled_at: string | null
}

export default function DriverDeliveryAppPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { deliveries: Delivery[] }
      }>('/api/v2/logistics/deliveries?status=assigned&limit=50')
      if (res.success && res.data?.deliveries) {
        setDeliveries(res.data.deliveries)
      }
    } catch {
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markDelivered = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean }>(
        `/api/v2/logistics/deliveries/${id}`,
        { method: 'PATCH', body: JSON.stringify({ status: 'delivered' }) },
      )
      if (res.success) {
        toast.success('Delivery marked complete')
        load()
      }
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-4">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-sky-400" />
          <h1 className="text-lg font-bold">Driver — Deliveries</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Mobile PWA · offline-ready shell</p>
      </header>
      <main className="px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-slate-400">Loading routes…</p>
        ) : deliveries.length === 0 ? (
          <p className="text-slate-400">No assigned deliveries.</p>
        ) : (
          deliveries.map((d) => (
            <Card key={d.id} className="bg-slate-900 border-slate-800 text-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Order {d.order_id.slice(0, 8)}</CardTitle>
                  <Badge variant="secondary">{d.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {d.delivery_address && (
                  <p className="flex gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 shrink-0 text-sky-400" />
                    {d.delivery_address}
                  </p>
                )}
                {Boolean(d.cold_chain_required) && (
                  <p className="flex gap-2 text-cyan-300">
                    <Snowflake className="h-4 w-4" /> Cold-chain required
                  </p>
                )}
                <Button
                  className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => markDelivered(d.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm delivery (POD)
                </Button>
              </CardContent>
            </Card>
          ))
        )}
        <Link href="/dashboard/logistics" className="block text-center text-sm text-sky-400 py-4">
          Full logistics dashboard →
        </Link>
      </main>
    </div>
  )
}
