/**
 * Map tenant/platform hex colors to dashboard CSS variables (WCAG-friendly foreground).
 */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Normalize #RGB / #RRGGBB / RRGGBB to lowercase #rrggbb */
export function normalizeHex(color: string | null | undefined): string | null {
  if (!color?.trim()) return null
  let c = color.trim()
  if (!c.startsWith('#')) c = `#${c}`
  if (!HEX_RE.test(c)) return null
  if (c.length === 4) {
    c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return c.toLowerCase()
}

function channelToLinear(v: number): number {
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance for sRGB hex */
export function hexRelativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const r = channelToLinear(((n >> 16) & 255) / 255)
  const g = channelToLinear(((n >> 8) & 255) / 255)
  const b = channelToLinear((n & 255) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function primaryForegroundFor(hex: string): string {
  return hexRelativeLuminance(hex) > 0.45
    ? 'oklch(0.15 0.03 200)'
    : 'oklch(0.99 0.002 200)'
}

export type BrandCssVars = {
  light: Record<string, string>
  dark: Record<string, string>
}

/** Overrides for :root and .dark — keeps global layout tokens, swaps primary family only */
export function brandingCssVars(primaryHex: string | null | undefined): BrandCssVars | null {
  const hex = normalizeHex(primaryHex)
  if (!hex) return null

  const fg = primaryForegroundFor(hex)
  const darkFg = 'oklch(0.12 0.03 200)'
  const darkPrimary = `color-mix(in srgb, ${hex} 85%, white)`

  const base = (primary: string, foreground: string) => ({
    '--primary': primary,
    '--primary-foreground': foreground,
    '--ring': primary,
    '--sidebar-primary': primary,
    '--sidebar-primary-foreground': foreground,
    '--sidebar-ring': primary,
    '--gradient-brand': `linear-gradient(135deg, ${primary} 0%, color-mix(in srgb, ${primary} 65%, #1e3a5f) 100%)`,
  })

  return {
    light: base(hex, fg),
    dark: base(darkPrimary, darkFg),
  }
}
