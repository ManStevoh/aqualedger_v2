import { describe, expect, it } from 'vitest'
import { mergeTenantEnabledModuleIds } from '@/lib/modules/platform/tenant-module-flags'

describe('mergeTenantEnabledModuleIds', () => {
  const platform = new Set(['platform', 'tenant', 'fishing', 'commerce', 'ai'])

  it('inherits platform when no overrides', () => {
    const result = mergeTenantEnabledModuleIds(platform, [], [])
    expect(result.has('fishing')).toBe(true)
    expect(result.has('commerce')).toBe(true)
    expect(result.has('procurement')).toBe(false)
  })

  it('disables a module for tenant via override', () => {
    const result = mergeTenantEnabledModuleIds(
      platform,
      [{ module_id: 'commerce', enabled: false }],
      [],
    )
    expect(result.has('commerce')).toBe(false)
    expect(result.has('fishing')).toBe(true)
  })

  it('cannot enable module disabled platform-wide', () => {
    const result = mergeTenantEnabledModuleIds(
      platform,
      [{ module_id: 'procurement', enabled: true }],
      [],
    )
    expect(result.has('procurement')).toBe(false)
  })

  it('applies legacy feature-flag disables after overrides', () => {
    const result = mergeTenantEnabledModuleIds(
      platform,
      [{ module_id: 'ai', enabled: true }],
      ['ai'],
    )
    expect(result.has('ai')).toBe(false)
  })

  it('always keeps platform overview module', () => {
    const result = mergeTenantEnabledModuleIds(new Set(['tenant']), [], [])
    expect(result.has('platform')).toBe(true)
  })
})
