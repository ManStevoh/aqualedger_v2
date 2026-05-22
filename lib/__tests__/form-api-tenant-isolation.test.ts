import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, it, expect } from 'vitest'
import { assertTenantMatch, pushTenantCondition, tenantFilter } from '@/lib/tenant-scope'
import { tenantWhere } from '@/lib/tenant'
import { ApiError } from '@/lib/api-handler'

const ROOT = join(__dirname, '..', '..')

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8')
}

/** Extract exported async function body for static SQL checks */
function getAsyncFunctionSource(fileContent: string, fnName: string): string {
  const re = new RegExp(
    `export async function ${fnName}[\\s\\S]*?(?=\\nexport (async )?function |\\nexport const |$)`,
  )
  const match = fileContent.match(re)
  if (!match) {
    throw new Error(`Function ${fnName} not found in source`)
  }
  return match[0]
}

function assertInsertStatementsIncludeTenantId(fnSource: string, label: string): void {
  const inserts = [...fnSource.matchAll(/`INSERT INTO[\s\S]*?`/g)].map((m) => m[0])
  expect(inserts.length, `${label}: expected at least one INSERT`).toBeGreaterThan(0)
  for (const sql of inserts) {
    expect(sql, `${label}: INSERT must list tenant_id column`).toMatch(/tenant_id/)
  }
}

function assertNoClientTenantIdInBody(handlerSource: string, label: string): void {
  expect(handlerSource, `${label}: must not trust tenantId from request body`).not.toMatch(
    /(?:body|raw|parsed|discriminated)\.tenantId\b/i,
  )
}

describe('form API tenant isolation', () => {
  describe('assertTenantMatch — form-shaped rows', () => {
    const authTenant = 'tenant-coast-001'

    it('allows insurance policy row after create', () => {
      const row = {
        tenant_id: authTenant,
        id: 'pol-1',
        policy_number: 'POL-2024-001',
        insurer_name: 'Marine Cover Ltd',
      }
      assertTenantMatch(row, authTenant, 'Policy')
      expect(row.policy_number).toBe('POL-2024-001')
    })

    it('rejects insurance claim row from another tenant', () => {
      const row = {
        tenant_id: 'tenant-other',
        id: 'clm-1',
        policy_id: 'pol-1',
        claimed_amount: 50000,
      }
      expect(() => assertTenantMatch(row, authTenant, 'Claim')).toThrow(ApiError)
      try {
        assertTenantMatch(row, authTenant)
      } catch (e) {
        expect((e as ApiError).status).toBe(403)
      }
    })

    it('rejects CRM lead row missing tenant_id', () => {
      const row = {
        tenant_id: null as string | null,
        id: 'lead-1',
        name: 'Harbor Restaurant',
        stage: 'new',
      }
      expect(() => assertTenantMatch(row, authTenant, 'Lead')).toThrow(ApiError)
    })

    it('allows expense row matching session tenant', () => {
      const row = {
        tenant_id: authTenant,
        id: 'exp-1',
        user_id: 'user-1',
        category: 'fuel',
        amount: 12000,
      }
      assertTenantMatch(row, authTenant, 'Expense')
    })

    it('rejects inventory batch row when tenant mismatches', () => {
      const row = {
        tenant_id: 'tenant-north',
        id: 'batch-1',
        batch_code: 'LOT-99',
        sku: 'TIL-01',
      }
      expect(() => assertTenantMatch(row, authTenant)).toThrow(ApiError)
    })
  })

  describe('pushTenantCondition / tenantFilter — form list filters', () => {
    it('scopes expense-style list queries by tenant', () => {
      const conditions: string[] = []
      const params: unknown[] = []
      pushTenantCondition(conditions, params, 'e', 'tenant-expenses')
      expect(conditions).toEqual(['e.tenant_id = ?'])
      expect(params).toEqual(['tenant-expenses'])
    })

    it('tenantFilter matches pushTenantCondition for insurance alias', () => {
      const { sql, param } = tenantFilter('p', 'tenant-risk')
      expect(sql).toBe(tenantWhere('p'))
      expect(param).toBe('tenant-risk')
      const conditions: string[] = []
      const params: unknown[] = []
      pushTenantCondition(conditions, params, 'p', 'tenant-risk')
      expect(conditions).toEqual([sql])
      expect(params).toEqual([param])
    })
  })

  describe('POST route handlers — auth tenant, not body tenant', () => {
    const formPostRoutes = [
      {
        path: 'app/api/v2/risk/insurance/route.ts',
        label: 'risk/insurance',
        permission: 'risk.insurance.write',
        createCall: 'createInsurancePolicy(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/crm/leads/route.ts',
        label: 'crm/leads',
        permission: 'crm.leads.write',
        createCall: 'createLead(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/crm/customers/route.ts',
        label: 'crm/customers',
        permission: 'crm.customers.write',
        createCall: 'createCustomer(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/expenses/route.ts',
        label: 'expenses',
        permission: 'accounting.expenses.write',
        createCall: 'auth.tenantId',
        authPattern: /withApiPermission\(/,
      },
      {
        path: 'app/api/v2/inventory/route.ts',
        label: 'inventory',
        permission: 'inventory.batches.write',
        createCall: 'createInventoryBatch(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/commerce/products/route.ts',
        label: 'commerce/products',
        permission: 'commerce.catalog.write',
        createCall: 'createProductCatalog(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/procurement/suppliers/route.ts',
        label: 'procurement/suppliers',
        permission: 'procurement.suppliers.write',
        createCall: 'createSupplier(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/hr/employees/route.ts',
        label: 'hr/employees',
        permission: 'hr.employees.write',
        createCall: 'createEmployee(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
      {
        path: 'app/api/v2/fishing-ops/zones/route.ts',
        label: 'fishing-ops/zones',
        permission: 'fishing.zones.write',
        createCall: 'createFishingZone(ctx.tenantId',
        authPattern: /requirePermission\(/,
      },
    ] as const

    for (const route of formPostRoutes) {
      it(`${route.label} POST binds tenant from auth context`, () => {
        const src = readSource(route.path)
        expect(src).toMatch(route.authPattern)
        expect(src).toContain(route.permission)
        expect(src).toContain(route.createCall)
        assertNoClientTenantIdInBody(src, route.label)
      })
    }

    it('platform/tenants POST uses super-admin guard, not tenant-scoped create', () => {
      const src = readSource('app/api/v2/platform/tenants/route.ts')
      const postBlock = src.slice(src.indexOf('export const POST'), src.indexOf('const patchSchema'))
      expect(postBlock).toMatch(/requireSuperAdmin\(/)
      expect(postBlock).toContain('provisionTenant(body, admin.userId)')
      expect(postBlock).not.toContain('ctx.tenantId')
      assertNoClientTenantIdInBody(postBlock, 'platform/tenants POST')
    })
  })

  describe('module services — INSERT includes tenant_id (static)', () => {
    it('createInsurancePolicy inserts tenant_id', () => {
      const src = readSource('lib/modules/risk/insurance.ts')
      const fn = getAsyncFunctionSource(src, 'createInsurancePolicy')
      assertInsertStatementsIncludeTenantId(fn, 'createInsurancePolicy')
      expect(fn).toMatch(/resolveTenantId\(tenantId\)/)
    })

    it('createInsuranceClaim inserts tenant_id and scopes policy lookup', () => {
      const src = readSource('lib/modules/risk/insurance.ts')
      const fn = getAsyncFunctionSource(src, 'createInsuranceClaim')
      assertInsertStatementsIncludeTenantId(fn, 'createInsuranceClaim')
      expect(fn).toMatch(/tenantWhere\(\)/)
      expect(fn).toMatch(/resolveTenantId\(tenantId\)/)
    })

    it('createLead inserts tenant_id', () => {
      const src = readSource('lib/modules/crm/service.ts')
      const fn = getAsyncFunctionSource(src, 'createLead')
      assertInsertStatementsIncludeTenantId(fn, 'createLead')
      expect(fn).toMatch(/resolveTenantId\(tenantId\)/)
    })

    it('createInventoryBatch inserts tenant_id and pre-checks duplicate by tenant', () => {
      const src = readSource('lib/modules/inventory/service.ts')
      const fn = getAsyncFunctionSource(src, 'createInventoryBatch')
      assertInsertStatementsIncludeTenantId(fn, 'createInventoryBatch')
      expect(fn).toMatch(/WHERE tenant_id = \?/)
    })
  })

  describe('expenses POST — inline INSERT tenant_id (static)', () => {
    it('INSERT INTO expenses lists tenant_id from auth', () => {
      const src = readSource('app/api/v2/expenses/route.ts')
      const postBlock = src.slice(src.indexOf('export async function POST'))
      expect(postBlock).toMatch(
        /INSERT INTO expenses[\s\S]*tenant_id[\s\S]*auth\.tenantId/,
      )
      expect(postBlock).toMatch(/withApiPermission\('accounting\.expenses\.write'\)/)
      assertNoClientTenantIdInBody(postBlock, 'expenses POST')
    })
  })

  describe('platform provision — tenant creation, not cross-tenant form', () => {
    it('provisionTenant delegates to createTenantWithOwner without caller tenant_id param', () => {
      const src = readSource('lib/modules/platform/provision-tenant.ts')
      const fn = getAsyncFunctionSource(src, 'provisionTenant')
      expect(fn).toContain('createTenantWithOwner')
      expect(fn).not.toMatch(/INSERT[\s\S]*tenant_id[\s\S]*input\.tenantId/i)
    })
  })
})
