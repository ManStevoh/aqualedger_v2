'use client'

import { Fish } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrand } from '@/components/branding/brand-provider'
import type { BrandIdentity } from '@/lib/branding/types'

export function BrandMark({
  size = 'md',
  className,
  brand: brandOverride,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  brand?: BrandIdentity
}) {
  const ctx = useBrand()
  const brand = brandOverride ?? ctx
  const box =
    size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const icon =
    size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  if (brand.logoUrl) {
    return (
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60',
          box,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- tenant-provided arbitrary URLs */}
        <img
          src={brand.logoUrl}
          alt=""
          className="h-full w-full object-contain p-1"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        `flex ${box} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/25 transition-transform`,
        className,
      )}
    >
      <Fish className={`${icon} text-primary-foreground`} aria-hidden />
    </div>
  )
}
