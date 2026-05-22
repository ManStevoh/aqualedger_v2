import type { Permission } from './permissions'
import type { LucideIcon } from 'lucide-react'
import {
  Shield,
  Building2,
  ShoppingCart,
  Package,
  Snowflake,
  Truck,
  Users,
  Calculator,
  Scale,
  Ship,
  ClipboardList,
  BarChart3,
  Bell,
  Mail,
  Plug,
  Radio,
  Cpu,
  Sparkles,
  Warehouse,
  UserCircle,
  Settings,
  LayoutDashboard,
  LayoutGrid,
  Ticket,
  ScanLine,
  PackageCheck,
  MapPin,
  Star,
  GraduationCap,
  FileText,
  Route,
  CalendarClock,
  Target,
  Clock,
  Heart,
  Wallet,
  FileCheck,
  FileSpreadsheet,
  Coins,
  UserCog,
  Monitor,
  Palette,
  TrendingUp,
  Store,
  Globe,
  HeartPulse,
  CreditCard,
  Receipt,
  ShieldCheck,
} from 'lucide-react'

export type ModuleId =
  | 'platform'
  | 'tenant'
  | 'commerce'
  | 'inventory'
  | 'coldchain'
  | 'procurement'
  | 'crm'
  | 'accounting'
  | 'fishing'
  | 'logistics'
  | 'hr'
  | 'analytics'
  | 'notifications'
  | 'integrations'
  | 'ai'

export interface ModuleNavItem {
  title: string
  href: string
  permission: Permission
  icon: LucideIcon
  badge?: string
}

export interface ErpModule {
  id: ModuleId
  label: string
  description: string
  icon: LucideIcon
  color: string
  apiPrefix?: string
  nav: ModuleNavItem[]
}

export const ERP_MODULES: ErpModule[] = [
  {
    id: 'platform',
    label: 'Overview',
    description: 'Role-based home and KPIs',
    icon: LayoutDashboard,
    color: 'from-sky-500 to-blue-600',
    nav: [
      { title: 'Command Center', href: '/dashboard', permission: 'analytics.dashboard.read', icon: LayoutDashboard },
      { title: 'All module dashboards', href: '/dashboard/modules', permission: 'analytics.dashboard.read', icon: BarChart3 },
    ],
  },
  {
    id: 'tenant',
    label: 'Organization',
    description: 'Tenants, branches, team, billing',
    icon: Building2,
    color: 'from-violet-500 to-purple-600',
    apiPrefix: '/api/v2/tenant',
    nav: [
      { title: 'Organization', href: '/dashboard/organization', permission: 'tenant.settings.read', icon: Building2 },
      { title: 'Billing', href: '/dashboard/organization/billing', permission: 'tenant.settings.read', icon: CreditCard },
      { title: 'Custom domains', href: '/dashboard/organization/domains', permission: 'tenant.settings.write', icon: Globe },
      { title: 'Tenant KPIs', href: '/dashboard/organization?tab=analytics', permission: 'tenant.settings.read', icon: BarChart3 },
      { title: 'Team', href: '/dashboard/team', permission: 'tenant.members.manage', icon: Users },
      { title: 'Users', href: '/dashboard/users', permission: 'platform.tenants.manage', icon: Users },
      { title: 'Settings', href: '/dashboard/settings', permission: 'tenant.settings.read', icon: Settings },
      { title: 'Workflows', href: '/dashboard/settings/workflows', permission: 'workflows.read', icon: Route },
      { title: 'Security', href: '/dashboard/settings/security', permission: 'auth.sessions.read', icon: Monitor },
      { title: 'Audit trail', href: '/dashboard/admin/audit', permission: 'tenant.audit.read', icon: Shield },
      { title: 'API Tokens', href: '/dashboard/settings/tokens', permission: 'auth.tokens.read', icon: Shield },
    ],
  },
  {
    id: 'fishing',
    label: 'Fishing Operations',
    description: 'Fleet, trips, catches, BMU, compliance',
    icon: Ship,
    color: 'from-cyan-500 to-teal-600',
    apiPrefix: '/api/v2/fishing-ops',
    nav: [
      { title: 'Fleet', href: '/dashboard/fleet', permission: 'fishing.boats.read', icon: Ship },
      { title: 'Crew', href: '/dashboard/fishing/crew', permission: 'fishing.crew.read', icon: UserCog },
      { title: 'Trips', href: '/dashboard/trips', permission: 'fishing.trips.read', icon: Ship },
      { title: 'Catches', href: '/dashboard/catches', permission: 'fishing.catches.read', icon: Ship },
      { title: 'Yield forecast', href: '/dashboard/fishing/forecast', permission: 'fishing.catches.read', icon: BarChart3 },
      { title: 'Fishing Zones', href: '/dashboard/fishing/zones', permission: 'fishing.zones.read', icon: MapPin },
      { title: 'BMU', href: '/dashboard/bmu', permission: 'fishing.bmu.read', icon: Building2 },
      { title: 'Licenses', href: '/dashboard/licenses', permission: 'fishing.licenses.read', icon: Shield },
      { title: 'Catch quotas', href: '/dashboard/fishing/quotas', permission: 'fishing.quotas.read', icon: Scale },
      { title: 'Insurance', href: '/dashboard/risk/insurance', permission: 'risk.insurance.read', icon: Shield },
      { title: 'Landing Sites', href: '/dashboard/landing-sites', permission: 'fishing.landing.read', icon: Building2 },
      { title: 'Auctions', href: '/dashboard/fishing/auctions', permission: 'fishing.auctions.read', icon: ShoppingCart },
      { title: 'Quality inspection', href: '/dashboard/fishing/quality', permission: 'fishing.catches.write', icon: ClipboardList },
      { title: 'Fisherman app', href: '/dashboard/mobile/fisherman', permission: 'fishing.catches.write', icon: Ship },
      { title: 'Co-op shares', href: '/dashboard/fishing/cooperative', permission: 'fishing.crew.read', icon: Users },
      { title: 'Traceability', href: '/dashboard/traceability', permission: 'fishing.traceability.read', icon: ClipboardList },
      { title: 'Export Docs', href: '/dashboard/export/documents', permission: 'export.documents.read', icon: FileCheck },
      { title: 'Maintenance', href: '/dashboard/maintenance', permission: 'fishing.boats.read', icon: ClipboardList },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    description: 'Catalog, marketplace, orders',
    icon: ShoppingCart,
    color: 'from-emerald-500 to-green-600',
    apiPrefix: '/api/v2/commerce',
    nav: [
      { title: 'Storefront', href: '/dashboard/commerce/storefront', permission: 'commerce.storefront.read', icon: Palette },
      { title: 'Catalog', href: '/dashboard/catalog', permission: 'commerce.catalog.read', icon: Package },
      { title: 'Coupons', href: '/dashboard/commerce/coupons', permission: 'commerce.coupons.read', icon: Ticket },
      { title: 'Marketplace', href: '/dashboard/marketplace', permission: 'commerce.listings.read', icon: ShoppingCart },
      { title: 'Cart', href: '/dashboard/commerce/cart', permission: 'commerce.cart.read', icon: ShoppingCart },
      { title: 'Wishlist', href: '/dashboard/commerce/wishlist', permission: 'commerce.wishlist.read', icon: Heart },
      { title: 'Reviews', href: '/dashboard/commerce/reviews', permission: 'commerce.reviews.read', icon: Star },
      { title: 'Orders', href: '/dashboard/orders', permission: 'commerce.orders.read', icon: ClipboardList },
      { title: 'Sales', href: '/dashboard/commerce/sales', permission: 'commerce.orders.read', icon: TrendingUp },
      { title: 'Payouts', href: '/dashboard/commerce/payouts', permission: 'commerce.payouts.read', icon: Wallet },
      { title: 'Returns', href: '/dashboard/commerce/returns', permission: 'commerce.orders.read', icon: PackageCheck },
      { title: 'Delivery slots', href: '/dashboard/commerce/delivery-slots', permission: 'commerce.orders.write', icon: Truck },
      { title: 'B2B pricing', href: '/dashboard/commerce/wholesale', permission: 'commerce.catalog.write', icon: Coins },
      { title: 'Forward contracts', href: '/dashboard/commerce/contracts', permission: 'commerce.contracts.read', icon: FileSpreadsheet },
      { title: 'Vendor hub', href: '/dashboard/vendor', permission: 'commerce.listings.read', icon: Store },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Stock, batches, transfers',
    icon: Warehouse,
    color: 'from-amber-500 to-orange-600',
    apiPrefix: '/api/v2/inventory',
    nav: [
      { title: 'Stock', href: '/dashboard/inventory', permission: 'inventory.stock.read', icon: Warehouse },
      { title: 'Transfers', href: '/dashboard/inventory?tab=transfers', permission: 'inventory.transfers.read', icon: PackageCheck },
      { title: 'Batches', href: '/dashboard/inventory/batches', permission: 'inventory.batches.read', icon: Package },
      { title: 'Traceability', href: '/dashboard/inventory/traceability', permission: 'inventory.traceability.read', icon: ScanLine },
      { title: 'Barcode scan', href: '/dashboard/inventory/scan', permission: 'inventory.stock.read', icon: ScanLine },
    ],
  },
  {
    id: 'coldchain',
    label: 'Cold Chain',
    description: 'Facilities, temperature, compliance',
    icon: Snowflake,
    color: 'from-blue-400 to-indigo-600',
    apiPrefix: '/api/v2/coldchain',
    nav: [
      { title: 'Facilities', href: '/dashboard/storage', permission: 'coldchain.facilities.read', icon: Snowflake },
      { title: 'Zones', href: '/dashboard/coldchain/zones', permission: 'coldchain.zones.read', icon: Warehouse },
      { title: 'HACCP', href: '/dashboard/coldchain/haccp', permission: 'coldchain.haccp.read', icon: ClipboardList },
      { title: 'Alerts', href: '/dashboard/coldchain/alerts', permission: 'coldchain.alerts.read', icon: Bell },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    description: 'Suppliers, POs, goods receipt',
    icon: ClipboardList,
    color: 'from-orange-500 to-red-600',
    apiPrefix: '/api/v2/procurement',
    nav: [
      { title: 'Suppliers', href: '/dashboard/procurement/suppliers', permission: 'procurement.suppliers.read', icon: Users },
      { title: 'Purchase Orders', href: '/dashboard/procurement/orders', permission: 'procurement.orders.read', icon: ClipboardList },
      { title: 'Goods Receipt', href: '/dashboard/procurement/orders?tab=grn', permission: 'procurement.grn.read', icon: PackageCheck },
      { title: '3-way match', href: '/dashboard/procurement/match', permission: 'procurement.orders.read', icon: FileCheck },
      { title: 'Smart suggest', href: '/dashboard/procurement/orders?suggest=1', permission: 'procurement.orders.read', icon: Sparkles },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    description: 'Customers, leads, communications',
    icon: UserCircle,
    color: 'from-pink-500 to-rose-600',
    apiPrefix: '/api/v2/crm',
    nav: [
      { title: 'Customers', href: '/dashboard/crm/customers', permission: 'crm.customers.read', icon: Users },
      { title: 'Segments', href: '/dashboard/crm/segments', permission: 'crm.customers.read', icon: Users },
      { title: 'Sales forecast', href: '/dashboard/crm/forecast', permission: 'crm.customers.read', icon: BarChart3 },
      { title: 'Leads', href: '/dashboard/crm/leads', permission: 'crm.leads.read', icon: UserCircle },
      { title: 'Campaigns', href: '/dashboard/crm/campaigns', permission: 'crm.customers.read', icon: Bell },
      { title: 'Credit', href: '/dashboard/credit-score', permission: 'crm.customers.read', icon: Calculator },
    ],
  },
  {
    id: 'accounting',
    label: 'Finance',
    description: 'Ledger, wallet, expenses, reports',
    icon: Calculator,
    color: 'from-lime-500 to-emerald-600',
    apiPrefix: '/api/v2/accounting',
    nav: [
      { title: 'Wallet', href: '/dashboard/wallet', permission: 'accounting.wallet.read', icon: Calculator },
      { title: 'Expenses', href: '/dashboard/expenses', permission: 'accounting.expenses.read', icon: Calculator },
      { title: 'General Ledger', href: '/dashboard/accounting/ledger', permission: 'accounting.ledger.read', icon: Calculator },
      { title: 'Reports', href: '/dashboard/accounting/reports', permission: 'accounting.reports.read', icon: BarChart3 },
      { title: 'Bank Reconciliation', href: '/dashboard/accounting/bank-reconciliation', permission: 'accounting.ledger.read', icon: Scale },
      { title: 'Budgets', href: '/dashboard/accounting/budgets', permission: 'accounting.reports.read', icon: Target },
      { title: 'Fiscal Periods', href: '/dashboard/accounting/periods', permission: 'accounting.ledger.write', icon: CalendarClock },
      { title: 'Tax Returns', href: '/dashboard/accounting/tax-returns', permission: 'accounting.reports.read', icon: FileText },
      { title: 'Fixed Assets', href: '/dashboard/accounting/fixed-assets', permission: 'accounting.ledger.write', icon: Building2 },
      { title: 'FX Rates', href: '/dashboard/wallet?fx=1', permission: 'accounting.currency.read', icon: Coins },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    description: 'Deliveries, routes, proof',
    icon: Truck,
    color: 'from-slate-500 to-zinc-600',
    apiPrefix: '/api/v2/logistics',
    nav: [
      { title: 'Deliveries', href: '/dashboard/logistics', permission: 'logistics.deliveries.read', icon: Truck },
      { title: 'Route Planner', href: '/dashboard/logistics/routes', permission: 'logistics.routes.read', icon: Route },
      { title: 'Driver app', href: '/dashboard/mobile/delivery', permission: 'logistics.deliveries.read', icon: Truck },
    ],
  },
  {
    id: 'hr',
    label: 'Human Resources',
    description: 'Employees, payroll, leave',
    icon: Users,
    color: 'from-fuchsia-500 to-purple-600',
    apiPrefix: '/api/v2/hr',
    nav: [
      { title: 'Employees', href: '/dashboard/hr', permission: 'hr.employees.read', icon: Users },
      { title: 'Contracts', href: '/dashboard/hr/contracts', permission: 'hr.contracts.read', icon: FileText },
      { title: 'Attendance', href: '/dashboard/hr/attendance', permission: 'hr.attendance.read', icon: ClipboardList },
      { title: 'Leave', href: '/dashboard/hr/leave', permission: 'hr.leave.read', icon: ClipboardList },
      { title: 'Payroll', href: '/dashboard/hr/payroll', permission: 'hr.payroll.read', icon: Calculator },
      { title: 'Benefits', href: '/dashboard/hr/benefits', permission: 'hr.employees.read', icon: Heart },
      { title: 'Recruitment', href: '/dashboard/hr/recruitment', permission: 'hr.employees.read', icon: UserCircle },
      { title: 'Org Chart', href: '/dashboard/hr/org-chart', permission: 'hr.employees.read', icon: Building2 },
      { title: 'Clock In', href: '/dashboard/hr/clock', permission: 'hr.attendance.write', icon: Clock },
      { title: 'Performance', href: '/dashboard/hr/performance', permission: 'hr.performance.read', icon: Star },
      { title: 'Training', href: '/dashboard/hr/training', permission: 'hr.training.read', icon: GraduationCap },
    ],
  },
  {
    id: 'analytics',
    label: 'Intelligence',
    description: 'BI dashboards and exports',
    icon: BarChart3,
    color: 'from-indigo-500 to-violet-600',
    apiPrefix: '/api/v2/analytics',
    nav: [
      { title: 'Analytics', href: '/dashboard/analytics', permission: 'analytics.dashboard.read', icon: BarChart3 },
      { title: 'Reports hub', href: '/dashboard/analytics/reports', permission: 'analytics.export', icon: FileText },
      { title: 'Communications', href: '/dashboard/communications', permission: 'communications.read', icon: Mail },
      { title: 'Scheduled Reports', href: '/dashboard/analytics/scheduled', permission: 'analytics.scheduled.read', icon: CalendarClock },
      { title: 'Command center', href: '/dashboard/admin', permission: 'platform.tenants.manage', icon: LayoutDashboard },
      { title: 'Tenants', href: '/dashboard/admin/tenants', permission: 'platform.tenants.manage', icon: Building2 },
      { title: 'Platform users', href: '/dashboard/admin/users', permission: 'platform.tenants.manage', icon: Users },
      { title: 'Platform analytics', href: '/dashboard/admin/analytics', permission: 'platform.tenants.manage', icon: BarChart3 },
      { title: 'Payments', href: '/dashboard/admin/payments', permission: 'platform.tenants.manage', icon: CreditCard },
      { title: 'Billing', href: '/dashboard/admin/billing', permission: 'platform.tenants.manage', icon: Receipt },
      { title: 'Modules', href: '/dashboard/admin/modules', permission: 'platform.tenants.manage', icon: LayoutGrid },
      { title: 'Platform audit', href: '/dashboard/admin/audit', permission: 'platform.tenants.manage', icon: Shield },
      { title: 'Health', href: '/dashboard/admin/health', permission: 'platform.tenants.manage', icon: HeartPulse },
      { title: 'Platform settings', href: '/dashboard/admin/settings', permission: 'platform.tenants.manage', icon: Settings },
      { title: 'Security & CAPTCHA', href: '/dashboard/admin/security', permission: 'platform.tenants.manage', icon: ShieldCheck },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Alerts across channels',
    icon: Bell,
    color: 'from-yellow-500 to-amber-600',
    apiPrefix: '/api/v2/notifications',
    nav: [
      { title: 'Inbox', href: '/dashboard/notifications', permission: 'notifications.read', icon: Bell },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'M-Pesa, SMS, IoT, APIs',
    icon: Plug,
    color: 'from-gray-500 to-slate-600',
    apiPrefix: '/api/v2/integrations',
    nav: [
      { title: 'Connections', href: '/dashboard/integrations', permission: 'integrations.read', icon: Plug },
      { title: 'IoT & sensors', href: '/dashboard/integrations/iot', permission: 'integrations.read', icon: Radio },
      { title: 'Device registry', href: '/dashboard/integrations/devices', permission: 'integrations.write', icon: Cpu },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    description: 'Forecasting and assistants',
    icon: Sparkles,
    color: 'from-purple-400 to-pink-600',
    apiPrefix: '/api/v2/ai',
    nav: [
      { title: 'AI Command Center', href: '/dashboard/ai', permission: 'ai.forecast.read', icon: Sparkles },
      { title: 'Business brief', href: '/dashboard/ai#brief', permission: 'ai.insights.read', icon: Sparkles },
      { title: 'Assistant', href: '/dashboard/ai#chat', permission: 'ai.chat.read', icon: Sparkles },
    ],
  },
]

export function getModule(id: ModuleId): ErpModule | undefined {
  return ERP_MODULES.find((m) => m.id === id)
}

import { hasPermission } from './permissions'
import type { TenantMemberRole } from '@/lib/tenant'
import { MODULE_DASHBOARD_PERMISSION } from '@/lib/modules/dashboard/module-permissions'

function withModuleDashboardNav(mod: ErpModule): ErpModule {
  const dashPerm = MODULE_DASHBOARD_PERMISSION[mod.id]
  if (!dashPerm || mod.nav.some((n) => n.title === 'Dashboard')) return mod
  return {
    ...mod,
    nav: [
      {
        title: 'Dashboard',
        href: `/dashboard/modules/${mod.id}`,
        permission: dashPerm,
        icon: LayoutDashboard,
      },
      ...mod.nav,
    ],
  }
}

export function getNavForRole(
  memberRole: TenantMemberRole,
  legacyRole?: string,
  enabledModuleIds?: Iterable<string>,
) {
  const enabled =
    enabledModuleIds != null ? new Set(enabledModuleIds) : null

  return ERP_MODULES.map(withModuleDashboardNav)
    .filter((mod) => !enabled || enabled.has(mod.id))
    .map((mod) => ({
      ...mod,
      nav: mod.nav.filter((item) => hasPermission(memberRole, item.permission, legacyRole)),
    }))
    .filter((mod) => mod.nav.length > 0)
}
