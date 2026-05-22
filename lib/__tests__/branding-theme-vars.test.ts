import { describe, expect, it } from 'vitest'
import {
  brandingCssVars,
  hexRelativeLuminance,
  normalizeHex,
  primaryForegroundFor,
} from '@/lib/branding/theme-vars'

describe('branding theme vars', () => {
  it('normalizes hex colors', () => {
    expect(normalizeHex('0ea5e9')).toBe('#0ea5e9')
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('invalid')).toBeNull()
  })

  it('picks light foreground on dark primaries', () => {
    expect(primaryForegroundFor('#0369a1')).toContain('0.99')
  })

  it('picks dark foreground on light primaries', () => {
    expect(primaryForegroundFor('#fde047')).toContain('0.15')
  })

  it('builds css var maps for light and dark', () => {
    const vars = brandingCssVars('#0ea5e9')
    expect(vars?.light['--primary']).toBe('#0ea5e9')
    expect(vars?.dark['--primary']).toContain('color-mix')
    expect(hexRelativeLuminance('#0ea5e9')).toBeLessThan(0.45)
  })
})
