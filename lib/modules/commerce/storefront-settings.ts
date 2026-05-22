import { query, queryOne, execute } from '@/lib/db'
import { resolveTenantId } from '@/lib/tenant'
import {
  getStorefrontTheme,
  themeToCssVars,
  type StorefrontTheme,
  type StorefrontThemeTokens,
  STOREFRONT_THEMES,
} from './storefront-themes'

export interface TenantStorefrontSettings {
  tenant_id: string
  theme_id: string
  store_name: string | null
  tagline: string | null
  logo_url: string | null
  favicon_url: string | null
  hero_image_url: string | null
  hero_headline: string | null
  hero_subheadline: string | null
  hero_cta_label: string | null
  hero_cta_href: string | null
  custom_tokens: Record<string, string> | null
  show_traceability: number
  show_reviews: number
  show_loyalty: number
  cookie_banner_text: string | null
  privacy_policy_url: string | null
  terms_url: string | null
  footer_text: string | null
  social_links: Record<string, string> | null
  seo_title: string | null
  seo_description: string | null
  published: number
}

export async function getStorefrontSettingsByTenantId(
  tenantId: string,
): Promise<TenantStorefrontSettings | null> {
  const row = await queryOne<TenantStorefrontSettings & { custom_tokens: string | null; social_links: string | null }>(
    `SELECT * FROM tenant_storefront_settings WHERE tenant_id = ?`,
    [tenantId],
  )
  if (!row) return null
  return parseSettingsRow(row)
}

export async function getStorefrontSettingsBySlug(
  slug: string,
): Promise<(TenantStorefrontSettings & { tenant_slug: string; tenant_name: string }) | null> {
  const row = await queryOne<
    TenantStorefrontSettings & {
      tenant_slug: string
      tenant_name: string
      custom_tokens: string | null
      social_links: string | null
    }
  >(
    `SELECT s.*, t.slug as tenant_slug, t.name as tenant_name
     FROM tenant_storefront_settings s
     JOIN tenants t ON s.tenant_id = t.id
     WHERE t.slug = ? AND s.published = 1 AND t.status = 'active'`,
    [slug],
  )
  if (!row) return null
  return { ...parseSettingsRow(row), tenant_slug: row.tenant_slug, tenant_name: row.tenant_name }
}

function parseSettingsRow(
  row: TenantStorefrontSettings & { custom_tokens: string | null; social_links: string | null },
): TenantStorefrontSettings {
  let custom_tokens: Record<string, string> | null = null
  let social_links: Record<string, string> | null = null
  if (row.custom_tokens) {
    try {
      custom_tokens = typeof row.custom_tokens === 'string' ? JSON.parse(row.custom_tokens) : row.custom_tokens
    } catch {
      custom_tokens = null
    }
  }
  if (row.social_links) {
    try {
      social_links = typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links
    } catch {
      social_links = null
    }
  }
  return { ...row, custom_tokens, social_links }
}

export function resolveThemeCssVars(
  themeId: string,
  customOverrides?: Record<string, string> | null,
): { theme: StorefrontTheme; cssVars: Record<string, string> } {
  const theme =
    getStorefrontTheme(themeId) ??
    getStorefrontTheme('ocean-classic') ??
    STOREFRONT_THEMES[0]
  const base = themeToCssVars(theme.tokens)
  if (customOverrides) {
    for (const [k, v] of Object.entries(customOverrides)) {
      if (k.startsWith('--') || k in theme.tokens) {
        base[k.startsWith('--') ? k : `--sf-${k}`] = v
      }
    }
  }
  return { theme, cssVars: base }
}

export async function upsertStorefrontSettings(
  tenantId: string | null | undefined,
  input: Partial<TenantStorefrontSettings>,
): Promise<TenantStorefrontSettings> {
  const tid = resolveTenantId(tenantId)
  const existing = await getStorefrontSettingsByTenantId(tid)

  if (!existing) {
    await execute(
      `INSERT INTO tenant_storefront_settings (tenant_id, theme_id, store_name, tagline, published)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tid,
        input.theme_id || 'ocean-classic',
        input.store_name || null,
        input.tagline || null,
        input.published ?? 0,
      ],
    )
  }

  const fields: string[] = []
  const params: unknown[] = []

  const allowed: (keyof TenantStorefrontSettings)[] = [
    'theme_id', 'store_name', 'tagline', 'logo_url', 'favicon_url', 'hero_image_url',
    'hero_headline', 'hero_subheadline', 'hero_cta_label', 'hero_cta_href',
    'show_traceability', 'show_reviews', 'show_loyalty', 'cookie_banner_text',
    'privacy_policy_url', 'terms_url', 'footer_text', 'seo_title', 'seo_description', 'published',
  ]

  for (const key of allowed) {
    if (input[key] !== undefined) {
      fields.push(`${key} = ?`)
      params.push(input[key])
    }
  }

  if (input.custom_tokens !== undefined) {
    fields.push('custom_tokens = ?')
    params.push(input.custom_tokens ? JSON.stringify(input.custom_tokens) : null)
  }
  if (input.social_links !== undefined) {
    fields.push('social_links = ?')
    params.push(input.social_links ? JSON.stringify(input.social_links) : null)
  }

  if (fields.length > 0) {
    params.push(tid)
    await execute(`UPDATE tenant_storefront_settings SET ${fields.join(', ')} WHERE tenant_id = ?`, params)
  }

  const updated = await getStorefrontSettingsByTenantId(tid)
  if (!updated) throw new Error('Failed to save storefront settings')
  return updated
}

export function listAvailableThemes() {
  return STOREFRONT_THEMES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    previewGradient: t.previewGradient,
    standards: t.standards,
    wcagLevel: t.wcagLevel,
    heroStyle: t.tokens.heroStyle,
    productGridCols: t.tokens.productGridCols,
    cardStyle: t.tokens.cardStyle,
  }))
}

export function mergeCustomTokens(
  base: StorefrontThemeTokens,
  overrides?: Record<string, string> | null,
): StorefrontThemeTokens {
  if (!overrides) return base
  const merged = { ...base }
  const map: Record<string, keyof StorefrontThemeTokens> = {
    primary: 'primary',
    accent: 'accent',
    background: 'background',
    text: 'text',
  }
  for (const [k, v] of Object.entries(overrides)) {
    const key = map[k] || (k as keyof StorefrontThemeTokens)
    if (key in merged && typeof v === 'string') {
      ;(merged as Record<string, unknown>)[key] = v
    }
  }
  return merged
}
