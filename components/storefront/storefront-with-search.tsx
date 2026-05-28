'use client'

import { useCallback, useEffect, useState } from 'react'
import { StorefrontShell, type StorefrontProduct } from './storefront-shell'
import type { StorefrontShellProps } from './storefront-shell'
import { publicApiFetch } from '@/lib/client-api'
import { Search, X } from 'lucide-react'

type Props = Omit<StorefrontShellProps, 'products'> & {
  initialProducts: StorefrontProduct[]
}

export function StorefrontWithSearch({ initialProducts, storeSlug, ...rest }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')

  const getCategoryCount = useCallback(
    (cat: string) => {
      if (cat === '') return initialProducts.length
      return initialProducts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length
    },
    [initialProducts],
  )

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
          imageUrl: p.imageUrl,
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
    <StorefrontShell
      {...rest}
      storeSlug={storeSlug}
      products={products}
      searchTerm={q}
      selectedCategory={category}
      onClearFilters={() => {
        setQ('')
        setCategory('')
      }}
      categories={categories}
      onCategoryChange={setCategory}
      onSearchChange={setQ}
      getCategoryCount={getCategoryCount}
    />
  )
}
