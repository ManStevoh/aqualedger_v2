'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { publicApiFetch } from '@/lib/client-api'
import { storePath } from '@/lib/config/urls'

interface StorefrontCartButtonProps {
  storeSlug: string
  productId: string
  productName: string
  defaultQty?: number
}

export function StorefrontCartButton({
  storeSlug,
  productId,
  productName,
  defaultQty = 1,
}: StorefrontCartButtonProps) {
  const [loading, setLoading] = useState(false)

  const addToCart = async () => {
    setLoading(true)
    try {
      const res = await publicApiFetch(`/store/${storeSlug}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantityKg: defaultQty }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed')
      toast.success(`${productName} added to cart`)
      window.location.href = storePath(storeSlug, '/cart')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add to cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={loading}
      className="mt-4 w-full min-h-[44px] rounded-[var(--sf-radius)] text-sm font-medium disabled:opacity-60"
      style={{ backgroundColor: 'var(--sf-primary)', color: 'var(--sf-primary-fg)' }}
    >
      {loading ? 'Adding…' : 'Add to cart'}
    </button>
  )
}
