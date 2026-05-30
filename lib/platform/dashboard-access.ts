import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { resolveActiveTenantId } from '@/lib/platform/tenant-resolve'
import {
  isModuleEnabledForTenant,
  resolveModuleFromDashboardPath,
} from '@/lib/platform/module-enablement'

export type DashboardAccessResult =
  | { allowed: true }
  | { allowed: false; moduleId: string }

/** Node-only dashboard module gate (used from server layout). */
export async function checkDashboardModuleAccess(pathname: string): Promise<DashboardAccessResult> {
  if (pathname.startsWith('/admin')) {
    let auth
    try {
      auth = await requireAuth()
    } catch {
      return { allowed: true }
    }
    if (auth.role === 'super_admin') {
      return { allowed: true }
    }
    return { allowed: false, moduleId: 'platform_admin' }
  }

  if (!pathname.startsWith('/dashboard')) {
    return { allowed: true }
  }

  if (pathname.startsWith('/dashboard/onboarding')) {
    return { allowed: true }
  }

  let auth
  try {
    auth = await requireAuth()
  } catch {
    return { allowed: true }
  }

  if (auth.role === 'super_admin' && pathname.startsWith('/dashboard/admin')) {
    return { allowed: true }
  }

  const moduleId = resolveModuleFromDashboardPath(pathname)
  if (!moduleId || moduleId === 'platform') {
    return { allowed: true }
  }

  const hdrs = await headers()
  const tenantId = await resolveActiveTenantId(auth.userId, auth.role, {
    tenantSlug: hdrs.get('x-tenant-slug'),
    tenantIdHeader: hdrs.get('x-tenant-id'),
  })

  if (await isModuleEnabledForTenant(moduleId, tenantId)) {
    return { allowed: true }
  }

  return { allowed: false, moduleId }
}

export async function assertDashboardModuleAccess(pathname: string): Promise<void> {
  const result = await checkDashboardModuleAccess(pathname)
  if (!result.allowed) {
    if (pathname.startsWith('/admin')) {
      redirect('/dashboard')
    } else {
      redirect(`/dashboard?module_disabled=${encodeURIComponent(result.moduleId)}`)
    }
  }
}
