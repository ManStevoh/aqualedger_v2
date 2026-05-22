'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { StorefrontCartButton } from './storefront-cart-button'

interface Props {
  storeSlug: string
  productId: string
  productName: string
}

export function ProductDetailActions({ storeSlug, productId, productName }: Props) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      <StorefrontCartButton storeSlug={storeSlug} productId={productId} productName={productName} />
      <Link
        href={`/store/${storeSlug}/cart`}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--sf-radius)] border border-[var(--sf-border)] px-6 py-2.5 text-sm font-medium hover:bg-[var(--sf-surface-alt)]"
      >
        <ShoppingCart className="h-4 w-4" />
        View cart
      </Link>
    </div>
  )
}
