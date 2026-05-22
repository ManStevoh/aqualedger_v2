import type { BrandCssVars } from '@/lib/branding/theme-vars'

export interface BrandIdentity {
  /** Display name in sidebar / auth (tenant name or platform app name) */
  appName: string
  tagline?: string
  logoUrl: string | null
  primaryColor: string | null
  cssVars: BrandCssVars | null
}

export interface PlatformBrandingInput {
  logo_url?: string
  primary_color?: string
  app_name?: string
}
