import { test, expect } from '@playwright/test'

test.describe('Procurement suppliers form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/procurement/suppliers')
    await expect(page.getByRole('button', { name: 'Add Supplier' }).first()).toBeVisible()
  })

  test('creates supplier via dialog', async ({ page }) => {
    const code = `E2E-SUP-${Date.now().toString(36).slice(-6).toUpperCase()}`
    const name = `E2E Supplier ${Date.now()}`

    await page.getByRole('button', { name: 'Add Supplier' }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add Supplier' })).toBeVisible()

    await page.getByLabel('Code').fill(code)
    await page.getByLabel('Name').fill(name)
    await page.getByLabel('Contact Name').fill('E2E Contact')
    await page.getByLabel('Email').fill('supplier-e2e@demo.aquaerp.local')

    await page.getByRole('button', { name: 'Create Supplier' }).click()

    await expect(page.getByText('Supplier created')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(code)).toBeVisible()
  })
})
