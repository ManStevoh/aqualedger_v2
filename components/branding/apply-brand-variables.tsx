'use client'

import { useEffect } from 'react'
import type { BrandCssVars } from '@/lib/branding/theme-vars'

const STYLE_ID = 'tenant-brand-vars'

function applyVars(target: HTMLElement, vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value)
  }
}

function clearVars(target: HTMLElement, vars: Record<string, string>) {
  for (const key of Object.keys(vars)) {
    target.style.removeProperty(key)
  }
}

/**
 * Injects primary/sidebar CSS variable overrides on :root and .dark.
 * Reverts on unmount so global design tokens remain the default outside branded shells.
 */
export function ApplyBrandVariables({ cssVars }: { cssVars: BrandCssVars | null }) {
  useEffect(() => {
    if (!cssVars) return

    const root = document.documentElement
    const dark = document.documentElement.classList.contains('dark')
    applyVars(root, dark ? cssVars.dark : cssVars.light)

    const styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    const el =
      styleEl ??
      (() => {
        const s = document.createElement('style')
        s.id = STYLE_ID
        document.head.appendChild(s)
        return s
      })()

    const darkBlock = Object.entries(cssVars.dark)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')
    el.textContent = `.dark {\n${darkBlock}\n}`

    const observer = new MutationObserver(() => {
      const isDark = root.classList.contains('dark')
      clearVars(root, cssVars.light)
      clearVars(root, cssVars.dark)
      applyVars(root, isDark ? cssVars.dark : cssVars.light)
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
      clearVars(root, cssVars.light)
      clearVars(root, cssVars.dark)
      el.remove()
    }
  }, [cssVars])

  return null
}
