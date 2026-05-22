import { test, expect } from '@playwright/test'

test.describe('HR employees form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/hr')
    await expect(page.getByRole('button', { name: 'Add Employee' })).toBeVisible()
  })

  test('creates employee via dialog', async ({ page }) => {
    const fullName = `E2E Staff ${Date.now()}`

    await page.getByRole('button', { name: 'Add Employee' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add employee' })).toBeVisible()

    await page.getByLabel('Full name').fill(fullName)
    await page.getByLabel('Department').fill('Operations')
    await page.getByLabel('Job title').fill('Fleet coordinator')
    await page.getByLabel('Salary (KES)').fill('45000')

    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Employee added')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(fullName)).toBeVisible()
  })
})
