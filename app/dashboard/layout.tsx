'use client'

import { AuthProvider } from '@/components/auth-provider'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardPageShell } from '@/components/dashboard/page-shell'
import { ModuleRouteGuard } from '@/components/dashboard/module-route-guard'
import { PlatformBanner } from '@/components/dashboard/platform-banner'
import { ImpersonationBanner } from '@/components/dashboard/impersonation-banner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-mesh-dashboard">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 pb-24 lg:p-8 lg:pb-8">
              <DashboardPageShell>
                <PlatformBanner />
                <ImpersonationBanner />
                <ModuleRouteGuard>{children}</ModuleRouteGuard>
              </DashboardPageShell>
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    </AuthProvider>
  )
}
