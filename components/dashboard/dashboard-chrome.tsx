'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { ModuleDisabledNotice } from '@/components/dashboard/module-disabled-notice'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardPageShell } from '@/components/dashboard/page-shell'
import { ModuleRouteGuard } from '@/components/dashboard/module-route-guard'
import { PlatformBanner } from '@/components/dashboard/platform-banner'
import { ImpersonationBanner } from '@/components/dashboard/impersonation-banner'
import { CommandPalette } from '@/components/dashboard/command-palette'

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const focusedSetup = pathname?.startsWith('/dashboard/onboarding')

  if (focusedSetup) {
    return (
      <div className="min-h-screen bg-background">
        <CommandPalette />
        <ModuleRouteGuard>{children}</ModuleRouteGuard>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mesh-dashboard">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 pb-24 lg:p-8 lg:pb-8">
            <DashboardPageShell>
              <Suspense fallback={null}>
                <ModuleDisabledNotice />
              </Suspense>
              <PlatformBanner />
              <ImpersonationBanner />
              <ModuleRouteGuard>{children}</ModuleRouteGuard>
            </DashboardPageShell>
          </div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
    </div>
  )
}
