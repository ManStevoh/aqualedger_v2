'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Ship,
  Anchor,
  Fish,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  BarChart3,
  Wrench,
  Snowflake,
  Building2,
  Shield,
  DollarSign,
  MapPin,
  X,
  CloudRain,
  CreditCard,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  // Common
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'investor', 'boat_owner', 'fisherman', 'fish_buyer', 'bmu_official'] },
  
  // Investor
  { title: 'Portfolio', href: '/dashboard/portfolio', icon: TrendingUp, roles: ['investor'] },
  { title: 'Investments', href: '/dashboard/investments', icon: DollarSign, roles: ['investor', 'super_admin'] },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet, roles: ['investor', 'boat_owner', 'fish_buyer', 'super_admin'] },
  
  // Boat Owner & Fisherman
  { title: 'Fleet', href: '/dashboard/fleet', icon: Ship, roles: ['boat_owner', 'super_admin', 'investor'] },
  { title: 'Trips', href: '/dashboard/trips', icon: Anchor, roles: ['boat_owner', 'fisherman', 'super_admin', 'investor'] },
  { title: 'Catches', href: '/dashboard/catches', icon: Fish, roles: ['boat_owner', 'fisherman', 'super_admin', 'investor'] },
  { title: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench, roles: ['boat_owner', 'super_admin', 'investor'] },
  
  // Marketplace
  { title: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingCart, roles: ['boat_owner', 'fish_buyer', 'super_admin', 'investor'] },
  { title: 'Orders', href: '/dashboard/orders', icon: FileText, roles: ['fish_buyer', 'boat_owner', 'super_admin', 'investor'] },
  
  // Cold Storage
  { title: 'Cold Storage', href: '/dashboard/storage', icon: Snowflake, roles: ['boat_owner', 'fish_buyer', 'super_admin', 'investor'] },
  
  // AI & Climate Features
  { title: 'Credit Score', href: '/dashboard/credit-score', icon: CreditCard, roles: ['fisherman', 'boat_owner', 'super_admin', 'investor'] },
  { title: 'Climate Alerts', href: '/dashboard/climate', icon: CloudRain, roles: ['fisherman', 'boat_owner', 'super_admin', 'bmu_official', 'investor'] },
  
  // BMU Official
  { title: 'BMU Management', href: '/dashboard/bmu', icon: Building2, roles: ['bmu_official', 'super_admin', 'investor'] },
  { title: 'Licenses', href: '/dashboard/licenses', icon: Shield, roles: ['bmu_official', 'super_admin', 'investor'] },
  { title: 'Landing Sites', href: '/dashboard/landing-sites', icon: MapPin, roles: ['bmu_official', 'super_admin', 'investor'] },
  
  // Admin
  { title: 'Admin Console', href: '/dashboard/admin', icon: Shield, roles: ['super_admin', 'investor'] },
  { title: 'Users', href: '/dashboard/users', icon: Users, roles: ['super_admin', 'investor', 'bmu_official'] },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['super_admin', 'investor', 'boat_owner'] },
  { title: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['super_admin', 'investor', 'boat_owner', 'fisherman', 'fish_buyer', 'bmu_official'] },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['super_admin', 'investor', 'boat_owner', 'fisherman', 'fish_buyer', 'bmu_official'] },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { currentRole, sidebarOpen, setSidebarOpen } = useAppStore()

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole))

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r bg-sidebar transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">AquaLedger</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 px-3">
            <div className="rounded-lg bg-sidebar-accent/50 p-4">
              <h4 className="text-sm font-semibold text-sidebar-foreground">Need Help?</h4>
              <p className="mt-1 text-xs text-sidebar-foreground/70">
                Contact support for assistance with the platform.
              </p>
              <Button size="sm" className="mt-3 w-full" variant="secondary">
                Get Support
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
