import { describe, it, expect } from 'vitest'
import { slugifyOrganizationName, validateTenantSlug } from '@/lib/platform/tenant-slug'

describe('tenant slug', () => {
  it('slugifies organization names', () => {
    expect(slugifyOrganizationName('Lake Victoria Fisheries')).toBe('lake-victoria-fisheries')
  })

  it('rejects reserved slugs', () => {
    expect(validateTenantSlug('admin').ok).toBe(false)
  })

  it('accepts valid slugs', () => {
    const r = validateTenantSlug('coast-fish')
    expect(r.ok).toBe(true)
    expect(r.normalized).toBe('coast-fish')
  })
})
