# AquaERP E-Commerce — Global Standards & Feature Research

Reference frameworks: **WCAG 2.2**, **GDPR/ePrivacy**, **PCI DSS SAQ A**, **PSD2/SCA**, **ISO 12812** (mobile payments), **GS1** product IDs, **Schema.org** Product/Offer, **APCA/W3C** contrast, **Shopify UX**, **Baymard Institute** checkout research, **EU Consumer Rights Directive**, **ADA Title III** (US accessibility).

---

## 1. Core storefront features (must-have)

| Category | Features | Global standard |
|----------|----------|-----------------|
| **Catalog** | Categories, variants (weight/grade), SKU, HS code, allergens, origin, shelf-life | GS1, EU food labeling |
| **Discovery** | Search, filters (species, price, fresh/frozen), sort, breadcrumbs | Baymard navigation |
| **Product page** | Gallery, nutrition/traceability, reviews, stock, unit pricing (per kg) | Schema.org Product |
| **Cart** | Persistent cart, qty by weight, min order, save for later | PCI — no card in cart |
| **Checkout** | Guest + account, address, delivery slots, tax breakdown, coupon | PSD2 SCA for cards |
| **Payments** | M-Pesa STK, cards (Stripe), COD, bank transfer | PCI DSS tokenization |
| **Orders** | Confirmation email/SMS, tracking, returns window | Consumer rights 14-day EU |
| **Trust** | SSL, privacy policy, cookie consent, refund policy | GDPR Art. 6/7/13 |
| **Accessibility** | Keyboard nav, focus rings, alt text, 44px touch targets | WCAG 2.2 AA |
| **Performance** | LCP < 2.5s, responsive images, lazy load | Core Web Vitals |
| **SEO** | Meta title/description, OG tags, sitemap, canonical URLs | Google Search |
| **i18n** | Multi-currency display, RTL-ready layout, locale dates | ISO 4217, CLDR |
| **B2B** | Wholesale pricing tiers, MOQ, quote request | Common in seafood B2B |
| **Marketplace** | Multi-vendor shops, commissions, vendor pages | Platform liability EU DSA |

---

## 2. Seafood-specific (AquaERP differentiator)

- Catch-to-plate traceability badge (lot code, vessel, landing date)
- MSC / sustainability certification display
- Fresh vs frozen vs live tank indicators
- Grade A/B/C pricing tiers
- Cold-chain delivery windows
- Auction / daily catch pricing
- Export documentation links (CO, health certificate)
- Weight-based quantity (kg, not only pieces)

---

## 3. Admin / merchant features

- Theme gallery (10+ presets) + custom tokens
- Drag-free customization: colors, fonts, logo, hero, layout density
- Product merchandising (featured, collections)
- Coupon & promotion engine
- Abandoned cart recovery (outbox)
- Analytics: conversion, AOV, top species
- Vendor onboarding & payout dashboard
- Review moderation
- GDPR data export for customers

---

## 4. Twelve global storefront UI themes (implemented)

| # | Theme ID | Style | Best for | WCAG |
|---|----------|-------|----------|------|
| 1 | `ocean-classic` | Clean Shopify-like blue/white | General seafood retail | AA |
| 2 | `coastal-minimal` | Serif, whitespace, editorial | Premium fillets | AA |
| 3 | `market-fresh` | Green market stall | Local wet markets | AA |
| 4 | `premium-export` | Dark + gold luxury | Export / high-end | AA |
| 5 | `harbor-dark` | Full dark mode | Night markets, modern | AA |
| 6 | `swahili-coast` | Warm terracotta, African coastal | Kenya/TZ/Mozambique | AA |
| 7 | `ice-cold` | Ice blue, frozen emphasis | Cold chain / frozen | AA |
| 8 | `auction-live` | Bold red accents, urgency | Live fish auctions | AA |
| 9 | `cooperative` | Rounded, community purple | Fisher cooperatives | AA |
| 10 | `wholesale-b2b` | Dense grid, corporate navy | Restaurants, wholesalers | AA |
| 11 | `tropical-vibrant` | Coral/teal vibrant | Beach tourism | AA |
| 12 | `nordic-clean` | High contrast minimal | EU Nordic buyers | AAA |
| 13 | `artisan-local` | Organic shapes, cream/brown | Artisan smokehouses | AA |
| 14 | `global-trade` | Neutral corporate, multilingual header | International trade | AA |

All themes use **CSS design tokens** (custom properties), **mobile-first** breakpoints, **semantic HTML5** landmarks, and **reduced-motion** respect.

---

## 5. Customization dimensions (per tenant)

- Primary / secondary / accent colors
- Heading & body font pairing (Google Fonts subset)
- Logo + favicon
- Hero: image, headline, CTA
- Product grid: 2 / 3 / 4 columns
- Card style: elevated | bordered | flat
- Show traceability badge (on/off)
- Cookie banner text
- Footer: payment icons, social links
- Custom CSS (advanced)

---

## 6. Technical implementation (shipped)

| Layer | Path |
|-------|------|
| Research (this doc) | `docs/ECOMMERCE_GLOBAL_STANDARDS.md` |
| Theme registry (14 presets) | `lib/modules/commerce/storefront-themes.ts` |
| Tenant settings service | `lib/modules/commerce/storefront-settings.ts` |
| Public loader | `lib/modules/commerce/storefront-public.ts` |
| Storefront shell UI | `components/storefront/storefront-shell.tsx` |
| Public store | `/store/{tenantSlug}` → `app/store/[slug]/page.tsx` |
| Traceability page | `/store/{tenantSlug}/traceability` |
| Admin customizer | `/dashboard/commerce/storefront` |
| API | `GET/PATCH /api/v2/commerce/storefront` |
| Migration | `database/migrations/20260527_ecommerce_storefront_themes.sql` |

---

## 7. Compliance checklist (per storefront)

- [ ] Privacy policy link in footer
- [ ] Cookie consent before non-essential cookies
- [ ] Terms & returns visible pre-checkout
- [ ] Price includes/excludes VAT label
- [ ] All images have alt text
- [ ] Form labels associated (checkout)
- [ ] Error messages programmatically linked
- [ ] Payment handled on hosted page (Stripe/M-Pesa) — SAQ A
