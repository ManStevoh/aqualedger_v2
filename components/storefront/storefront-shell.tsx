'use client'

import Link from 'next/link'
import { useState, useEffect, type ReactNode, type CSSProperties } from 'react'
import { Fish, ShoppingCart, Search, Menu, X, Shield, Star, Snowflake } from 'lucide-react'
import type { StorefrontTheme } from '@/lib/modules/commerce/storefront-themes'
import type { TenantStorefrontSettings } from '@/lib/modules/commerce/storefront-settings'
import { StorefrontCartButton } from './storefront-cart-button'

export interface StorefrontProduct {
  id: string
  name: string
  sku?: string
  price: number
  unit?: string
  category?: string
  imageUrl?: string
  grade?: string
  traceable?: boolean
}

export interface StorefrontShellProps {
  settings: TenantStorefrontSettings & { tenant_slug?: string; tenant_name?: string }
  theme: StorefrontTheme
  cssVars: Record<string, string>
  products?: StorefrontProduct[]
  children?: ReactNode
  storeBasePath: string
  storeSlug: string
}

export function StorefrontShell({
  settings,
  theme,
  cssVars,
  products = [],
  children,
  storeBasePath,
  storeSlug,
}: StorefrontShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cookieAccepted, setCookieAccepted] = useState(true)

  useEffect(() => {
    if (settings.cookie_banner_text) {
      setCookieAccepted(localStorage.getItem(`sf-cookie-${settings.tenant_id}`) === '1')
    }
  }, [settings.tenant_id, settings.cookie_banner_text])

  const acceptCookies = () => {
    localStorage.setItem(`sf-cookie-${settings.tenant_id}`, '1')
    setCookieAccepted(true)
  }

  const style = cssVars as CSSProperties
  const storeName = settings.store_name || settings.tenant_name || 'Seafood Store'
  const gridCols = theme.tokens.productGridCols

  const cardClass =
    theme.tokens.cardStyle === 'elevated'
      ? 'shadow-[var(--sf-shadow)] hover:shadow-lg transition-shadow'
      : theme.tokens.cardStyle === 'organic'
        ? 'rounded-[var(--sf-radius)] border-2'
        : theme.tokens.cardStyle === 'bordered'
          ? 'border-2 border-[var(--sf-border)]'
          : 'border border-[var(--sf-border)]'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        ...style,
        backgroundColor: 'var(--sf-bg)',
        color: 'var(--sf-text)',
        fontFamily: 'var(--sf-font-body)',
      }}
    >
      {/* Skip link — WCAG */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-[var(--sf-primary)] focus:text-[var(--sf-primary-fg)]"
      >
        Skip to main content
      </a>

      <header
        className="sticky top-0 z-50 border-b border-[var(--sf-border)] backdrop-blur-md"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sf-surface) 92%, transparent)' }}
        role="banner"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href={storeBasePath} className="flex items-center gap-2 font-semibold" style={{ fontFamily: 'var(--sf-font-heading)' }}>
            {settings.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt="" className="h-9 w-auto" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--sf-radius)] bg-[var(--sf-primary)] text-[var(--sf-primary-fg)]">
                <Fish className="h-5 w-5" aria-hidden />
              </div>
            )}
            <span>{storeName}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            <Link href={`${storeBasePath}#products`} className="text-sm hover:text-[var(--sf-primary)]">
              Products
            </Link>
            <Link href={`${storeBasePath}/traceability`} className="text-sm hover:text-[var(--sf-primary)]">
              Traceability
            </Link>
            <Link href={`${storeBasePath}/account`} className="text-sm hover:text-[var(--sf-primary)]">
              My orders
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="rounded-[var(--sf-radius)] p-2 hover:bg-[var(--sf-surface-alt)]" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link
              href={`${storeBasePath}/cart`}
              className="rounded-[var(--sf-radius)] p-2 hover:bg-[var(--sf-surface-alt)]"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="rounded-[var(--sf-radius)] p-2 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {theme.tokens.heroStyle === 'minimal' ? (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight md:text-5xl" style={{ fontFamily: 'var(--sf-font-heading)' }}>
            {settings.hero_headline || 'Premium seafood'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--sf-text-muted)]">{settings.hero_subheadline || settings.tagline}</p>
          <a
            href={settings.hero_cta_href || '#products'}
            className="mt-8 inline-flex min-h-[44px] items-center rounded-[var(--sf-radius)] px-8 py-3 text-sm font-semibold"
            style={{ backgroundColor: 'var(--sf-primary)', color: 'var(--sf-primary-fg)' }}
          >
            {settings.hero_cta_label || 'Shop now'}
          </a>
        </section>
      ) : (
        <section
          className="relative flex min-h-[320px] items-center md:min-h-[420px]"
          style={{
            background: settings.hero_image_url
              ? `linear-gradient(to right, color-mix(in srgb, var(--sf-primary) 85%, transparent), transparent), url(${settings.hero_image_url}) center/cover`
              : `linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))`,
          }}
          aria-labelledby="hero-heading"
        >
          <div className="relative mx-auto max-w-7xl px-4 py-16 text-white">
            <h1 id="hero-heading" className="max-w-2xl text-4xl font-bold md:text-5xl" style={{ fontFamily: 'var(--sf-font-heading)' }}>
              {settings.hero_headline || 'Fresh from the ocean'}
            </h1>
            <p className="mt-4 max-w-xl text-lg opacity-90">{settings.hero_subheadline || settings.tagline}</p>
            <a
              href={settings.hero_cta_href || '#products'}
              className="mt-8 inline-flex min-h-[44px] items-center rounded-[var(--sf-radius)] bg-white px-8 py-3 text-sm font-semibold text-[var(--sf-text)]"
            >
              {settings.hero_cta_label || 'Shop now'}
            </a>
          </div>
        </section>
      )}

      <main id="main-content" className="flex-1" role="main">
        {children}

        <section id="products" className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="products-heading">
          <h2 id="products-heading" className="text-2xl font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>
            Fresh products
          </h2>
          <p className="mt-1 text-[var(--sf-text-muted)]">Prices per kg · VAT may apply at checkout</p>

          <div
            className="mt-8 grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${Math.min(gridCols, 4)}, minmax(0, 1fr))`,
            }}
          >
            {products.length === 0 ? (
              <p className="col-span-full py-12 text-center text-[var(--sf-text-muted)]">Products coming soon.</p>
            ) : (
              products.map((p) => (
                <article
                  key={p.id}
                  className={`overflow-hidden bg-[var(--sf-surface)] ${cardClass}`}
                  style={{ borderRadius: 'var(--sf-radius)' }}
                >
                  <div className="aspect-[4/3] bg-[var(--sf-surface-alt)] flex items-center justify-center">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Fish className="h-12 w-12 text-[var(--sf-text-muted)] opacity-40" aria-hidden />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.grade && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--sf-surface-alt)]">Grade {p.grade}</span>
                      )}
                      {settings.show_traceability && p.traceable && (
                        <span className="text-xs flex items-center gap-1 text-[var(--sf-success)]">
                          <Shield className="h-3 w-3" /> Traced
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="mt-2 text-lg font-bold text-[var(--sf-primary)]">
                      KES {p.price.toLocaleString()}
                      <span className="text-sm font-normal text-[var(--sf-text-muted)]"> /{p.unit || 'kg'}</span>
                    </p>
                    <StorefrontCartButton
                      storeSlug={storeSlug}
                      productId={p.id}
                      productName={p.name}
                    />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--sf-border)] bg-[var(--sf-surface-alt)] py-10" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <p className="font-semibold">{storeName}</p>
            <p className="mt-2 text-[var(--sf-text-muted)]">{settings.footer_text || settings.tagline}</p>
          </div>
          <div>
            <p className="font-semibold">Legal</p>
            <ul className="mt-2 space-y-1 text-[var(--sf-text-muted)]">
              {settings.privacy_policy_url && <li><a href={settings.privacy_policy_url} className="hover:underline">Privacy Policy</a></li>}
              {settings.terms_url && <li><a href={settings.terms_url} className="hover:underline">Terms & Returns</a></li>}
              <li><a href={`${storeBasePath}/traceability`} className="hover:underline">Traceability</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Trust</p>
            <ul className="mt-2 space-y-1 text-[var(--sf-text-muted)]">
              <li className="flex items-center gap-1"><Snowflake className="h-4 w-4" /> Cold-chain certified</li>
              <li className="flex items-center gap-1"><Shield className="h-4 w-4" /> EU fisheries traceability</li>
              {settings.show_reviews && <li className="flex items-center gap-1"><Star className="h-4 w-4" /> Verified reviews</li>}
            </ul>
          </div>
        </div>
        <p className="mx-auto max-w-7xl px-4 mt-8 text-center text-xs text-[var(--sf-text-muted)]">
          Powered by AquaERP · PCI-compliant payments · WCAG {theme.wcagLevel}
        </p>
      </footer>

      {!cookieAccepted && settings.cookie_banner_text && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] border-t p-4 md:flex md:items-center md:justify-between md:gap-4"
          style={{ backgroundColor: 'var(--sf-surface)', borderColor: 'var(--sf-border)' }}
          role="dialog"
          aria-label="Cookie consent"
        >
          <p className="text-sm flex-1">{settings.cookie_banner_text}</p>
          <button
            type="button"
            onClick={acceptCookies}
            className="mt-3 md:mt-0 min-h-[44px] shrink-0 rounded-[var(--sf-radius)] px-6 py-2 text-sm font-medium"
            style={{ backgroundColor: 'var(--sf-primary)', color: 'var(--sf-primary-fg)' }}
          >
            Accept
          </button>
        </div>
      )}
    </div>
  )
}
