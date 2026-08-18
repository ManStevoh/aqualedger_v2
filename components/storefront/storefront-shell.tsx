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

  // Mobile-safe pointer listener: delayed registration prevents synthetic touch events from auto-closing search
  useEffect(() => {
    if (!searchExpanded) return

    let cleanup: (() => void) | undefined
    const timer = setTimeout(() => {
      const handleClickOutside = (event: Event) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setSearchExpanded(false)
        }
      }
      document.addEventListener('pointerdown', handleClickOutside)
      cleanup = () => document.removeEventListener('pointerdown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (cleanup) cleanup()
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

      {/* Full-Width Top Search Overlay Bar */}
      {searchExpanded && (
        <div
          ref={searchRef}
          className="fixed top-0 left-0 right-0 z-[70] border-b border-[var(--sf-border)] px-4 py-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-200"
          style={{ backgroundColor: 'var(--sf-surface)' }}
        >
          <Search className="h-5 w-5 text-[var(--sf-text-muted)] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search fresh catches, products, categories…"
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-[var(--sf-text)] focus:outline-none placeholder:text-[var(--sf-text-muted)]"
            value={searchTerm || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--sf-surface-alt)] text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setSearchExpanded(false)}
            className="p-1.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] rounded-full hover:bg-[var(--sf-surface-alt)] transition-all cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Header Container with Sticky Positioning */}
      <header
        className="sticky top-0 z-50 border-b border-[var(--sf-border)]/60 backdrop-blur-md shadow-sm transition-all duration-300"
        style={{ backgroundColor: 'color-mix(in srgb, var(--sf-surface) 95%, transparent)' }}
        role="banner"
      >
        <div className="mx-auto flex h-16 md:h-[72px] max-w-7xl items-center justify-between px-3 sm:px-4">
          <Link
            href={storeBasePath}
            className="flex items-center gap-2 sm:gap-3 group transition-transform duration-300 hover:scale-[1.01] shrink-0 min-w-0"
            style={{ fontFamily: 'var(--sf-font-heading)' }}
          >
            {settings.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logo_url}
                alt=""
                className="h-8 w-auto sm:h-10 object-contain transition-transform group-hover:scale-105 duration-300 shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[var(--sf-radius)] bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] shadow-sm transition-all duration-500 group-hover:rotate-12 shrink-0">
                <Fish className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </div>
            )}
            <span className="font-extrabold tracking-tight text-sm sm:text-base md:text-lg line-clamp-1 max-w-[130px] sm:max-w-none transition-colors duration-300 group-hover:text-[var(--sf-primary)]">
              {storeName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 animate-in fade-in duration-300" aria-label="Main">
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

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchExpanded(true)}
              className="rounded-full p-2 sm:p-2.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] hover:bg-[var(--sf-primary)]/10 transition-all duration-300 cursor-pointer shrink-0"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href={`${storeBasePath}/cart`}
              className="rounded-full p-2 sm:p-2.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] hover:bg-[var(--sf-primary)]/10 transition-all duration-300 relative shrink-0"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>

            {customer ? (
              <Link
                href={`${storeBasePath}/account`}
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--sf-text-muted)] border border-[var(--sf-border)]/50 hover:text-[var(--sf-primary)] hover:border-[var(--sf-primary)]/40 transition-all duration-300 shrink-0"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sf-primary)]/10 text-[var(--sf-primary)] text-[10px] font-extrabold uppercase">
                  {customer.firstName[0]}
                </div>
                <span>Hi, {customer.firstName}</span>
              </Link>
            ) : (
              <Link
                href={`${storeBasePath}/login`}
                className="hidden sm:flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-[var(--sf-primary)] border border-[var(--sf-primary)]/30 bg-[var(--sf-primary)]/5 hover:bg-[var(--sf-primary)] hover:text-white transition-all duration-300 shrink-0 cursor-pointer"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              className="rounded-full p-2 sm:p-2.5 text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] hover:bg-[var(--sf-primary)]/10 transition-all duration-300 md:hidden shrink-0 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sheet Drawer — INSIDE sticky header container */}
        {menuOpen && (
          <div
            className="md:hidden border-t border-[var(--sf-border)]/50 bg-[var(--sf-surface)] px-5 py-4 space-y-3 flex flex-col shadow-2xl animate-in slide-in-from-top duration-200"
            style={{ backgroundColor: 'var(--sf-surface)' }}
          >
            <Link
              href={`${storeBasePath}#products`}
              onClick={() => setMenuOpen(false)}
              className="text-xs font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2.5 border-b border-[var(--sf-border)]/30 transition-colors flex items-center justify-between"
            >
              <span>Products</span>
              <span className="text-[10px] font-normal text-[var(--sf-text-muted)]">Catalog</span>
            </Link>
            <Link
              href={`${storeBasePath}/traceability`}
              onClick={() => setMenuOpen(false)}
              className="text-xs font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2.5 border-b border-[var(--sf-border)]/30 transition-colors flex items-center justify-between"
            >
              <span>Traceability</span>
              <span className="text-[10px] font-normal text-[var(--sf-text-muted)]">Catch Logs</span>
            </Link>
            <Link
              href={`${storeBasePath}/account`}
              onClick={() => setMenuOpen(false)}
              className="text-xs font-bold tracking-wider uppercase text-[var(--sf-text)] hover:text-[var(--sf-primary)] py-2.5 border-b border-[var(--sf-border)]/30 transition-colors flex items-center justify-between"
            >
              <span>My Orders</span>
              <span className="text-[10px] font-normal text-[var(--sf-text-muted)]">Order History</span>
            </Link>

            {!customer ? (
              <Link
                href={`${storeBasePath}/login`}
                onClick={() => setMenuOpen(false)}
                className="mt-2 text-center text-xs font-bold tracking-wider uppercase text-white bg-[var(--sf-primary)] py-3 rounded-full shadow-sm transition-all cursor-pointer"
              >
                Sign In to Account
              </Link>
            ) : (
              <Link
                href={`${storeBasePath}/account`}
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-between p-3 rounded-xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/40 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sf-primary)] text-white text-[10px] uppercase font-bold">
                    {customer.firstName[0]}
                  </div>
                  <span>{customer.firstName} {customer.lastName}</span>
                </div>
                <span className="text-[10px] text-[var(--sf-primary)]">Manage</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Hero Banner */}
      {!hideHeroAndProducts && (settings.hero_image_url ? (
        <section
          className="relative flex items-center w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[220px] sm:min-h-[320px] md:min-h-[420px] overflow-hidden"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, var(--sf-primary) 85%, transparent), transparent), url(${settings.hero_image_url}) center/cover no-repeat`,
          }}
          aria-labelledby="hero-heading"
        >
          <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-12 md:py-16 text-white w-full">
            <h1 id="hero-heading" className="max-w-2xl text-xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--sf-font-heading)' }}>
              {settings.hero_headline || 'Fresh from the ocean'}
            </h1>
            <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-base md:text-lg opacity-90 line-clamp-2 leading-relaxed">
              {settings.hero_subheadline || settings.tagline}
            </p>
            <a
              href={settings.hero_cta_href || '#products'}
              className="mt-4 sm:mt-6 inline-flex min-h-[38px] sm:min-h-[44px] items-center rounded-[var(--sf-radius)] bg-white px-5 sm:px-8 py-2 text-xs sm:text-sm font-semibold text-[var(--sf-text)] hover:bg-opacity-95 transition-all shadow-md"
            >
              {settings.hero_cta_label || 'Shop now'}
            </a>
          </div>
        </section>
      ) : theme.tokens.heroStyle === 'minimal' ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 text-center" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-2xl sm:text-4xl font-bold tracking-tight md:text-5xl" style={{ fontFamily: 'var(--sf-font-heading)' }}>
            {settings.hero_headline || 'Premium seafood'}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-lg text-[var(--sf-text-muted)]">
            {settings.hero_subheadline || settings.tagline}
          </p>
          <a
            href={settings.hero_cta_href || '#products'}
            className="mt-6 inline-flex min-h-[42px] items-center rounded-[var(--sf-radius)] px-6 py-2.5 text-xs sm:text-sm font-semibold"
            style={{ backgroundColor: 'var(--sf-primary)', color: 'var(--sf-primary-fg)' }}
          >
            {settings.hero_cta_label || 'Shop now'}
          </a>
        </section>
      ) : (
        <section
          className="relative flex min-h-[260px] sm:min-h-[320px] md:min-h-[420px] items-center w-full"
          style={{
            background: `linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))`,
          }}
          aria-labelledby="hero-heading"
        >
          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-16 text-white w-full">
            <h1 id="hero-heading" className="max-w-2xl text-2xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>
              {settings.hero_headline || 'Fresh from the ocean'}
            </h1>
            <p className="mt-3 max-w-xl text-xs sm:text-lg opacity-90 line-clamp-2">{settings.hero_subheadline || settings.tagline}</p>
            <a
              href={settings.hero_cta_href || '#products'}
              className="mt-6 inline-flex min-h-[40px] items-center rounded-[var(--sf-radius)] bg-white px-6 py-2.5 text-xs sm:text-sm font-semibold text-[var(--sf-text)]"
            >
              {settings.hero_cta_label || 'Shop now'}
            </a>
          </div>
        </section>
      ))}

      <main id="main-content" className="flex-1" role="main">
        {children}

        {/* Catalog Section */}
        {!hideHeroAndProducts && (
          <section id="products" className="mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-16" aria-labelledby="products-heading">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--sf-border)]/40 pb-4 mb-6">
              <div>
                <h2 id="products-heading" className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--sf-font-heading)' }}>
                  Fresh products
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--sf-text-muted)]">Prices per kg · VAT may apply at checkout</p>
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/30 shrink-0 w-fit">
                🟢 Live stock status active
              </span>
            </div>

            {/* Mobile Touch Horizontal Category Filter Carousel */}
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[var(--sf-border)]/20 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
                <button
                  onClick={() => onCategoryChange?.('')}
                  className={`px-4 py-2 min-h-[38px] text-[11px] font-bold tracking-wider uppercase rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedCategory === ''
                      ? 'bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] border-[var(--sf-primary)] shadow-sm'
                      : 'bg-[var(--sf-surface)] text-[var(--sf-text-muted)] border-[var(--sf-border)] hover:bg-[var(--sf-surface-alt)] hover:text-[var(--sf-text)]'
                  }`}
                >
                  <span>All Seafood</span>
                  {getCategoryCount && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        selectedCategory === ''
                          ? 'bg-[var(--sf-primary-fg)]/20 text-[var(--sf-primary-fg)]'
                          : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-muted)]'
                      }`}
                    >
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
                      className={`px-4 py-2 min-h-[38px] text-[11px] font-bold tracking-wider uppercase rounded-full border transition-all duration-300 capitalize cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        selectedCategory === c
                          ? 'bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] border-[var(--sf-primary)] shadow-sm'
                          : 'bg-[var(--sf-surface)] text-[var(--sf-text-muted)] border-[var(--sf-border)] hover:bg-[var(--sf-surface-alt)] hover:text-[var(--sf-text)]'
                      }`}
                    >
                      <span>{c}</span>
                      {getCategoryCount && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                            selectedCategory === c
                              ? 'bg-[var(--sf-primary-fg)]/20 text-[var(--sf-primary-fg)]'
                              : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-muted)]'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 2-Card Mobile Product Grid (grid-cols-2 on mobile, grid-cols-4 on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.length === 0 ? (
                <div className="col-span-full py-16 text-center flex flex-col items-center justify-center bg-[var(--sf-surface-alt)]/10 rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-border)]/80 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sf-primary)]/10 text-[var(--sf-primary)] shadow-sm animate-pulse mb-3">
                    <Search className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">No seafood found</h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--sf-text-muted)] max-w-md leading-relaxed">
                    {searchTerm || selectedCategory
                      ? `We couldn't find any products matching "${searchTerm || selectedCategory}". Try clearing your filters.`
                      : 'No products are currently available.'}
                  </p>
                  {(searchTerm || selectedCategory) && onClearFilters && (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="mt-5 inline-flex min-h-[40px] items-center rounded-full bg-[var(--sf-primary)] px-5 py-2 text-xs font-bold tracking-wider uppercase text-[var(--sf-primary-fg)] hover:opacity-90 transition-all shadow-md cursor-pointer"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                products.map((p) => (
                  <article
                    key={p.id}
                    className={`group overflow-hidden bg-[var(--sf-surface)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${cardClass}`}
                    style={{ borderRadius: 'var(--sf-radius)' }}
                  >
                    <Link
                      href={`${storeBasePath}/product/${p.id}`}
                      className="block aspect-[4/3] bg-[var(--sf-surface-alt)] relative overflow-hidden shrink-0"
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-tr from-[var(--sf-surface-alt)] to-[var(--sf-surface)]">
                          <Fish
                            className="h-8 w-8 sm:h-12 sm:w-12 text-[var(--sf-text-muted)] opacity-40 group-hover:scale-110 transition-transform duration-500"
                            aria-hidden
                          />
                        </div>
                      )}
                    </Link>

                    <div className="p-3 sm:p-5 flex flex-col justify-between flex-1 space-y-2.5">
                      <div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {p.grade && (
                            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/30">
                              Grade {p.grade}
                            </span>
                          )}
                          {settings.show_traceability && p.traceable && (
                            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase flex items-center gap-0.5 text-[var(--sf-success)]">
                              <Shield className="h-3 w-3" /> Traced
                            </span>
                          )}
                        </div>

                        <Link
                          href={`${storeBasePath}/product/${p.id}`}
                          className="font-bold text-xs sm:text-base tracking-tight hover:text-[var(--sf-primary)] block line-clamp-2 leading-snug"
                        >
                          {p.name}
                        </Link>

                        <p className="mt-1.5 text-sm sm:text-xl font-extrabold text-[var(--sf-primary)]">
                          KES {p.price.toLocaleString()}
                          <span className="text-[10px] sm:text-xs font-normal text-[var(--sf-text-muted)]">
                            {' '}
                            /{p.unit || 'kg'}
                          </span>
                        </p>
                      </div>

                      <div className="pt-1">
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
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-[var(--sf-border)] bg-[var(--sf-surface-alt)] py-8 sm:py-12"
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3 text-xs sm:text-sm">
          <div>
            <p className="font-semibold text-sm sm:text-base">{storeName}</p>
            <p className="mt-1.5 text-[var(--sf-text-muted)] leading-relaxed">
              {settings.footer_text || settings.tagline}
            </p>
          </div>
          <div>
            <p className="font-semibold">Legal & Traceability</p>
            <ul className="mt-2 space-y-1.5 text-[var(--sf-text-muted)]">
              {settings.privacy_policy_url && (
                <li>
                  <a href={settings.privacy_policy_url} className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
              )}
              {settings.terms_url && (
                <li>
                  <a href={settings.terms_url} className="hover:underline">
                    Terms & Returns
                  </a>
                </li>
              )}
              <li>
                <a href={`${storeBasePath}/traceability`} className="hover:underline">
                  Catch Traceability Logs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Trust & Standards</p>
            <ul className="mt-2 space-y-1.5 text-[var(--sf-text-muted)]">
              <li className="flex items-center gap-1.5">
                <Snowflake className="h-4 w-4 text-sky-500 shrink-0" /> Cold-chain certified (0-4°C)
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0" /> EU fisheries compliance
              </li>
              {settings.show_reviews && (
                <li className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 shrink-0" /> Verified buyer reviews
                </li>
              )}
            </ul>
          </div>
        </div>
        <p className="mx-auto max-w-7xl px-4 mt-8 text-center text-[11px] text-[var(--sf-text-muted)]">
          Powered by AquaERP · PCI-DSS compliant payments · WCAG {theme.wcagLevel}
        </p>
      </footer>

      {!cookieAccepted && settings.cookie_banner_text && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] border-t p-4 md:flex md:items-center md:justify-between md:gap-4 shadow-xl"
          style={{ backgroundColor: 'var(--sf-surface)', borderColor: 'var(--sf-border)' }}
          role="dialog"
          aria-label="Cookie consent"
        >
          <p className="text-xs sm:text-sm flex-1">{settings.cookie_banner_text}</p>
          <button
            type="button"
            onClick={acceptCookies}
            className="mt-3 md:mt-0 min-h-[40px] shrink-0 rounded-[var(--sf-radius)] px-6 py-2 text-xs font-semibold"
            style={{ backgroundColor: 'var(--sf-primary)', color: 'var(--sf-primary-fg)' }}
          >
            Accept
          </button>
        </div>
      )}
    </div>
  )
}
