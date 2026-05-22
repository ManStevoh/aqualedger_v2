'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { HeartPulse, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'

type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

interface HealthService {
  name: string
  status: ServiceStatus
  latencyMs?: number
  message?: string
}

function statusBadge(status: ServiceStatus) {
  switch (status) {
    case 'healthy':
      return <Badge className="bg-emerald-600 hover:bg-emerald-600">Healthy</Badge>
    case 'degraded':
      return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">Degraded</Badge>
    case 'down':
      return <Badge variant="destructive">Down</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function PlatformHealthPage() {
  const { currentRole } = useAppStore()
  const [services, setServices] = useState<HealthService[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { services: HealthService[]; checkedAt?: string }
        error?: string
      }>('/api/v2/platform/health')
      if (!res.success) {
        toast.error(res.error || 'Failed to load health status')
        return
      }
      setServices(res.data?.services ?? [])
      setCheckedAt(res.data?.checkedAt ?? null)
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRole === 'super_admin') load()
  }, [currentRole, load])

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
            <HeartPulse className="h-7 w-7" />
            Platform health
          </h1>
          <p className="text-muted-foreground">Service status and dependency checks</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      <AdminHubNav />

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            {checkedAt
              ? `Last checked ${String(checkedAt).replace('T', ' ').slice(0, 19)} UTC`
              : 'Live platform dependency status'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && services.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking services…
            </div>
          ) : services.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No service data available</p>
          ) : (
            services.map((service) => (
              <div
                key={service.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  {service.message && (
                    <p className="text-sm text-muted-foreground mt-1">{service.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {service.latencyMs != null && (
                    <span className="text-xs text-muted-foreground tabular-nums">{service.latencyMs} ms</span>
                  )}
                  {statusBadge(service.status)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
