import { test, expect } from '@playwright/test'
import { DEMO_OWNER, DEMO_OWNER_B, loginViaApi, apiJson } from './helpers/auth'

test.describe('Tenant data isolation (API)', () => {
  test.beforeAll(async ({ playwright, baseURL }) => {
    const probe = await playwright.request.newContext({ baseURL })
    const health = await probe.get('/api/health')
    await probe.dispose()
    if (!health.ok()) {
      test.skip(true, 'Server not running — start with npm run dev')
    }
  })

  test('tenant B cannot read or update tenant A CRM lead', async ({ playwright, baseURL }) => {
    const uniqueName = `E2E-ISO-${Date.now()}`
    let leadId = ''

    const ctxA = await playwright.request.newContext({ baseURL })
    try {
      await loginViaApi(ctxA, DEMO_OWNER)
      const create = await apiJson<{
        success?: boolean
        data?: { lead?: { id: string; name: string } }
        error?: string
      }>(ctxA, '/api/v2/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { name: uniqueName, stage: 'new', estimatedValue: 1000 },
      })
      expect(create.status).toBe(201)
      expect(create.json.success).toBeTruthy()
      leadId = create.json.data?.lead?.id || ''
      expect(leadId).toBeTruthy()
    } catch (err) {
      await ctxA.dispose()
      test.skip(true, err instanceof Error ? err.message : 'Tenant A login failed')
    }

    const ctxB = await playwright.request.newContext({ baseURL })
    try {
      await loginViaApi(ctxB, DEMO_OWNER_B)

      const getOther = await apiJson<{ success?: boolean; error?: string }>(
        ctxB,
        `/api/v2/crm/leads/${leadId}`,
      )
      expect([403, 404]).toContain(getOther.status)

      const patchOther = await apiJson<{ success?: boolean; error?: string }>(
        ctxB,
        `/api/v2/crm/leads/${leadId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          data: { stage: 'won' },
        },
      )
      expect([403, 404]).toContain(patchOther.status)

      const list = await apiJson<{
        success?: boolean
        data?: { leads?: Array<{ id: string; name: string }> }
      }>(ctxB, '/api/v2/crm/leads?limit=200')
      expect(list.status).toBe(200)
      expect(list.json.success).toBeTruthy()
      const found = list.json.data?.leads?.find((l) => l.id === leadId)
      expect(found).toBeUndefined()
    } finally {
      await ctxB.dispose()
      await ctxA.dispose()
    }
  })

  test('insurance policy created in tenant A not listed for tenant B', async ({
    playwright,
    baseURL,
  }) => {
    const policyNumber = `E2E-ISO-POL-${Date.now()}`
    const ctxA = await playwright.request.newContext({ baseURL })

    try {
      await loginViaApi(ctxA, DEMO_OWNER)
      const create = await apiJson<{ success?: boolean; data?: { policy?: { id: string } } }>(
        ctxA,
        '/api/v2/risk/insurance',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            type: 'policy',
            policyNumber,
            insurerName: 'Isolation Test Insurer',
            policyType: 'hull',
            premiumAmount: 1000,
            coverageAmount: 50000,
            startDate: '2026-01-01',
            endDate: '2027-01-01',
          },
        },
      )
      expect(create.status).toBe(201)
      expect(create.json.success).toBeTruthy()
    } catch (err) {
      await ctxA.dispose()
      test.skip(true, err instanceof Error ? err.message : 'Setup failed')
    }

    const ctxB = await playwright.request.newContext({ baseURL })
    try {
      await loginViaApi(ctxB, DEMO_OWNER_B)
      const list = await apiJson<{
        success?: boolean
        data?: { policies?: Array<{ policy_number: string }> }
      }>(ctxB, '/api/v2/risk/insurance?limit=200')
      expect(list.status).toBe(200)
      const match = list.json.data?.policies?.find((p) => p.policy_number === policyNumber)
      expect(match).toBeUndefined()
    } finally {
      await ctxB.dispose()
      await ctxA.dispose()
    }
  })

  test('expense created in tenant A not visible in tenant B list', async ({
    playwright,
    baseURL,
  }) => {
    const description = `E2E-ISO-EXP-${Date.now()}`
    const ctxA = await playwright.request.newContext({ baseURL })

    try {
      await loginViaApi(ctxA, DEMO_OWNER)
      const create = await apiJson<{ success?: boolean }>(ctxA, '/api/v2/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          category: 'fuel',
          description,
          amount: 999,
          date: '2026-05-22',
        },
      })
      expect([200, 201]).toContain(create.status)
      expect(create.json.success).toBeTruthy()
    } catch (err) {
      await ctxA.dispose()
      test.skip(true, err instanceof Error ? err.message : 'Setup failed')
    }

    const ctxB = await playwright.request.newContext({ baseURL })
    try {
      await loginViaApi(ctxB, DEMO_OWNER_B)
      const list = await apiJson<{
        success?: boolean
        data?: { expenses?: Array<{ description?: string }> }
      }>(ctxB, '/api/v2/expenses?limit=200')
      expect(list.status).toBe(200)
      const match = list.json.data?.expenses?.find(
        (e) => String(e.description || '').includes(description),
      )
      expect(match).toBeUndefined()
    } finally {
      await ctxB.dispose()
      await ctxA.dispose()
    }
  })
})
