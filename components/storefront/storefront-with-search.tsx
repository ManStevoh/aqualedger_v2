'use client'

import { useCallback, useEffect, useState } from 'react'
import { StorefrontShell, type StorefrontProduct } from './storefront-shell'
import type { StorefrontShellProps } from './storefront-shell'
import { publicApiFetch } from '@/lib/client-api'

type Props = Omit<StorefrontShellProps, 'products'> & {
  initialProducts: StorefrontProduct[]
}

export function StorefrontWithSearch({ initialProducts, storeSlug, ...rest }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    const res = await publicApiFetch(`/store/${storeSlug}/products?${params}`)
    const data = await res.json()
    if (data.success) {
      setProducts(
        (data.data.products as StorefrontProduct[]).map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: Number(p.price),
          unit: p.unit,
          category: p.category,
          grade: p.grade,
          traceable: p.traceable,
        })),
      )
      if (data.data.categories) setCategories(data.data.categories)
    }
  }, [storeSlug, q, category])

  useEffect(() => {
    const t = setTimeout(() => {
      if (q || category) load()
      else setProducts(initialProducts)
    }, 300)
    return () => clearTimeout(t)
  }, [q, category, load, initialProducts])

  useEffect(() => {
    publicApiFetch(`/store/${storeSlug}/products?limit=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.categories) setCategories(d.data.categories)
      })
      .catch(() => {})
  }, [storeSlug])

  return (
    <>
      <div className="sticky top-16 z-40 border-b border-[var(--sf-border)]/80 bg-[var(--sf-surface)]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <input
            id="store-search"
            type="search"
            placeholder="Search seafood…"
            className="flex-1 min-w-[200px] rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-bg)] px-4 py-2.5 min-h-[44px] shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)]/30"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search products"
          />
          <select
            className="rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-bg)] px-3 py-2.5 min-h-[44px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <StorefrontShell {...rest} storeSlug={storeSlug} products={products} />
    </>
  )
}
