'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApplyBrandVariables } from '@/components/branding/apply-brand-variables'
import { envPlatformBranding } from '@/lib/branding/build-identity'
import { fetchPlatformBrandClient } from '@/lib/branding/fetch-platform-brand-client'
import type { BrandIdentity } from '@/lib/branding/types'

const fallback = envPlatformBranding()

const PlatformBrandContext = createContext<BrandIdentity>(fallback)

export function usePlatformBrand(): BrandIdentity {
  return useContext(PlatformBrandContext)
}

/** Public auth/marketing pages — platform logo & colors from settings or env */
export function PlatformBrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandIdentity>(fallback)

  useEffect(() => {
    let cancelled = false
    void fetchPlatformBrandClient().then((b) => {
      if (!cancelled) setBrand(b)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => brand, [brand])

  return (
    <PlatformBrandContext.Provider value={value}>
      <ApplyBrandVariables cssVars={brand.cssVars} />
      {children}
    </PlatformBrandContext.Provider>
  )
}
