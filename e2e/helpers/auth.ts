import type { APIRequestContext } from '@playwright/test'

export const DEMO_OWNER = {
  email: 'owner-coastfish@demo.aquaerp.local',
  password: 'Demo@123',
  slug: 'coastfish',
}

export const DEMO_OWNER_B = {
  email: 'owner-lamusea@demo.aquaerp.local',
  password: 'Demo@123',
  slug: 'lamusea',
}

export async function loginViaApi(
  request: APIRequestContext,
  account: { email: string; password: string },
): Promise<void> {
  const res = await request.post('/api/auth/login', {
    data: { email: account.email, password: account.password },
  })
  if (!res.ok()) {
    const body = await res.text()
    throw new Error(`Login failed (${res.status()}): ${body}`)
  }
  const json = (await res.json()) as { success?: boolean; mfaRequired?: boolean; error?: string }
  if (!json.success) {
    throw new Error(json.error || 'Login unsuccessful')
  }
  if (json.mfaRequired) {
    throw new Error('MFA enabled on test account — disable MFA for E2E user')
  }
}

export async function apiJson<T>(
  request: APIRequestContext,
  path: string,
  init?: Parameters<APIRequestContext['fetch']>[1],
): Promise<{ status: number; json: T }> {
  const res = await request.fetch(path, init)
  const json = (await res.json().catch(() => ({}))) as T
  return { status: res.status(), json }
}
