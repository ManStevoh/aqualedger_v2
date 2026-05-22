import { test, expect } from '@playwright/test'

test.describe('CRM leads form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/crm/leads')
    await expect(page.getByRole('button', { name: 'Add Lead' })).toBeVisible()
  })

  test('creates lead via dialog', async ({ page }) => {
    const leadName = `E2E Lead ${Date.now()}`

    await page.getByRole('button', { name: 'Add Lead' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Add Lead', { exact: true })).toBeVisible()

    await page.getByLabel('Name').fill(leadName)
    await page.getByLabel('Email').fill('e2e-lead@demo.aquaerp.local')
    await page.getByLabel('Estimated Value (KES)').fill('125000')

    await page.getByRole('button', { name: 'Create Lead' }).click()

    await expect(page.getByText('Lead created')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(leadName)).toBeVisible()
  })
})
