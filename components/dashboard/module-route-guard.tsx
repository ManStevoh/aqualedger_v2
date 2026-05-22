'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { resolveModuleFromDashboardPath } from '@/lib/platform/module-paths'

export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { enabledModuleIds, modulesLoaded } = useAppStore()

  useEffect(() => {
    if (!modulesLoaded || !pathname?.startsWith('/dashboard')) return
    const moduleId = resolveModuleFromDashboardPath(pathname)
    if (!moduleId) return
    if (!enabledModuleIds.includes(moduleId)) {
      toast.error('This module is disabled on this platform')
      router.replace('/dashboard')
    }
  }, [pathname, enabledModuleIds, modulesLoaded, router])

  return <>{children}</>
}
