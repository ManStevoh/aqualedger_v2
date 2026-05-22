import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isRecaptchaRequired,
  toPublicConfig,
  verifyRecaptchaToken,
  RECAPTCHA_TEST_SECRET_KEY,
  getRecaptchaConfig,
  invalidateRecaptchaCache,
} from '@/lib/modules/security/recaptcha'

vi.mock('@/lib/db', () => ({
  queryOne: vi.fn(),
  query: vi.fn().mockResolvedValue([]),
  execute: vi.fn(),
  generateId: vi.fn(() => 'audit-test-id'),
}))

import { queryOne } from '@/lib/db'

const baseConfig = {
  enabled: true,
  version: 'v3' as const,
  siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  secretKey: RECAPTCHA_TEST_SECRET_KEY,
  minScore: 0.5,
  protectLogin: true,
  protectRegister: true,
  protectGuestCheckout: true,
  hostnameAllowlist: [] as string[],
}

describe('recaptcha', () => {
  beforeEach(() => {
    invalidateRecaptchaCache()
    vi.mocked(queryOne).mockResolvedValue({
      setting_value: JSON.stringify(baseConfig),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('isRecaptchaRequired', () => {
    it('returns false when disabled', () => {
      expect(isRecaptchaRequired({ ...baseConfig, enabled: false }, 'login')).toBe(false)
    })

    it('returns true for login when configured', () => {
      expect(isRecaptchaRequired(baseConfig, 'login')).toBe(true)
    })

    it('returns true for guest checkout when enabled', () => {
      expect(isRecaptchaRequired(baseConfig, 'guest_checkout')).toBe(true)
    })
  })

  describe('toPublicConfig', () => {
    it('returns null when disabled', () => {
      expect(toPublicConfig({ ...baseConfig, enabled: false })).toBeNull()
    })

    it('never includes secret key', () => {
      const pub = toPublicConfig(baseConfig)
      expect(pub?.siteKey).toBeTruthy()
      expect(Object.keys(pub ?? {})).not.toContain('secretKey')
    })
  })

  describe('verifyRecaptchaToken', () => {
    it('accepts high v3 score from siteverify', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: async () => ({
            success: true,
            score: 0.9,
            action: 'login',
            hostname: 'localhost',
          }),
        }),
      )

      const result = await verifyRecaptchaToken({
        token: 'valid-token',
        expectedAction: 'login',
      })
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.score).toBe(0.9)
    })

    it('rejects low v3 score', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: async () => ({
            success: true,
            score: 0.1,
            action: 'login',
          }),
        }),
      )

      const result = await verifyRecaptchaToken({
        token: 'bot-token',
        expectedAction: 'login',
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe('RECAPTCHA_LOW_SCORE')
    })

    it('rejects hostname not in allowlist', async () => {
      vi.mocked(queryOne).mockResolvedValue({
        setting_value: JSON.stringify({
          ...baseConfig,
          hostnameAllowlist: ['app.example.com'],
        }),
      })
      invalidateRecaptchaCache()

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: async () => ({
            success: true,
            score: 0.9,
            action: 'login',
            hostname: 'evil.example.com',
          }),
        }),
      )

      const result = await verifyRecaptchaToken({ token: 't' })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe('RECAPTCHA_HOST_MISMATCH')
    })
  })

  describe('getRecaptchaConfig', () => {
    it('loads from platform_settings', async () => {
      const config = await getRecaptchaConfig()
      expect(config.enabled).toBe(true)
      expect(config.version).toBe('v3')
    })
  })
})
