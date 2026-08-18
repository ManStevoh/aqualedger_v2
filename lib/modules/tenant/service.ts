import { query, queryOne, execute } from '@/lib/db'
import { notFound } from '@/lib/api-handler'
import { tenantWhere, resolveTenantId, getTenantExpiryStatus } from '@/lib/tenant'
import type { Tenant, TenantMemberRole, TenantPlan } from '@/lib/tenant'
import { getPlanLimits, planDisplayLabel, type PlanLimits } from './plan-limits'

export interface TenantBranding {
  logo_url?: string
  primary_color?: string
}

export interface TenantSettings {
  tax_tin?: string
  vat_number?: string
  branding?: TenantBranding
  stripe_customer_id?: string
  bank_name?: string
  bank_branch?: string
  bank_account_number?: string
  bank_account_name?: string
  bank_swift_code?: string
  mpesa_paybill?: string
  [key: string]: unknown
}

export interface TenantDetail extends Tenant {
  settings: TenantSettings | null
  logo_url: string | null
  primary_color: string | null
  legal_name: string | null
  timezone: string | null
}

export interface UpdateTenantSettingsInput {
  taxTin?: string
  vatNumber?: string
  branding?: TenantBranding
  name?: string
  defaultCurrency?: string
  timezone?: string
  bankName?: string
  bankBranch?: string
  bankAccountNumber?: string
  bankAccountName?: string
  bankSwiftCode?: string
  mpesaPaybill?: string
}

export interface Branch {
  id: string
  tenant_id: string
  code: string
  name: string
  type: string
  county: string | null
  address: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface TenantMember {
  id: string
  tenant_id: string
  user_id: string
  branch_id: string | null
  role: TenantMemberRole
  status: 'active' | 'invited' | 'suspended'
  invited_at: string | null
  joined_at: string
  created_at: string
  updated_at: string
  email?: string
  first_name?: string
  last_name?: string
  branch_name?: string | null
}

/** Resolve the active tenant for a user (prefers tenant_owner membership). */
export async function resolveUserTenantId(userId: string): Promise<string> {
  const row = await queryOne<{ tenant_id: string }>(
    `SELECT tenant_id FROM tenant_members
     WHERE user_id = ? AND status = 'active'
     ORDER BY FIELD(role, 'tenant_owner') DESC, joined_at ASC
     LIMIT 1`,
    [userId],
  )
  return row?.tenant_id ?? resolveTenantId()
}

export async function getTenant(tenantId: string): Promise<TenantDetail> {
  const tenant = await queryOne<TenantDetail & { settings: string | TenantSettings | null }>(
    `SELECT id, slug, name, legal_name, default_currency, country_code, plan, status,
            trial_starts_at, trial_ends_at, current_period_start, current_period_end,
            cancel_at_period_end, grace_period_ends_at, created_at,
            logo_url, primary_color, timezone, settings
     FROM tenants WHERE id = ?`,
    [tenantId],
  )
  if (!tenant) {
    throw notFound('Tenant not found')
  }

  let settings: TenantSettings | null = null
  if (tenant.settings) {
    settings =
      typeof tenant.settings === 'string'
        ? (JSON.parse(tenant.settings) as TenantSettings)
        : tenant.settings
  }

  return { ...tenant, settings }
}

export function getSubscriptionPlanDisplay(
  plan: TenantPlan,
  tenant?: Partial<Tenant>,
): {
  plan: TenantPlan
  label: string
  features: string[]
  limits: PlanLimits
  expiryStatus?: ReturnType<typeof import('@/lib/tenant').getTenantExpiryStatus>
} {
  const limits = getPlanLimits(plan)
  const features = [
    `Up to ${limits.maxUsers} users`,
    `Up to ${limits.maxProducts} products`,
    `Up to ${limits.maxBranches} branches`,
    limits.analyticsAdvanced ? 'Advanced analytics' : 'Standard analytics',
    limits.apiAccess ? 'API access' : 'Dashboard only',
  ]
  const expiryStatus = tenant ? getTenantExpiryStatus(tenant) : undefined
  return { plan, label: planDisplayLabel(plan), features, limits, expiryStatus }
}

export async function updateTenantSettings(
  tenantId: string,
  input: UpdateTenantSettingsInput,
): Promise<TenantDetail> {
  const current = await getTenant(tenantId)
  const settings: TenantSettings = { ...(current.settings ?? {}) }

  if (input.taxTin !== undefined) settings.tax_tin = input.taxTin
  if (input.vatNumber !== undefined) settings.vat_number = input.vatNumber
  if (input.branding !== undefined) {
    settings.branding = { ...(settings.branding ?? {}), ...input.branding }
  }
  if (input.bankName !== undefined) settings.bank_name = input.bankName
  if (input.bankBranch !== undefined) settings.bank_branch = input.bankBranch
  if (input.bankAccountNumber !== undefined) settings.bank_account_number = input.bankAccountNumber
  if (input.bankAccountName !== undefined) settings.bank_account_name = input.bankAccountName
  if (input.bankSwiftCode !== undefined) settings.bank_swift_code = input.bankSwiftCode
  if (input.mpesaPaybill !== undefined) settings.mpesa_paybill = input.mpesaPaybill

  const updates: string[] = ['settings = ?', 'updated_at = NOW()']
  const params: unknown[] = [JSON.stringify(settings)]

  if (input.name !== undefined) {
    updates.push('name = ?')
    params.push(input.name)
  }
  if (input.defaultCurrency !== undefined) {
    updates.push('default_currency = ?')
    params.push(input.defaultCurrency)
  }
  if (input.timezone !== undefined) {
    updates.push('timezone = ?')
    params.push(input.timezone)
  }
  if (input.branding?.logo_url !== undefined) {
    updates.push('logo_url = ?')
    params.push(input.branding.logo_url)
  }
  if (input.branding?.primary_color !== undefined) {
    updates.push('primary_color = ?')
    params.push(input.branding.primary_color)
  }

  params.push(tenantId)
  await execute(`UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`, params)

  return getTenant(tenantId)
}

export async function listBranches(tenantId: string): Promise<Branch[]> {
  return query<Branch>(
    `SELECT id, tenant_id, code, name, type, county, address, status, created_at, updated_at
     FROM branches
     WHERE ${tenantWhere()}
     ORDER BY name ASC`,
    [tenantId],
  )
}

export async function listTenantMembers(tenantId: string): Promise<TenantMember[]> {
  return query<TenantMember>(
    `SELECT
       tm.id, tm.tenant_id, tm.user_id, tm.branch_id, tm.role, tm.status,
       tm.invited_at, tm.joined_at, tm.created_at, tm.updated_at,
       u.email, u.first_name, u.last_name,
       b.name as branch_name
     FROM tenant_members tm
     JOIN users u ON tm.user_id = u.id
     LEFT JOIN branches b ON tm.branch_id = b.id
     WHERE ${tenantWhere('tm')}
     ORDER BY tm.joined_at DESC`,
    [tenantId],
  )
}
