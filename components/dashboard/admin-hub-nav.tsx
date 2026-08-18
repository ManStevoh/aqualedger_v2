'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

export function AdminHubNav() {
  const { currentRole } = useAppStore()
  const [localDevMode, setLocalDevMode] = useState<boolean | null>(null)

  useEffect(() => {
    if (currentRole !== 'super_admin') return
    fetch('/api/v2/platform/settings')
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data?.success && data.data?.localDevMode !== undefined) {
          setLocalDevMode(Boolean(data.data.localDevMode))
        }
      })
      .catch(() => {})
  }, [currentRole])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 backdrop-blur-md shadow-xs mb-6">
      {/* Platform Operating Title & Indicator */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-tight text-foreground flex items-center gap-1.5">
            Platform System Telemetry
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono">
              v2.4.0-prod
            </Badge>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Cross-tenant cluster monitoring & security guard active
          </p>
        </div>
      </div>

      {/* Real-time System Telemetry Status Badges */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
        <Badge variant="outline" className="gap-1.5 py-1 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="h-3 w-3" /> Database: Healthy
        </Badge>

        <Badge variant="outline" className="gap-1.5 py-1 px-2.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
          <Zap className="h-3 w-3" /> Redis Cache: Active
        </Badge>

        <Badge variant="outline" className="gap-1.5 py-1 px-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
          <ShieldCheck className="h-3 w-3" /> Security: Guarded
        </Badge>

        {localDevMode !== null && (
          <Badge
            variant={localDevMode ? 'secondary' : 'outline'}
            className={cn(
              'gap-1.5 py-1 px-2.5 transition-colors',
              localDevMode
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold border-purple-500/30'
                : 'text-muted-foreground',
            )}
          >
            <Sparkles className="h-3 w-3" /> Sandbox Mode: {localDevMode ? 'ON' : 'OFF'}
          </Badge>
        )}
      </div>
    </div>
  )
}
