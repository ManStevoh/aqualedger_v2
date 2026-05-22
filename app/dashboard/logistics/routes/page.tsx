'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { Route, MapPin, Truck, Package } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

interface Delivery {
  id: string
  tracking_code: string
  status: string
  delivery_address: string
}

interface CountyGroup {
  county: string
  deliveryCount: number
  deliveries: Delivery[]
}

export default function LogisticsRoutesPage() {
  const [groups, setGroups] = useState<CountyGroup[]>([])
  const [totalDeliveries, setTotalDeliveries] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { groups: CountyGroup[]; totalDeliveries: number }
      }>('/api/v2/logistics/routes?status=pending')
      if (data.success && data.data) {
        setGroups(data.data.groups)
        setTotalDeliveries(data.data.totalDeliveries)
      }
    } catch {
      toast.error('Failed to load route groups')
    } finally {
      setLoading(false)
    }
  }

  const counties = groups.length
  const largestGroup = groups[0]?.deliveryCount ?? 0

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'in_transit':
      case 'assigned': return 'bg-blue-100 text-blue-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Route Planner</h1>
        <p className="text-muted-foreground">
          Stub route optimization — pending deliveries grouped by county
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Pending deliveries" value={totalDeliveries} icon={<Truck className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Counties" value={counties} icon={<MapPin className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Largest group" value={largestGroup} icon={<Package className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Route batches" value={groups.length} icon={<Route className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.county}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {group.county}
                </span>
                <Badge variant="secondary">{group.deliveryCount} stops</Badge>
              </CardTitle>
              <CardDescription>Suggested single-county delivery run</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {group.deliveries.map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-2 rounded-md border p-2">
                    <div>
                      <p className="font-mono font-medium">{d.tracking_code}</p>
                      <p className="text-muted-foreground text-xs">{d.delivery_address}</p>
                    </div>
                    <Badge className={statusColor(d.status)}>{d.status.replace('_', ' ')}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 && !loading && (
          <Card className="md:col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              No pending deliveries to group by county
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
