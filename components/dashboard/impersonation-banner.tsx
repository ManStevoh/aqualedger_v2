'use client'

import { useCallback, useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { UserCog, LogOut } from 'lucide-react'
import { apiFetch } from '@/lib/client-api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ImpersonationState {
  adminUserId: string
  adminEmail?: string
}

export function ImpersonationBanner() {
  const router = useRouter()
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null)
  const [ending, setEnding] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/auth/me')
      const json = (await res.json()) as {
        success?: boolean
        data?: { impersonation?: ImpersonationState | null }
      }
      if (json.success && json.data?.impersonation) {
        setImpersonation(json.data.impersonation)
      } else {
        setImpersonation(null)
      }
    } catch {
      setImpersonation(null)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const endSession = async () => {
    setEnding(true)
    try {
      const res = await apiFetch('/v2/platform/impersonate', { method: 'DELETE' })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (!json.success) {
        toast.error(json.error || 'Failed to end impersonation')
        return
      }
      toast.success('Returned to your admin account')
      setImpersonation(null)
      router.push('/dashboard/admin')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setEnding(false)
    }
  }

  if (!impersonation) return null

  return (
    <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
      <UserCog className="h-4 w-4 text-amber-600" />
      <AlertTitle>Support impersonation active</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>
          You are viewing the platform as another user. Admin:{' '}
          <strong>{impersonation.adminEmail || impersonation.adminUserId.slice(0, 8)}</strong>
        </span>
        <Button size="sm" variant="outline" disabled={ending} onClick={endSession} className="gap-2">
          <LogOut className="h-4 w-4" />
          Exit impersonation
        </Button>
      </AlertDescription>
    </Alert>
  )
}
