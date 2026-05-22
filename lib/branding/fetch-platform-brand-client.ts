import { apiFetch } from '@/lib/client-api'
import { buildBrandIdentity, envPlatformBranding } from '@/lib/branding/build-identity'
import type { BrandIdentity } from '@/lib/branding/types'

/** Load platform branding from public status API (no auth). */
export async function fetchPlatformBrandClient(): Promise<BrandIdentity> {
  const env = envPlatformBranding()
  try {
    const res = await apiFetch('/public/platform/status')
    const json = await res.json()
    if (!json.success || !json.data) return env
    const d = json.data as {
      brandingLogoUrl?: string
      brandingPrimaryColor?: string
      brandingAppName?: string
    }
    return buildBrandIdentity({
      appName: d.brandingAppName || env.appName,
      logoUrl: d.brandingLogoUrl || env.logoUrl,
      primaryColor: d.brandingPrimaryColor || env.primaryColor,
    })
  } catch {
    return env
  }
}
