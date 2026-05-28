'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react'
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
  searchTerm?: string
  selectedCategory?: string
  onClearFilters?: () => void
  categories?: string[]
  onCategoryChange?: (val: string) => void
  onSearchChange?: (val: string) => void
  getCategoryCount?: (cat: string) => number
  hideHeroAndProducts?: boolean
}

export function StorefrontShell({
  settings,
  theme,
  cssVars,
  products = [],
  children,
  storeBasePath,
  storeSlug,
  searchTerm,
  selectedCategory,
  onClearFilters,
  categories = [],
  onCategoryChange,
  onSearchChange,
  getCategoryCount,
  hideHeroAndProducts = false,
}: StorefrontShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cookieAccepted, setCookieAccepted] = useState(true)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [customer, setCustomer] = useState<{ firstName: string; lastName: string; email: string } | null>(null)

  useEffect(() => {
    fetch(`/api/public/store/${storeSlug}/auth/me`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.authenticated) {
          setCustomer(data.data.user)
        } else {
          setCustomer(null)
        }
      })
      .catch(() => {
        setCustomer(null)
      })
  }, [storeSlug])

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchExpanded) return

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchExpanded])

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
        className="sticky top-0 z-50 border-b border-[var(--sf-border)]/60 backdrop-blur-md shadow-sm transition-all duration-300"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sf-surface) 95%, transparent)' }}
        role="banner"
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 animate-all duration-300">
          <Link
            href={storeBasePath}
            className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.01] shrink-0"
            style={{ fontFamily: 'var(--sf-font-heading)' }}
          >
            {settings.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt="" className="h-10 w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--sf-radius)] bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] shadow-sm transition-all duration-500 group-hover:rotate-12">
                <Fish className="h-5 w-5" aria-hidden />
              </div>
            )}
            <span className="font-extrabold tracking-tight text-base md:text-lg transition-colors duration-300 group-hover:text-[var(--sf-primary)]">
              {storeName}
            </span>
          </Link>

          {!searchExpanded && (
            <nav className="hidden items-center gap-8 md:flex animate-in fade-in duration-300" aria-label="Main">
              <Link
                href={`${storeBasePath}#products`}
                className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[var(--sf-primary)] after:transition-all after:duration-300"
              >
                Products
              </Link>
              <Link
                href={`${storeBasePath}/traceability`}
                className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[var(--sf-primary)] after:transition-all after:duration-300"
              >
                Traceability
              </Link>
              <Link
                href={`${storeBasePath}/account`}
                className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[var(--sf-primary)] after:transition-all after:duration-300"
              >
                My orders
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            <div ref={searchRef} className="relative flex items-center">
              {searchExpanded ? (
                <div className="relative flex items-center w-40 sm:w-64 md:w-80 animate-in slide-in-from-right duration-300">
                  <Search className="absolute left-3.5 h-4 w-4 text-[var(--sf-text-muted)] opacity-60 pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-full border border-[var(--sf-border)] bg-[var(--sf-bg)] pl-10 pr-9 py-1.5 text-xs shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)]/20 focus:border-[var(--sf-primary)]"
                    value={searchTerm || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange?.('')
                      setSearchExpanded(false)
                    }}
                    className="absolute right-2.5 p-1 text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] rounded-full hover:bg-[var(--sf-surface-alt)] transition-all cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  className="rounded-full p-2.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] hover:bg-[var(--sf-primary)]/10 transition-all duration-300 cursor-pointer"
                  aria-label="Expand search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            <Link
              href={`${storeBasePath}/cart`}
              className="rounded-full p-2.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] hover:bg-[var(--sf-primary)]/10 transition-all duration-300 relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>

            {customer ? (
              <Link
                href={`${storeBasePath}/account`}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--sf-text-muted)] border border-[var(--sf-border)]/50 hover:text-[var(--sf-primary)] hover:border-[var(--sf-primary)]/40 transition-all duration-300 shrink-0"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sf-primary)]/10 text-[var(--sf-primary)] text-[10px] font-extrabold uppercase">
                  {customer.firstName[0]}
                </div>
                <span className="hidden sm:inline">Hi, {customer.firstName}</span>
              </Link>
            ) : (
              <Link
                href={`${storeBasePath}/login`}
                className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-[var(--sf-primary)] border border-[var(--sf-primary)]/30 bg-[var(--sf-primary)]/5 hover:bg-[var(--sf-primary)] hover:text-white transition-all duration-300 shrink-0 cursor-pointer"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              className="rounded-full p-2.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] hover:bg-[var(--sf-primary)]/10 transition-all duration-300 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation menu */}
      {menuOpen && (
        <div
          className="md:hidden border-b border-[var(--sf-border)] bg-[var(--sf-surface)] px-6 py-5 space-y-4 flex flex-col shadow-lg animate-in slide-in-from-top duration-300"
          style={{ backgroundColor: 'var(--sf-surface)' }}
        >
          <Link
            href={`${storeBasePath}#products`}
            onClick={() => setMenuOpen(false)}
            className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2 border-b border-[var(--sf-border)]/40 transition-colors"
          >
            Products
          </Link>
          <Link
            href={`${storeBasePath}/traceability`}
            onClick={() => setMenuOpen(false)}
            className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2 border-b border-[var(--sf-border)]/40 transition-colors"
          >
            Traceability
          </Link>
          <Link
            href={`${storeBasePath}/account`}
            onClick={() => setMenuOpen(false)}
            className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2 border-b border-[var(--sf-border)]/40 transition-colors"
          >
            My orders
          </Link>
          {!customer ? (
            <Link
              href={`${storeBasePath}/login`}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-primary)] py-2 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          ) : (
            <Link
              href={`${storeBasePath}/account`}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2 transition-colors flex items-center gap-2"
            >
              <span>Account ({customer.firstName})</span>
            </Link>
          )}
        </div>
      )}

      {/* Hero */}
      {!hideHeroAndProducts && (settings.hero_image_url ? (
        <section
          className="relative flex items-center w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[260px] md:min-h-[420px] overflow-hidden"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, var(--sf-primary) 85%, transparent), transparent), url(${settings.hero_image_url}) center/cover no-repeat`,
          }}
          aria-labelledby="hero-heading"
        >
          <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-16 text-white w-full">
            <h1 id="hero-heading" className="max-w-2xl text-2xl sm:text-4xl font-bold md:text-5xl tracking-tight leading-tight" style={{ fontFamily: 'var(--sf-font-heading)' }}>
              {settings.hero_headline || 'Fresh from the ocean'}
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-lg opacity-90 line-clamp-3 leading-relaxed">{settings.hero_subheadline || settings.tagline}</p>
            <a
              href={settings.hero_cta_href || '#products'}
              className="mt-6 inline-flex min-h-[40px] sm:min-h-[44px] items-center rounded-[var(--sf-radius)] bg-white px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-semibold text-[var(--sf-text)] hover:bg-opacity-95 transition-all shadow-md"
            >
              {settings.hero_cta_label || 'Shop now'}
            </a>
          </div>
        </section>
      ) : theme.tokens.heroStyle === 'minimal' ? (
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
          className="relative flex min-h-[320px] items-center md:min-h-[420px] w-full"
          style={{
            background: `linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))`,
          }}
          aria-labelledby="hero-heading"
        >
          <div className="relative mx-auto max-w-7xl px-4 py-16 text-white w-full">
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
      ))}

      <main id="main-content" className="flex-1" role="main">
        {children}

        {/* Premium Trust Proposition Grid & Products Catalog */}
        {!hideHeroAndProducts && (
          <>
            <section id="products" className="mx-auto max-w-7xl px-4 py-16" aria-labelledby="products-heading">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--sf-border)]/40 pb-6 mb-8">
            <div>
              <h2 id="products-heading" className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--sf-font-heading)' }}>
                Fresh products
              </h2>
              <p className="mt-1.5 text-sm text-[var(--sf-text-muted)]">Prices per kg · VAT may apply at checkout</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/30 shrink-0 w-fit">
              🟢 Live stock status active
            </span>
          </div>

          {/* Premium Category Filter Pills with Dynamic Counts (Non-sticky, inline!) */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[var(--sf-border)]/20 scrollbar-none">
              <button
                onClick={() => onCategoryChange?.('')}
                className={`px-4 py-2 min-h-[38px] text-[11px] font-bold tracking-wider uppercase rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  selectedCategory === ''
                    ? 'bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] border-[var(--sf-primary)] shadow-sm'
                    : 'bg-[var(--sf-surface)] text-[var(--sf-text-muted)] border-[var(--sf-border)] hover:bg-[var(--sf-surface-alt)] hover:text-[var(--sf-text)]'
                }`}
              >
                <span>All Seafood</span>
                {getCategoryCount && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    selectedCategory === ''
                      ? 'bg-[var(--sf-primary-fg)]/20 text-[var(--sf-primary-fg)]'
                      : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-muted)]'
                  }`}>
                    {getCategoryCount('')}
                  </span>
                )}
              </button>
              {categories.map((c) => {
                const count = getCategoryCount ? getCategoryCount(c) : 0
                return (
                  <button
                    key={c}
                    onClick={() => onCategoryChange?.(c)}
                    className={`px-4 py-2 min-h-[38px] text-[11px] font-bold tracking-wider uppercase rounded-full border transition-all duration-300 capitalize cursor-pointer flex items-center gap-2 ${
                      selectedCategory === c
                        ? 'bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] border-[var(--sf-primary)] shadow-sm'
                        : 'bg-[var(--sf-surface)] text-[var(--sf-text-muted)] border-[var(--sf-border)] hover:bg-[var(--sf-surface-alt)] hover:text-[var(--sf-text)]'
                    }`}
                  >
                    <span>{c}</span>
                    {getCategoryCount && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        selectedCategory === c
                          ? 'bg-[var(--sf-primary-fg)]/20 text-[var(--sf-primary-fg)]'
                          : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-muted)]'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: `repeat(${Math.min(gridCols, 4)}, minmax(0, 1fr))`,
            }}
          >
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-[var(--sf-surface-alt)]/10 rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-border)]/80 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sf-primary)]/10 text-[var(--sf-primary)] shadow-sm animate-pulse mb-4">
                  <Search className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="text-xl font-bold tracking-tight">No premium seafood found</h3>
                <p className="mt-2 text-sm text-[var(--sf-text-muted)] max-w-md leading-relaxed">
                  {searchTerm || selectedCategory
                    ? `We couldn't find any products matching "${searchTerm || selectedCategory}". Try checking your spelling or clearing filters.`
                    : "We don't have any products available at the moment. Please check back later."}
                </p>
                {(searchTerm || selectedCategory) && onClearFilters && (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[var(--sf-primary)] px-6 py-2.5 text-xs font-bold tracking-wider uppercase text-[var(--sf-primary-fg)] hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Clear search & filters
                  </button>
                )}
              </div>
            ) : (
              products.map((p) => (
                <article
                  key={p.id}
                  className={`group overflow-hidden bg-[var(--sf-surface)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${cardClass}`}
                  style={{ borderRadius: 'var(--sf-radius)' }}
                >
                  <Link
                    href={`${storeBasePath}/product/${p.id}`}
                    className="block aspect-[4/3] bg-[var(--sf-surface-alt)] flex items-center justify-center overflow-hidden relative"
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-tr from-[var(--sf-surface-alt)] to-[var(--sf-surface)]">
                        <Fish className="h-12 w-12 text-[var(--sf-text-muted)] opacity-40 group-hover:scale-110 transition-transform duration-500" aria-hidden />
                      </div>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col justify-between h-[180px]">
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {p.grade && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/30">
                            Grade {p.grade}
                          </span>
                        )}
                        {settings.show_traceability && p.traceable && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 text-[var(--sf-success)]">
                            <Shield className="h-3 w-3" /> Traced
                          </span>
                        )}
                      </div>
                      <Link href={`${storeBasePath}/product/${p.id}`} className="font-bold text-lg tracking-tight hover:text-[var(--sf-primary)] block line-clamp-1">
                        {p.name}
                      </Link>
                      <p className="mt-1.5 text-xl font-extrabold text-[var(--sf-primary)]">
                        KES {p.price.toLocaleString()}
                        <span className="text-xs font-normal text-[var(--sf-text-muted)]"> /{p.unit || 'kg'}</span>
                      </p>
                    </div>
                    <div className="pt-2">
                      <StorefrontCartButton
                        storeSlug={storeSlug}
                        productId={p.id}
                        productName={p.name}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
          </>
        )}
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
