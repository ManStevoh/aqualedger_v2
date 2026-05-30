import { AuthProvider } from '@/components/auth-provider'
import { TenantBrandProvider } from '@/components/branding/brand-provider'
import { DashboardChrome } from '@/components/dashboard/dashboard-chrome'
import { assertDashboardModuleAccess } from '@/lib/platform/dashboard-access'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce strict server-side security check
  await assertDashboardModuleAccess('/admin')

  return (
    <AuthProvider>
      <TenantBrandProvider>
        <DashboardChrome>{children}</DashboardChrome>
      </TenantBrandProvider>
    </AuthProvider>
  )
}
