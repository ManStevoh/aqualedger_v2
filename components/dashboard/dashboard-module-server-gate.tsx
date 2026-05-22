import { headers } from 'next/headers'
import { assertDashboardModuleAccess } from '@/lib/platform/dashboard-access'

/** Server-side module enforcement for dashboard routes (Node runtime). */
export async function DashboardModuleServerGate({
  children,
}: {
  children: React.ReactNode
}) {
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') ?? '/dashboard'
  await assertDashboardModuleAccess(pathname)
  return <>{children}</>
}
