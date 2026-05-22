import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { storefrontSettingsUpdateSchema } from '@/lib/modules/commerce/schemas'
import {
  getStorefrontSettingsByTenantId,
  upsertStorefrontSettings,
  listAvailableThemes,
  resolveThemeCssVars,
} from '@/lib/modules/commerce/storefront-settings'
import { getTenantSlugById } from '@/lib/modules/commerce/storefront-public'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('commerce.storefront.read')
  let settings = await getStorefrontSettingsByTenantId(ctx.tenantId)
  if (!settings) {
    settings = await upsertStorefrontSettings(ctx.tenantId, {
      theme_id: 'ocean-classic',
      published: 0,
    })
  }
  const { theme, cssVars } = resolveThemeCssVars(settings.theme_id, settings.custom_tokens)
  const slug = await getTenantSlugById(ctx.tenantId)
  const themes = listAvailableThemes()

  return jsonOk({
    settings,
    theme,
    cssVars,
    themes,
    previewUrl: slug ? `/store/${slug}` : null,
  })
}, 'v2/commerce/storefront')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.storefront.write')
  const body = await request.json()
  const parsed = storefrontSettingsUpdateSchema.parse(body)

  const settings = await upsertStorefrontSettings(ctx.tenantId, {
    theme_id: parsed.themeId,
    store_name: parsed.storeName ?? undefined,
    tagline: parsed.tagline ?? undefined,
    logo_url: parsed.logoUrl || null,
    favicon_url: parsed.faviconUrl || null,
    hero_image_url: parsed.heroImageUrl || null,
    hero_headline: parsed.heroHeadline ?? undefined,
    hero_subheadline: parsed.heroSubheadline ?? undefined,
    hero_cta_label: parsed.heroCtaLabel ?? undefined,
    hero_cta_href: parsed.heroCtaHref ?? undefined,
    custom_tokens: parsed.customTokens ?? undefined,
    show_traceability: parsed.showTraceability !== undefined ? (parsed.showTraceability ? 1 : 0) : undefined,
    show_reviews: parsed.showReviews !== undefined ? (parsed.showReviews ? 1 : 0) : undefined,
    show_loyalty: parsed.showLoyalty !== undefined ? (parsed.showLoyalty ? 1 : 0) : undefined,
    cookie_banner_text: parsed.cookieBannerText ?? undefined,
    privacy_policy_url: parsed.privacyPolicyUrl || null,
    terms_url: parsed.termsUrl || null,
    footer_text: parsed.footerText ?? undefined,
    social_links: parsed.socialLinks ?? undefined,
    seo_title: parsed.seoTitle ?? undefined,
    seo_description: parsed.seoDescription ?? undefined,
    published: parsed.published !== undefined ? (parsed.published ? 1 : 0) : undefined,
  })

  const { theme, cssVars } = resolveThemeCssVars(settings.theme_id, settings.custom_tokens)
  const slug = await getTenantSlugById(ctx.tenantId)

  return jsonOk({ settings, theme, cssVars, previewUrl: slug ? `/store/${slug}` : null })
}, 'v2/commerce/storefront')
