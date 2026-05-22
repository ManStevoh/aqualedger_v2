import { test, expect } from '@playwright/test'

test.describe('Insurance form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/risk/insurance')
    await expect(page.getByRole('heading', { name: /insurance/i })).toBeVisible()
  })

  test('creates policy via dialog and shows in table', async ({ page }) => {
    const policyNum = `E2E-POL-${Date.now()}`
    const insurer = 'E2E Marine Cover Ltd'

    await page.getByRole('button', { name: 'Add policy' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Add insurance policy')).toBeVisible()

    await page.getByLabel('Policy #').fill(policyNum)
    await page.getByLabel('Insurer').fill(insurer)
    await page.getByLabel('Premium').fill('25000')
    await page.getByLabel('Coverage').fill('500000')
    await page.getByLabel('Start').fill('2026-01-01')
    await page.getByLabel('End').fill('2027-01-01')

    await page.getByRole('button', { name: 'Save policy' }).click()

    await expect(page.getByText('Policy added')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('cell', { name: policyNum })).toBeVisible()
    await expect(page.getByRole('cell', { name: insurer })).toBeVisible()
  })
})
