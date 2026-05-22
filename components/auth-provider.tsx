'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/client-api'
import type { User, UserRole } from '@/lib/types'
import type { TenantMemberRole } from '@/lib/tenant'
import type { Permission } from '@/lib/platform/permissions'

type MeResponse = {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string | null
      county?: string | null
      role: UserRole
      status: string
      avatarUrl: string | null
      createdAt: string
    }
    memberRole?: TenantMemberRole | null
    permissions?: Permission[] | null
  }
  error?: string
}

function mapMeUser(u: NonNullable<MeResponse['data']>['user']): User {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    avatar: u.avatarUrl ?? undefined,
    createdAt: typeof u.createdAt === 'string' ? u.createdAt.split('T')[0] : String(u.createdAt),
    status: u.status === 'active' ? 'active' : u.status === 'suspended' ? 'suspended' : 'inactive',
    region: u.county ?? undefined,
  }
}

async function tryRefreshSession(): Promise<boolean> {
  const res = await apiFetch('/auth/refresh', { method: 'POST' })
  return res.ok
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setCurrentUser, setCurrentRole, setMemberRole, setRolePermissions, setEnabledModuleIds } =
    useAppStore()

  useEffect(() => {
    if (!pathname?.startsWith('/dashboard')) {
      return
    }

    let cancelled = false

    const load = async () => {
      const fetchMe = () =>
        apiFetch('/auth/me').then((r) => r.json() as Promise<MeResponse>)

      let me = await fetchMe()

      if (!cancelled && !me.success && me.error) {
        const refreshed = await tryRefreshSession()
        if (refreshed) {
          me = await fetchMe()
        }
      }

      if (cancelled) {
        return
      }

      if (me.success && me.data?.user) {
        const user = mapMeUser(me.data.user)
        setCurrentUser(user)
        setCurrentRole(user.role)
        setMemberRole(me.data.memberRole ?? null)
        setRolePermissions(me.data.permissions ?? null)

        try {
          const tenantModRes = await apiFetch('/v2/tenant/modules').then((r) =>
            r.json() as Promise<{ success: boolean; data?: { enabledModuleIds: string[] } }>,
          )
          if (tenantModRes.success && tenantModRes.data?.enabledModuleIds?.length) {
            setEnabledModuleIds(tenantModRes.data.enabledModuleIds)
          } else {
            const modRes = await apiFetch('/v2/platform/modules').then((r) =>
              r.json() as Promise<{ success: boolean; data?: { enabledModuleIds: string[] } }>,
            )
            if (modRes.success && modRes.data?.enabledModuleIds?.length) {
              setEnabledModuleIds(modRes.data.enabledModuleIds)
            } else {
              setEnabledModuleIds(['platform'])
            }
          }
        } catch {
          setEnabledModuleIds(['platform'])
        }

        if (pathname !== '/dashboard/onboarding') {
          try {
            const onboardingRes = await apiFetch('/v2/tenant/onboarding')
            if (onboardingRes.ok) {
              const onboardingJson = (await onboardingRes.json()) as {
                success?: boolean
                data?: { isComplete?: boolean }
              }
              if (
                onboardingJson.success &&
                onboardingJson.data &&
                onboardingJson.data.isComplete === false
              ) {
                router.replace('/dashboard/onboarding')
                return
              }
            }
          } catch {
            // Non-blocking — allow dashboard access if onboarding check fails
          }
        }
        return
      }

      setCurrentUser(null)
      router.replace(`/login?from=${encodeURIComponent(pathname || '/dashboard')}`)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [pathname, router, setCurrentRole, setCurrentUser])

  return <>{children}</>
}
