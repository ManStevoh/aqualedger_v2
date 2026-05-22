import { test as setup, expect } from '@playwright/test'
import { DEMO_OWNER, loginViaApi } from './helpers/auth'
import fs from 'fs'
import path from 'path'

const authDir = path.join(__dirname, '.auth')
const authFile = path.join(authDir, 'demo-owner.json')

setup('authenticate demo tenant owner', async ({ request, baseURL }) => {
  const health = await request.get('/api/health')
  if (!health.ok()) {
    setup.skip(true, `App not reachable at ${baseURL} — start with npm run dev`)
  }

  try {
    await loginViaApi(request, DEMO_OWNER)
  } catch (err) {
    setup.skip(
      true,
      err instanceof Error ? err.message : 'Login failed — run npm run db:seed:demo',
    )
  }

  const me = await request.get('/api/auth/me')
  expect(me.ok()).toBeTruthy()
  const meJson = (await me.json()) as { success?: boolean; data?: { user?: { email?: string } } }
  expect(meJson.success).toBeTruthy()
  expect(meJson.data?.user?.email).toBe(DEMO_OWNER.email)

  fs.mkdirSync(authDir, { recursive: true })
  await request.storageState({ path: authFile })
})
