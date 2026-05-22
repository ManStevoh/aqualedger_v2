import { AuthProvider } from '@/components/auth-provider'
import { TenantBrandProvider } from '@/components/branding/brand-provider'
import { DashboardChrome } from '@/components/dashboard/dashboard-chrome'
import { DashboardModuleServerGate } from '@/components/dashboard/dashboard-module-server-gate'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardModuleServerGate>
      <AuthProvider>
        <TenantBrandProvider>
          <DashboardChrome>{children}</DashboardChrome>
        </TenantBrandProvider>
      </AuthProvider>
    </DashboardModuleServerGate>
  )
}
