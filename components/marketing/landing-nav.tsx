'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/branding/brand-mark'
import { usePlatformBrand } from '@/components/branding/platform-brand-provider'

const NAV_LINKS = [
  { label: 'Product', href: '#modules' },
  { label: 'AI', href: '#ai' },
  { label: 'Industries', href: '#industries' },
  { label: 'Security', href: '#trust' },
  { label: 'Resources', href: '#vision' },
] as const

export function LandingNav() {
  const brand = usePlatformBrand()
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
          <BrandMark size="sm" brand={brand} />
          <span className="hidden sm:inline">{brand.appName}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
