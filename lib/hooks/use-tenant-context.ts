'use client'

import { useEffect, useState } from 'react'
import { authFetchJson } from '@/lib/api'

type TenantContext = {
  name: string
  plan: string
  loading: boolean
}

export function useTenantContext(): TenantContext {
  const [name, setName] = useState('')
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await authFetchJson<{
          success: boolean
          data?: {
            tenant?: { name?: string; plan?: string }
            subscription?: { label?: string; plan?: string }
          }
        }>('/api/v2/tenant')
        if (cancelled) return
        if (res.success && res.data?.tenant) {
          setName(res.data.tenant.name ?? '')
          setPlan(
            res.data.subscription?.label ??
              res.data.subscription?.plan ??
              res.data.tenant.plan ??
              '',
          )
        }
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { name, plan, loading }
}
