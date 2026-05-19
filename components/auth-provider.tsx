'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import type { User, UserRole } from '@/lib/types'

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
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'same-origin',
  })
  return res.ok
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setCurrentUser, setCurrentRole } = useAppStore()

  useEffect(() => {
    if (!pathname?.startsWith('/dashboard')) {
      return
    }

    let cancelled = false

    const load = async () => {
      const fetchMe = () =>
        fetch('/api/auth/me', { credentials: 'same-origin' }).then((r) => r.json() as Promise<MeResponse>)

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
