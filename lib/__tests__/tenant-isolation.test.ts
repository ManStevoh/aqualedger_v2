import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'
import {
  canonicalStorePath,
  extractTenantSlugFromHost,
  isSkippablePlatformHost,
} from '@/lib/platform/tenant-host'
import { ApiError } from '@/lib/api-handler'

describe('tenant isolation', () => {
  describe('assertTenantMatch', () => {
    it('throws not found when row is null', () => {
      expect(() => assertTenantMatch(null, 'tenant-a')).toThrow(ApiError)
      try {
        assertTenantMatch(null, 'tenant-a')
      } catch (e) {
        expect((e as ApiError).status).toBe(404)
      }
    })

    it('throws forbidden when tenant_id mismatches', () => {
      expect(() => assertTenantMatch({ tenant_id: 'other' }, 'tenant-a')).toThrow(ApiError)
      try {
        assertTenantMatch({ tenant_id: 'other' }, 'tenant-a')
      } catch (e) {
        expect((e as ApiError).status).toBe(403)
      }
    })

    it('throws forbidden when tenant_id is missing', () => {
      expect(() => assertTenantMatch({ tenant_id: null }, 'tenant-a')).toThrow(ApiError)
    })

    it('passes when tenant_id matches', () => {
      const row = { tenant_id: 'tenant-a', id: 'row-1' }
      assertTenantMatch(row, 'tenant-a')
      expect(row.id).toBe('row-1')
    })
  })

  describe('pushTenantCondition', () => {
    it('appends tenant where clause and param', () => {
      const conditions: string[] = ['status = ?']
      const params: unknown[] = ['active']
      pushTenantCondition(conditions, params, 'o', 'tenant-xyz')
      expect(conditions).toEqual(['status = ?', 'o.tenant_id = ?'])
      expect(params).toEqual(['active', 'tenant-xyz'])
    })

    it('works without table alias', () => {
      const conditions: string[] = []
      const params: unknown[] = []
      pushTenantCondition(conditions, params, '', 't1')
      expect(conditions).toEqual(['tenant_id = ?'])
      expect(params).toEqual(['t1'])
    })
  })

  describe('extractTenantSlugFromHost', () => {
    const previousHost = process.env.PLATFORM_HOST

    beforeEach(() => {
      process.env.PLATFORM_HOST = 'aquaerp.co.ke'
    })

    afterEach(() => {
      process.env.PLATFORM_HOST = previousHost
    })

    it('returns null for bare platform host', () => {
      expect(extractTenantSlugFromHost('aquaerp.co.ke')).toBeNull()
      expect(extractTenantSlugFromHost('www.aquaerp.co.ke')).toBeNull()
    })

    it('returns null for reserved subdomains', () => {
      expect(extractTenantSlugFromHost('admin.aquaerp.co.ke')).toBeNull()
      expect(extractTenantSlugFromHost('api.aquaerp.co.ke')).toBeNull()
    })

    it('extracts tenant slug from platform subdomain', () => {
      expect(extractTenantSlugFromHost('acme.aquaerp.co.ke')).toBe('acme')
      expect(extractTenantSlugFromHost('acme.aquaerp.co.ke:3000')).toBe('acme')
    })

    it('extracts slug from localhost dev host', () => {
      expect(extractTenantSlugFromHost('coastfish.localhost')).toBe('coastfish')
      expect(extractTenantSlugFromHost('coastfish.localhost:3000')).toBe('coastfish')
    })

    it('returns null for invalid hosts', () => {
      expect(extractTenantSlugFromHost(null)).toBeNull()
      expect(extractTenantSlugFromHost('example.com')).toBeNull()
    })
  })

  describe('isSkippablePlatformHost', () => {
    const previousHost = process.env.PLATFORM_HOST

    beforeEach(() => {
      process.env.PLATFORM_HOST = 'aquaerp.co.ke'
    })

    afterEach(() => {
      process.env.PLATFORM_HOST = previousHost
    })

    it('skips localhost and platform apex', () => {
      expect(isSkippablePlatformHost('localhost')).toBe(true)
      expect(isSkippablePlatformHost('127.0.0.1')).toBe(true)
      expect(isSkippablePlatformHost('aquaerp.co.ke')).toBe(true)
    })

    it('does not skip custom domains', () => {
      expect(isSkippablePlatformHost('shop.client.com')).toBe(false)
    })
  })

  describe('canonicalStorePath', () => {
    it('returns null when slug already matches', () => {
      expect(canonicalStorePath('/store/acme', 'acme')).toBeNull()
      expect(canonicalStorePath('/store/acme/cart', 'acme')).toBeNull()
    })

    it('rewrites wrong slug paths', () => {
      expect(canonicalStorePath('/store/wrong', 'acme')).toBe('/store/acme')
      expect(canonicalStorePath('/store/wrong/checkout', 'acme')).toBe('/store/acme/checkout')
    })

    it('ignores non-store paths', () => {
      expect(canonicalStorePath('/dashboard', 'acme')).toBeNull()
    })
  })
})
