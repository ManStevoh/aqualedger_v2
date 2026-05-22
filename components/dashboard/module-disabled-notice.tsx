'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ERP_MODULES } from '@/lib/platform/modules'

/** Shows a toast when middleware redirects with ?module_disabled= */
export function ModuleDisabledNotice() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const moduleId = searchParams.get('module_disabled')
    if (!moduleId) return

    const mod = ERP_MODULES.find((m) => m.id === moduleId)
    const label = mod?.label ?? moduleId
    toast.error(`${label} is disabled for your organization`, {
      description: 'Contact your administrator or use Platform settings if you are a super admin.',
    })

    const url = new URL(window.location.href)
    url.searchParams.delete('module_disabled')
    router.replace(url.pathname + (url.search || ''), { scroll: false })
  }, [searchParams, router])

  return null
}
