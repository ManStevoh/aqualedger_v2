'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { publicApiFetch } from '@/lib/client-api'
import { StorefrontShell, type StorefrontShellProps } from './storefront-shell'

interface CartItem {
  id: string
  product_id: string
  quantity_kg: number
  unit_price: number
  line_total: number
  product_name?: string
}

interface StorefrontCartProps extends Omit<StorefrontShellProps, 'products'> {
  initialCartItems: CartItem[]
  initialSubtotal: number
}

export function StorefrontCart({
  settings,
  theme,
  cssVars,
  storeBasePath,
  storeSlug,
  initialCartItems,
  initialSubtotal,
}: StorefrontCartProps) {
  const [items, setItems] = useState<CartItem[]>(initialCartItems)
  const [subtotal, setSubtotal] = useState(initialSubtotal)
  const [loading, setLoading] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  const loadCart = async () => {
    try {
      const res = await publicApiFetch(`/store/${storeSlug}/cart`)
      const data = await res.json()
      if (data.success && data.data?.cart) {
        setItems(data.data.cart.items || [])
        setSubtotal(data.data.cart.subtotal || 0)
      }
    } catch {
      toast.error('Failed to load cart')
    }
  }

  const updateQuantity = async (productId: string, delta: number) => {
    setLoading(true)
    try {
      const res = await publicApiFetch(`/store/${storeSlug}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantityKg: delta }),
      })
      const data = await res.json()
      if (data.success && data.data?.cart) {
        setItems(data.data.cart.items || [])
        setSubtotal(data.data.cart.subtotal || 0)
        toast.success(delta > 0 ? 'Quantity increased' : 'Quantity decreased')
      } else {
        toast.error('Could not update quantity')
      }
    } catch {
      toast.error('Error updating cart')
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdatingItemId(itemId)
    try {
      const res = await publicApiFetch(`/store/${storeSlug}/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success && data.data?.cart) {
        setItems(data.data.cart.items || [])
        setSubtotal(data.data.cart.subtotal || 0)
        toast.success('Item removed from cart')
      } else {
        toast.error('Could not remove item')
      }
    } catch {
      toast.error('Error removing item')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const tax = Math.round(subtotal * 0.16 * 100) / 100
  const total = subtotal + tax

  const cardStyle = theme.tokens.cardStyle
  const cardClass =
    cardStyle === 'elevated'
      ? 'shadow-[var(--sf-shadow)] hover:shadow-md transition-shadow'
      : cardStyle === 'organic'
        ? 'rounded-[var(--sf-radius)] border-2 border-[var(--sf-border)]'
        : cardStyle === 'bordered'
          ? 'border-2 border-[var(--sf-border)]'
          : 'border border-[var(--sf-border)] bg-[var(--sf-surface)]'

  const storeName = settings.store_name || settings.tenant_name || 'Store'

  return (
    <StorefrontShell
      settings={settings}
      theme={theme}
      cssVars={cssVars}
      storeBasePath={storeBasePath}
      storeSlug={storeSlug}
      hideHeroAndProducts={true}
    >
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={storeBasePath}
            className="inline-flex items-center gap-2 text-sm text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4" /> Continue shopping catch
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/40 text-[var(--sf-text-muted)]">
            🛍️ Secure tenant isolation active
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ fontFamily: 'var(--sf-font-heading)' }}>
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-6 bg-[var(--sf-surface)] rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-border)] flex flex-col items-center">
                <div className="h-16 w-16 bg-[var(--sf-primary)]/10 text-[var(--sf-primary)] rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Your catch is empty</h3>
                <p className="text-sm text-[var(--sf-text-muted)] mt-1 max-w-sm">
                  You haven't added any premium seafood items to your basket yet.
                </p>
                <Link
                  href={storeBasePath}
                  className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] px-6 py-2.5 text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-all shadow-md"
                >
                  Start shopping catches
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[var(--sf-surface)] rounded-[var(--sf-radius)] border-[var(--sf-border)]/40 ${cardClass} relative overflow-hidden`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-lg leading-tight tracking-tight">{item.product_name || 'Premium Product'}</p>
                    <p className="text-sm text-[var(--sf-text-muted)] font-medium">
                      KES {item.unit_price.toLocaleString()} /kg
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/50 rounded-full p-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() => item.quantity_kg > 1 ? updateQuantity(item.product_id, -1) : removeItem(item.id)}
                        disabled={loading}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] disabled:opacity-50 transition-all cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-[var(--sf-text)]">
                        {item.quantity_kg} <span className="text-[10px] font-normal text-[var(--sf-text-muted)]">kg</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        disabled={loading}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] disabled:opacity-50 transition-all cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-extrabold text-lg text-[var(--sf-primary)] min-w-[100px] text-right">
                        KES {Number(item.line_total).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItemId === item.id}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-all disabled:opacity-50 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Pricing Card Summary */}
          {items.length > 0 && (
            <div className={`p-6 bg-[var(--sf-surface)] rounded-[var(--sf-radius)] border border-[var(--sf-border)]/40 ${cardClass} shadow-md`}>
              <h2 className="text-xl font-bold tracking-tight mb-5" style={{ fontFamily: 'var(--sf-font-heading)' }}>
                Order summary
              </h2>
              <div className="space-y-3 text-sm font-medium text-[var(--sf-text-muted)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--sf-text)] font-semibold">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--sf-border)]/30 pb-3">
                  <span>VAT (16%)</span>
                  <span className="text-[var(--sf-text)] font-semibold">KES {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold mt-4 text-lg text-[var(--sf-text)]">
                  <span>Total</span>
                  <span className="text-[var(--sf-primary)] font-extrabold">KES {total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                href={`${storeBasePath}/checkout`}
                className="mt-6 block w-full rounded-full bg-[var(--sf-primary)] hover:opacity-95 transition-all py-3.5 text-center text-[var(--sf-primary-fg)] font-bold text-xs tracking-widest uppercase shadow-md hover:shadow-lg min-h-[44px] cursor-pointer"
              >
                Proceed to checkout
              </Link>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[var(--sf-text-muted)]">
                <span>🔒 PCI-Compliant checkout</span>
                <span>·</span>
                <span>🇪🇺 Catch traceability locked</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </StorefrontShell>
  )
}
