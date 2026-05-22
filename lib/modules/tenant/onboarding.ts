import crypto from 'crypto'
import type { Connection } from 'mysql2/promise'
import { queryOne, execute, generateId, transaction } from '@/lib/db'
import type { UserRole } from '@/lib/auth'
import { slugifyOrganizationName, validateTenantSlug } from '@/lib/platform/tenant-slug'

export type BusinessType =
  | 'fisherman'
  | 'cooperative'
  | 'processor'
  | 'market'
  | 'exporter'
  | 'restaurant'
  | 'logistics'

export const ONBOARDING_STEPS = ['profile', 'operations', 'go-live'] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

export interface TenantOnboarding {
  tenant_id: string
  step: number
  completed_steps: number[]
  business_type: BusinessType
  completed_at: string | null
  updated_at: string
}

export interface TenantOnboardingView extends TenantOnboarding {
  isComplete: boolean
  currentStep: OnboardingStep
  totalSteps: number
}

const BUSINESS_TYPE_USER_ROLE: Record<BusinessType, UserRole> = {
  fisherman: 'fisherman',
  cooperative: 'boat_owner',
  processor: 'fish_buyer',
  market: 'fish_buyer',
  exporter: 'fish_buyer',
  restaurant: 'fish_buyer',
  logistics: 'fish_buyer',
}

export function businessTypeToUserRole(businessType: BusinessType): UserRole {
  return BUSINESS_TYPE_USER_ROLE[businessType] ?? 'fisherman'
}

async function uniqueSlug(baseName: string, conn?: Connection): Promise<string> {
  const base = slugifyOrganizationName(baseName) || 'org'
  let slug = base
  let attempt = 0

  while (attempt < 10) {
    const existing = conn
      ? await conn
          .execute(`SELECT id FROM tenants WHERE slug = ? LIMIT 1`, [slug])
          .then(([rows]) => (rows as { id: string }[])[0])
      : await queryOne<{ id: string }>(`SELECT id FROM tenants WHERE slug = ? LIMIT 1`, [slug])

    if (!existing) return slug
    attempt += 1
    slug = `${base}-${crypto.randomBytes(2).toString('hex')}`
  }

  return `${base}-${generateId().slice(0, 8)}`
}

function parseCompletedSteps(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw.map(Number).filter((n) => Number.isFinite(n))
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter((n) => Number.isFinite(n))
      }
    } catch {
      return []
    }
  }
  return []
}

function toOnboardingView(row: TenantOnboarding): TenantOnboardingView {
  const completedSteps = parseCompletedSteps(row.completed_steps)
  const isComplete = row.completed_at != null || completedSteps.length >= ONBOARDING_STEPS.length
  const stepIndex = Math.min(Math.max(row.step, 1), ONBOARDING_STEPS.length) - 1
  return {
    ...row,
    completed_steps: completedSteps,
    isComplete,
    currentStep: ONBOARDING_STEPS[stepIndex] ?? 'profile',
    totalSteps: ONBOARDING_STEPS.length,
  }
}

export async function getOnboarding(tenantId: string): Promise<TenantOnboardingView | null> {
  const row = await queryOne<TenantOnboarding & { completed_steps: unknown }>(
    `SELECT tenant_id, step, completed_steps, business_type, completed_at, updated_at
     FROM tenant_onboarding WHERE tenant_id = ?`,
    [tenantId],
  )
  if (!row) return null
  return toOnboardingView({
    ...row,
    completed_steps: parseCompletedSteps(row.completed_steps),
  })
}

export async function createTenantWithOwner(
  userId: string,
  organizationName: string,
  businessType: BusinessType,
  preferredSlug?: string,
): Promise<{ tenantId: string; slug: string; branchId: string }> {
  const tenantId = generateId()
  const branchId = generateId()
  const memberId = generateId()

  const slug = await transaction(async (conn) => {
    let unique: string
    if (preferredSlug?.trim()) {
      const check = validateTenantSlug(preferredSlug)
      if (!check.ok) {
        throw new Error(check.error || 'Invalid subdomain')
      }
      const [rows] = await conn.execute(`SELECT id FROM tenants WHERE slug = ? LIMIT 1`, [
        check.normalized,
      ])
      const existing = (rows as { id: string }[])[0]
      if (existing) {
        throw new Error('This subdomain is already taken')
      }
      unique = check.normalized
    } else {
      unique = await uniqueSlug(organizationName, conn)
    }

    await conn.execute(
      `INSERT INTO tenants (id, slug, name, legal_name, plan, status)
       VALUES (?, ?, ?, ?, 'trial', 'active')`,
      [tenantId, unique, organizationName, organizationName],
    )

    await conn.execute(
      `INSERT INTO branches (id, tenant_id, code, name, type, status)
       VALUES (?, ?, 'HQ', ?, 'headquarters', 'active')`,
      [branchId, tenantId, `${organizationName} HQ`],
    )

    await conn.execute(
      `INSERT INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
       VALUES (?, ?, ?, ?, 'tenant_owner', 'active')`,
      [memberId, tenantId, userId, branchId],
    )

    await conn.execute(
      `INSERT INTO tenant_onboarding (tenant_id, step, completed_steps, business_type)
       VALUES (?, 1, ?, ?)`,
      [tenantId, JSON.stringify([]), businessType],
    )

    return unique
  })

  const { seedDefaultChartOfAccounts } = await import('@/lib/modules/accounting/chart-of-accounts')
  await seedDefaultChartOfAccounts(tenantId, { missingOnly: false })

  return { tenantId, slug, branchId }
}

export async function updateOnboardingStep(
  tenantId: string,
  input: { step?: number; completeStep?: number; finish?: boolean },
): Promise<TenantOnboardingView> {
  const current = await getOnboarding(tenantId)
  if (!current) {
    throw new Error('Onboarding not found')
  }

  const completedSteps = new Set(current.completed_steps)
  if (input.completeStep != null) {
    completedSteps.add(input.completeStep)
  }

  const nextStep = input.step ?? current.step
  const allDone = input.finish || completedSteps.size >= ONBOARDING_STEPS.length

  await execute(
    `UPDATE tenant_onboarding
     SET step = ?,
         completed_steps = ?,
         completed_at = CASE WHEN ? THEN COALESCE(completed_at, NOW()) ELSE completed_at END,
         updated_at = NOW()
     WHERE tenant_id = ?`,
    [
      Math.min(Math.max(nextStep, 1), ONBOARDING_STEPS.length),
      JSON.stringify([...completedSteps].sort((a, b) => a - b)),
      allDone ? 1 : 0,
      tenantId,
    ],
  )

  const updated = await getOnboarding(tenantId)
  if (!updated) throw new Error('Failed to update onboarding')
  return updated
}

export async function isOnboardingComplete(tenantId: string): Promise<boolean> {
  const row = await getOnboarding(tenantId)
  return row?.isComplete ?? true
}
