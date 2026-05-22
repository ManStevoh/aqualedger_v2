'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Megaphone, Wrench } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { resolveFetchUrl } from '@/lib/config/urls'

interface PlatformStatusRaw {
  maintenanceMode?: boolean
  maintenanceMessage?: string
  announcementEnabled?: boolean
  announcementTitle?: string
  announcementBody?: string
  maintenance?: { enabled?: boolean; message?: string }
  announcement?: { enabled?: boolean; title?: string; body?: string }
}

interface PlatformStatus {
  maintenanceMode: boolean
  maintenanceMessage: string
  announcementEnabled: boolean
  announcementTitle: string
  announcementBody: string
}

function normalizeStatus(raw: PlatformStatusRaw): PlatformStatus {
  return {
    maintenanceMode: raw.maintenanceMode ?? raw.maintenance?.enabled ?? false,
    maintenanceMessage: raw.maintenanceMessage ?? raw.maintenance?.message ?? '',
    announcementEnabled: raw.announcementEnabled ?? raw.announcement?.enabled ?? false,
    announcementTitle: raw.announcementTitle ?? raw.announcement?.title ?? '',
    announcementBody: raw.announcementBody ?? raw.announcement?.body ?? '',
  }
}

export function PlatformBanner() {
  const { currentRole } = useAppStore()
  const [status, setStatus] = useState<PlatformStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(resolveFetchUrl('/api/public/platform/status'), { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: PlatformStatusRaw }) => {
        if (!cancelled && json.success && json.data) {
          setStatus(normalizeStatus(json.data))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!status) return null

  const isSuperAdmin = currentRole === 'super_admin'
  const showMaintenance = status.maintenanceMode && !isSuperAdmin
  const showAnnouncement =
    status.announcementEnabled && (status.announcementTitle || status.announcementBody)

  if (!showMaintenance && !showAnnouncement) return null

  return (
    <div className="mb-6 space-y-3">
      {showMaintenance && (
        <Alert variant="destructive">
          <Wrench className="h-4 w-4" />
          <AlertTitle>Platform maintenance</AlertTitle>
          <AlertDescription>
            {status.maintenanceMessage ||
              'The platform is currently undergoing maintenance. Some features may be unavailable.'}
          </AlertDescription>
        </Alert>
      )}
      {showAnnouncement && (
        <Alert>
          <Megaphone className="h-4 w-4" />
          <AlertTitle>{status.announcementTitle || 'Platform announcement'}</AlertTitle>
          {status.announcementBody && (
            <AlertDescription>{status.announcementBody}</AlertDescription>
          )}
        </Alert>
      )}
    </div>
  )
}
