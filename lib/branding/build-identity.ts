import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { brandingCssVars } from '@/lib/branding/theme-vars'
import type { BrandIdentity } from '@/lib/branding/types'

export function buildBrandIdentity(input: {
  appName?: string | null
  tagline?: string | null
  logoUrl?: string | null
  primaryColor?: string | null
}): BrandIdentity {
  const appName = input.appName?.trim() || APP_NAME
  const tagline = input.tagline?.trim() || APP_TAGLINE
  const logoUrl = input.logoUrl?.trim() || null
  const primaryColor = input.primaryColor?.trim() || null
  return {
    appName,
    tagline,
    logoUrl,
    primaryColor,
    cssVars: brandingCssVars(primaryColor),
  }
}

/** Env fallbacks for platform marketing / auth when DB branding is empty */
export function envPlatformBranding(): BrandIdentity {
  return buildBrandIdentity({
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
    logoUrl: process.env.NEXT_PUBLIC_PLATFORM_LOGO_URL,
    primaryColor: process.env.NEXT_PUBLIC_PLATFORM_PRIMARY_COLOR,
  })
}
