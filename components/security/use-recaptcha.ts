'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PublicRecaptchaConfig } from '@/lib/modules/security/recaptcha'

export type RecaptchaClientAction = 'login' | 'register' | 'guest_checkout'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark'
        },
      ) => number
      reset: (widgetId?: number) => void
    }
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      if ((existing as HTMLScriptElement).dataset.loaded === '1') resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => {
      script.dataset.loaded = '1'
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(script)
  })
}

export function useRecaptcha(action: RecaptchaClientAction) {
  const [config, setConfig] = useState<PublicRecaptchaConfig | null>(null)
  const [ready, setReady] = useState(false)
  const [v2Token, setV2Token] = useState<string | null>(null)
  const v2ContainerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<number | null>(null)

  const active =
    config?.enabled &&
    ((action === 'login' && config.protectLogin) ||
      (action === 'register' && config.protectRegister) ||
      (action === 'guest_checkout' && config.protectGuestCheckout))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/public/recaptcha/config', { cache: 'no-store' })
        const json = (await res.json()) as {
          success?: boolean
          data?: { recaptcha: PublicRecaptchaConfig | null }
        }
        if (cancelled) return
        setConfig(json.data?.recaptcha ?? null)
      } catch {
        if (!cancelled) setConfig(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!active || !config?.siteKey) {
      setReady(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        if (config.version === 'v3') {
          await loadScript(`https://www.google.com/recaptcha/api.js?render=${config.siteKey}`)
        } else {
          await loadScript('https://www.google.com/recaptcha/api.js')
        }
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setReady(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [active, config?.siteKey, config?.version])

  useEffect(() => {
    if (!active || !ready || config?.version !== 'v2_checkbox' || !v2ContainerRef.current) {
      return
    }
    if (!window.grecaptcha) return

    window.grecaptcha.ready(() => {
      if (!v2ContainerRef.current || widgetIdRef.current != null) return
      widgetIdRef.current = window.grecaptcha!.render(v2ContainerRef.current, {
        sitekey: config.siteKey,
        theme: 'dark',
        callback: (token: string) => setV2Token(token),
        'expired-callback': () => setV2Token(null),
      })
    })
  }, [active, ready, config?.version, config?.siteKey])

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!active || !config?.siteKey || !window.grecaptcha) return undefined

    if (config.version === 'v2_checkbox') {
      return v2Token ?? undefined
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(config.siteKey, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }, [active, config, action, v2Token])

  const reset = useCallback(() => {
    setV2Token(null)
    if (widgetIdRef.current != null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current)
    }
  }, [])

  return {
    active: Boolean(active),
    config,
    ready,
    getToken,
    reset,
    v2ContainerRef,
    isV2: config?.version === 'v2_checkbox',
  }
}
