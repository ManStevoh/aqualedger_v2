'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'

const LG_BREAKPOINT = 1024

export function useIsLgUp(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`).matches
}

/** Mobile-first sidebar: closed on small screens, open on lg+; closes on route change. */
export function useResponsiveShell() {
  const pathname = usePathname()
  const { setSidebarOpen } = useAppStore()

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const apply = () => setSidebarOpen(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [setSidebarOpen])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    if (!mq.matches) {
      setSidebarOpen(false)
    }
  }, [pathname, setSidebarOpen])
}
