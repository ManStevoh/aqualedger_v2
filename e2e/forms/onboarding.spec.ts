import { test, expect } from '@playwright/test'

test.describe('Onboarding', () => {
  test('completed demo tenant redirects away from onboarding', async ({ page }) => {
    await page.goto('/dashboard/onboarding')
    await page.waitForURL(/\/dashboard\/?$/, { timeout: 15_000 }).catch(() => null)
    const url = page.url()
    expect(url).toMatch(/\/dashboard\/?$/)
  })

  test('onboarding API reports complete for demo owner', async ({ request }) => {
    const health = await request.get('/api/health')
    if (!health.ok()) {
      test.skip(true, 'Server not running')
    }

    const login = await request.post('/api/auth/login', {
      data: {
        email: 'owner-coastfish@demo.aquaerp.local',
        password: 'Demo@123',
      },
    })
    if (!login.ok()) {
      test.skip(true, 'Demo seed required — npm run db:seed:demo')
    }
    const loginJson = (await login.json()) as { success?: boolean; mfaRequired?: boolean }
    if (!loginJson.success || loginJson.mfaRequired) {
      test.skip(true, 'Login failed for demo owner')
    }

    const onb = await request.get('/api/v2/tenant/onboarding')
    expect(onb.ok()).toBeTruthy()
    const json = (await onb.json()) as { success?: boolean; data?: { isComplete?: boolean } }
    expect(json.success).toBeTruthy()
    expect(json.data?.isComplete).toBe(true)
  })
})
