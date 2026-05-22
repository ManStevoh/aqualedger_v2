'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApplyBrandVariables } from '@/components/branding/apply-brand-variables'
import { buildBrandIdentity } from '@/lib/branding/build-identity'
import { fetchPlatformBrandClient } from '@/lib/branding/fetch-platform-brand-client'
import type { BrandIdentity } from '@/lib/branding/types'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { APP_NAME } from '@/lib/constants'

const defaultBrand = buildBrandIdentity({ appName: APP_NAME })

type BrandContextValue = BrandIdentity & { refresh: () => Promise<void> }

const BrandContext = createContext<BrandContextValue>({
  ...defaultBrand,
  refresh: async () => {},
})

export function useBrand(): BrandContextValue {
  return useContext(BrandContext)
}

/** Loads tenant branding for authenticated dashboard sessions */
export function TenantBrandProvider({ children }: { children: ReactNode }) {
  const { currentUser, currentRole } = useAppStore()
  const [brand, setBrand] = useState<BrandIdentity>(defaultBrand)

  const load = useCallback(async () => {
    if (!currentUser) {
      setBrand(defaultBrand)
      return
    }
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: {
          tenant?: {
            name?: string
            logo_url?: string | null
            primary_color?: string | null
            settings?: { branding?: { logo_url?: string; primary_color?: string } }
          }
        }
      }>('/api/v2/tenant')

      if (!res.success || !res.data?.tenant) {
        setBrand(defaultBrand)
        return
      }

      const t = res.data.tenant
      const logoUrl =
        t.settings?.branding?.logo_url ?? t.logo_url ?? null
      const primaryColor =
        t.settings?.branding?.primary_color ?? t.primary_color ?? null

      if (logoUrl || primaryColor) {
        setBrand(
          buildBrandIdentity({
            appName: t.name || APP_NAME,
            logoUrl,
            primaryColor,
          }),
        )
        return
      }

      const platform = await fetchPlatformBrandClient()
      setBrand(
        buildBrandIdentity({
          appName: t.name || platform.appName,
          logoUrl: platform.logoUrl,
          primaryColor: platform.primaryColor,
        }),
      )
    } catch {
      setBrand(defaultBrand)
    }
  }, [currentUser])

  useEffect(() => {
    void load()
  }, [load, currentRole])

  const value = useMemo(
    () => ({ ...brand, refresh: load }),
    [brand, load],
  )

  return (
    <BrandContext.Provider value={value}>
      <ApplyBrandVariables cssVars={brand.cssVars} />
      {children}
    </BrandContext.Provider>
  )
}
