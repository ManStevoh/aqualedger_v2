import { test, expect } from '@playwright/test'

test.describe('Expenses form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/expenses')
    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible()
  })

  test('submits expense via dialog', async ({ page }) => {
    const description = `E2E fuel expense ${Date.now()}`

    await page.getByRole('button', { name: 'Add Expense' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Add expense')).toBeVisible()

    await page.getByLabel('Description').fill(description)
    await page.getByLabel('Amount (KES)').fill('4500')

    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Expense submitted')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(description)).toBeVisible()
  })
})
