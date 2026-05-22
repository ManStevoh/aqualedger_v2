import type { TenantMemberRole } from '@/lib/tenant'

/** Permission keys — module.action.resource */
export const PERMISSIONS = {
  // Platform
  'platform.tenants.manage': 'Manage all tenants (platform only)',
  'platform.audit.read': 'View platform audit logs',
  'platform.settings.write': 'Edit platform-wide settings (maintenance, signup, announcements)',

  // Tenant
  'tenant.settings.read': 'View tenant settings',
  'tenant.settings.write': 'Edit tenant settings',
  'tenant.branches.manage': 'Manage branches',
  'tenant.members.manage': 'Manage team members',
  'tenant.audit.read': 'View tenant audit trail',

  // Auth
  'auth.tokens.read': 'View API tokens',
  'auth.tokens.write': 'Create and revoke API tokens',
  'auth.sessions.read': 'View active login sessions',
  'auth.sessions.write': 'Revoke login sessions',

  // Fishing operations
  'fishing.boats.read': 'View boats',
  'fishing.boats.write': 'Create/edit boats',
  'fishing.trips.read': 'View trips',
  'fishing.trips.write': 'Manage trips',
  'fishing.catches.read': 'View catches',
  'fishing.catches.write': 'Log catches',
  'fishing.bmu.read': 'View BMU',
  'fishing.bmu.write': 'Manage BMU',
  'fishing.licenses.read': 'View licenses',
  'fishing.licenses.write': 'Issue licenses',
  'fishing.landing.read': 'View landing sites',
  'fishing.landing.write': 'Manage landing sites',
  'fishing.auctions.read': 'View fish auctions',
  'fishing.auctions.write': 'Manage fish auctions',
  'fishing.traceability.read': 'View traceability chain',
  'fishing.fuel.read': 'View boat fuel logs',
  'fishing.fuel.write': 'Log boat fuel',
  'fishing.zones.read': 'View fishing zones',
  'fishing.zones.write': 'Manage fishing zones',
  'fishing.crew.read': 'View boat crew',
  'fishing.crew.write': 'Manage boat crew',
  'fishing.quotas.read': 'View catch quotas and utilization',
  'fishing.quotas.write': 'Manage catch quotas',

  // Marketplace
  'commerce.catalog.read': 'View catalog',
  'commerce.catalog.write': 'Manage products',
  'commerce.listings.read': 'View listings',
  'commerce.listings.write': 'Create listings',
  'commerce.orders.read': 'View orders',
  'commerce.orders.write': 'Manage orders',
  'commerce.coupons.read': 'View coupons',
  'commerce.coupons.write': 'Manage coupons',
  'commerce.vendors.read': 'View marketplace vendors',
  'commerce.vendors.write': 'Invite vendors and grant seller portal access',
  'commerce.reviews.read': 'View marketplace reviews',
  'commerce.reviews.write': 'Submit marketplace reviews',
  'commerce.loyalty.read': 'View loyalty accounts',
  'commerce.loyalty.write': 'Manage loyalty points',
  'commerce.cart.read': 'View shopping cart',
  'commerce.cart.write': 'Manage shopping cart',
  'commerce.wishlist.read': 'View wishlist',
  'commerce.wishlist.write': 'Manage wishlist',
  'commerce.checkout.write': 'Complete checkout',
  'commerce.payouts.read': 'View vendor commissions and payouts',
  'commerce.payouts.write': 'Process vendor payouts',
  'commerce.storefront.read': 'View storefront theme and settings',
  'commerce.storefront.write': 'Customize and publish storefront',
  'commerce.contracts.read': 'View forward sales contracts',
  'commerce.contracts.write': 'Manage contracts and fulfillments',

  // Risk & insurance
  'risk.insurance.read': 'View insurance policies and claims',
  'risk.insurance.write': 'Manage policies and process claims',

  // Inventory
  'inventory.stock.read': 'View stock',
  'inventory.stock.write': 'Adjust stock',
  'inventory.batches.read': 'View batches',
  'inventory.batches.write': 'Manage batches',
  'inventory.transfers.write': 'Transfer stock',
  'inventory.transfers.read': 'View stock transfers',
  'inventory.traceability.read': 'View traceability lots',
  'inventory.traceability.write': 'Manage traceability lots',

  // Cold chain
  'coldchain.facilities.read': 'View cold storage',
  'coldchain.facilities.write': 'Manage facilities',
  'coldchain.records.read': 'View storage records',
  'coldchain.records.write': 'Store/retrieve stock',
  'coldchain.alerts.read': 'View temperature alerts',
  'coldchain.zones.read': 'View storage zones',
  'coldchain.zones.write': 'Manage storage zones',
  'coldchain.readings.read': 'View temperature readings',
  'coldchain.readings.write': 'Record temperature readings',
  'coldchain.haccp.read': 'View HACCP checklists',
  'coldchain.haccp.write': 'Submit HACCP checklists',

  // Procurement
  'procurement.suppliers.read': 'View suppliers',
  'procurement.suppliers.write': 'Manage suppliers',
  'procurement.orders.read': 'View purchase orders',
  'procurement.orders.write': 'Create purchase orders',
  'procurement.grn.read': 'View goods receipts',
  'procurement.grn.write': 'Receive goods',

  // CRM
  'crm.customers.read': 'View customers',
  'crm.customers.write': 'Manage customers',
  'crm.leads.read': 'View leads',
  'crm.leads.write': 'Manage leads',

  // Accounting
  'accounting.wallet.read': 'View wallet',
  'accounting.wallet.write': 'Wallet transactions',
  'accounting.expenses.read': 'View expenses',
  'accounting.expenses.write': 'Record expenses',
  'accounting.ledger.read': 'View general ledger',
  'accounting.ledger.write': 'Post journal entries',
  'accounting.reports.read': 'Financial reports',
  'accounting.currency.read': 'View FX rates and convert amounts',

  // Export compliance
  'export.documents.read': 'View export compliance documents',
  'export.documents.write': 'Manage export compliance documents',

  // Logistics
  'logistics.deliveries.read': 'View deliveries',
  'logistics.deliveries.write': 'Assign deliveries',
  'logistics.routes.read': 'View routes',

  // HR
  'hr.employees.read': 'View employees',
  'hr.employees.write': 'Manage employees',
  'hr.payroll.read': 'View payroll',
  'hr.payroll.write': 'Run payroll',
  'hr.attendance.read': 'View attendance',
  'hr.attendance.write': 'Record attendance',
  'hr.leave.read': 'View leave requests',
  'hr.leave.write': 'Submit leave requests',
  'hr.leave.approve': 'Approve leave requests',
  'hr.contracts.read': 'View employment contracts',
  'hr.contracts.write': 'Manage employment contracts',
  'hr.performance.read': 'View performance reviews',
  'hr.performance.write': 'Manage performance reviews',
  'hr.training.read': 'View training records',
  'hr.training.write': 'Manage training records',

  // Workflows
  'workflows.read': 'View workflow rules',
  'workflows.write': 'Manage workflow rules',
  'workflows.process': 'Process pending domain events',

  // Dashboard layout
  'dashboard.layout.read': 'View dashboard widget layout',
  'dashboard.layout.write': 'Customize dashboard widgets',

  // Analytics
  'analytics.dashboard.read': 'View analytics',
  'analytics.export': 'Export reports',
  'analytics.reports.deliver': 'Send reports via email, SMS, and webhooks',
  'analytics.scheduled.read': 'View scheduled reports',
  'analytics.scheduled.write': 'Manage scheduled reports',

  // Communications
  'communications.read': 'View communication settings, templates, and message log',
  'communications.write': 'Edit communication settings and email templates',
  'communications.send': 'Send email, SMS, and WhatsApp messages',

  // AI
  'ai.forecast.read': 'View demand forecasts',
  'ai.forecast.write': 'Compute demand forecasts',
  'ai.insights.read': 'View AI business briefs and narratives',
  'ai.insights.write': 'Run AI automation and regenerate insights',
  'ai.chat.read': 'View AI chat sessions',
  'ai.chat.write': 'Send AI chat messages',

  // Notifications
  'notifications.read': 'View notifications',
  'notifications.send': 'Send notifications',
  'notifications.preferences.read': 'View notification preferences',
  'notifications.preferences.write': 'Edit notification preferences',

  // Integrations
  'integrations.read': 'View integrations',
  'integrations.write': 'Configure integrations',
  'integrations.iot.write': 'Ingest IoT sensor webhooks',
} as const

export type Permission = keyof typeof PERMISSIONS

const ALL_MODULE_PERMISSIONS = Object.keys(PERMISSIONS).filter(
  (p) => !p.startsWith('platform.'),
) as Permission[]

const PLATFORM_PERMISSIONS: Permission[] = [
  'platform.tenants.manage',
  'platform.audit.read',
  'platform.settings.write',
]

export const ROLE_PERMISSIONS: Record<TenantMemberRole, Permission[]> = {
  tenant_owner: [...ALL_MODULE_PERMISSIONS, 'tenant.audit.read'],
  branch_manager: [
    'tenant.settings.read', 'tenant.audit.read',
    'auth.sessions.read', 'auth.sessions.write',
    'tenant.branches.manage',
    'fishing.boats.read', 'fishing.boats.write',
    'fishing.trips.read', 'fishing.trips.write',
    'fishing.catches.read', 'fishing.catches.write',
    'fishing.bmu.read', 'fishing.bmu.write',
    'fishing.licenses.read', 'fishing.licenses.write',
    'fishing.landing.read', 'fishing.landing.write',
    'fishing.auctions.read', 'fishing.auctions.write',
    'fishing.traceability.read',
    'fishing.fuel.read', 'fishing.fuel.write',
    'fishing.zones.read', 'fishing.zones.write',
    'fishing.crew.read', 'fishing.crew.write',
    'fishing.quotas.read', 'fishing.quotas.write',
    'risk.insurance.read', 'risk.insurance.write',
    'export.documents.read', 'export.documents.write',
    'commerce.catalog.read', 'commerce.catalog.write',
    'commerce.listings.read', 'commerce.listings.write',
    'commerce.orders.read', 'commerce.orders.write',
    'commerce.coupons.read', 'commerce.coupons.write',
    'commerce.vendors.read', 'commerce.vendors.write',
    'commerce.reviews.read', 'commerce.reviews.write',
    'commerce.loyalty.read', 'commerce.loyalty.write',
    'commerce.cart.read', 'commerce.cart.write',
    'commerce.wishlist.read', 'commerce.wishlist.write',
    'commerce.checkout.write',
    'commerce.payouts.read', 'commerce.payouts.write',
    'commerce.vendors.read', 'commerce.vendors.write',
    'commerce.storefront.read', 'commerce.storefront.write',
    'commerce.contracts.read', 'commerce.contracts.write',
    'inventory.stock.read', 'inventory.stock.write',
    'inventory.batches.read', 'inventory.batches.write',
    'inventory.transfers.read', 'inventory.transfers.write',
    'coldchain.facilities.read', 'coldchain.facilities.write',
    'coldchain.records.read', 'coldchain.records.write',
    'coldchain.zones.read', 'coldchain.zones.write',
    'coldchain.readings.read', 'coldchain.readings.write',
    'coldchain.haccp.read', 'coldchain.haccp.write',
    'coldchain.alerts.read',
    'procurement.orders.read', 'procurement.orders.write',
    'crm.customers.read',
    'accounting.wallet.read', 'accounting.expenses.read', 'accounting.expenses.write',
    'accounting.currency.read',
    'logistics.deliveries.read', 'logistics.deliveries.write',
    'hr.employees.read',
    'hr.attendance.read',
    'hr.leave.read',
    'hr.performance.read',
    'hr.training.read',
    'workflows.read', 'workflows.write', 'workflows.process',
    'dashboard.layout.read', 'dashboard.layout.write',
    'analytics.dashboard.read', 'analytics.export', 'analytics.reports.deliver',
    'analytics.scheduled.read', 'analytics.scheduled.write',
    'communications.read', 'communications.write', 'communications.send',
    'ai.forecast.read', 'ai.forecast.write', 'ai.insights.read', 'ai.insights.write',
    'ai.chat.read', 'ai.chat.write',
    'integrations.read', 'integrations.write', 'integrations.iot.write',
    'notifications.read', 'notifications.preferences.read', 'notifications.preferences.write',
  ],
  accountant: [
    'accounting.wallet.read', 'accounting.wallet.write',
    'accounting.expenses.read', 'accounting.expenses.write',
    'accounting.ledger.read', 'accounting.ledger.write',
    'accounting.reports.read',
    'accounting.currency.read',
    'export.documents.read', 'export.documents.write',
    'analytics.dashboard.read', 'analytics.export', 'analytics.reports.deliver',
    'analytics.scheduled.read', 'analytics.scheduled.write',
    'communications.read', 'communications.write', 'communications.send',
    'ai.forecast.read', 'ai.insights.read', 'ai.chat.read', 'ai.chat.write',
    'dashboard.layout.read',
    'procurement.orders.read',
    'crm.customers.read',
  ],
  procurement_officer: [
    'procurement.suppliers.read', 'procurement.suppliers.write',
    'procurement.orders.read', 'procurement.orders.write',
    'procurement.grn.read', 'procurement.grn.write',
    'inventory.stock.read',
  ],
  warehouse_staff: [
    'inventory.stock.read', 'inventory.stock.write',
    'inventory.batches.read', 'inventory.batches.write',
    'inventory.transfers.read', 'inventory.transfers.write',
    'coldchain.facilities.read', 'coldchain.records.read', 'coldchain.records.write',
    'coldchain.zones.read', 'coldchain.zones.write',
    'coldchain.readings.read', 'coldchain.readings.write',
    'coldchain.haccp.read', 'coldchain.haccp.write',
    'coldchain.alerts.read',
    'procurement.grn.write',
  ],
  fisherman: [
    'fishing.trips.read', 'fishing.trips.write',
    'fishing.catches.read', 'fishing.catches.write',
    'commerce.listings.read', 'commerce.listings.write',
    'notifications.read',
    'auth.sessions.read', 'auth.sessions.write',
  ],
  vendor: [
    'commerce.catalog.read', 'commerce.listings.read', 'commerce.listings.write',
    'commerce.orders.read',
    'commerce.payouts.read',
    'commerce.reviews.read', 'commerce.reviews.write',
    'commerce.storefront.read', 'commerce.storefront.write',
    'accounting.wallet.read',
    'notifications.read',
    'auth.sessions.read', 'auth.sessions.write',
  ],
  delivery_staff: [
    'logistics.deliveries.read', 'logistics.deliveries.write',
    'logistics.routes.read',
    'notifications.read',
  ],
  customer: [
    'commerce.catalog.read',
    'commerce.coupons.read',
    'commerce.reviews.read', 'commerce.reviews.write',
    'commerce.loyalty.read',
    'commerce.cart.read', 'commerce.cart.write',
    'commerce.wishlist.read', 'commerce.wishlist.write',
    'commerce.checkout.write',
    'commerce.orders.read', 'commerce.orders.write',
    'notifications.read',
    'auth.sessions.read', 'auth.sessions.write',
  ],
  hr_officer: [
    'hr.employees.read', 'hr.employees.write',
    'hr.payroll.read', 'hr.payroll.write',
    'hr.attendance.read', 'hr.attendance.write',
    'hr.leave.read', 'hr.leave.write', 'hr.leave.approve',
    'hr.contracts.read', 'hr.contracts.write',
    'hr.performance.read', 'hr.performance.write',
    'hr.training.read', 'hr.training.write',
  ],
  bmu_official: [
    'fishing.bmu.read', 'fishing.bmu.write',
    'fishing.licenses.read', 'fishing.licenses.write',
    'fishing.landing.read', 'fishing.landing.write',
    'fishing.catches.read',
    'fishing.auctions.read', 'fishing.auctions.write',
    'fishing.traceability.read',
    'fishing.quotas.read', 'fishing.quotas.write',
    'crm.customers.read',
    'analytics.dashboard.read',
    'ai.chat.read',
  ],
}

/** Legacy app roles mapped to tenant member role for permission checks */
export function legacyRoleToMemberRole(
  role: string,
): TenantMemberRole {
  const map: Record<string, TenantMemberRole> = {
    super_admin: 'tenant_owner',
    investor: 'tenant_owner',
    boat_owner: 'branch_manager',
    fisherman: 'fisherman',
    fish_buyer: 'customer',
    bmu_official: 'bmu_official',
  }
  return map[role] || 'fisherman'
}

export function hasPermission(
  memberRole: TenantMemberRole,
  permission: Permission,
  legacyRole?: string,
  tenantRolePermissions?: Permission[] | null,
): boolean {
  if (permission.startsWith('platform.')) {
    return legacyRole === 'super_admin' && PLATFORM_PERMISSIONS.includes(permission)
  }
  if (tenantRolePermissions != null) {
    return tenantRolePermissions.includes(permission)
  }
  return ROLE_PERMISSIONS[memberRole]?.includes(permission) ?? false
}

export function assertPermission(
  memberRole: TenantMemberRole,
  permission: Permission,
  legacyRole?: string,
  tenantRolePermissions?: Permission[] | null,
): void {
  if (!hasPermission(memberRole, permission, legacyRole, tenantRolePermissions)) {
    throw new Error('Forbidden')
  }
}
