'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sparkles,
  Tag,
  Snowflake,
} from 'lucide-react'
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
  image_url?: string | null
  category?: string | null
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
  const [promoCode, setPromoCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)

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

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return
    if (promoCode.trim().toUpperCase() === 'FRESH10' || promoCode.trim().toUpperCase() === 'AQUA10') {
      setDiscountApplied(true)
      toast.success('10% discount applied to your catch order!')
    } else {
      toast.error('Invalid promo code')
    }
  }

  const discountAmount = discountApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0
  const effectiveSubtotal = subtotal - discountAmount
  const tax = Math.round(effectiveSubtotal * 0.16 * 100) / 100
  const total = effectiveSubtotal + tax

  const cardStyle = theme.tokens.cardStyle
  const cardClass =
    cardStyle === 'elevated'
      ? 'shadow-[var(--sf-shadow)] hover:shadow-md transition-shadow'
      : cardStyle === 'organic'
        ? 'rounded-[var(--sf-radius)] border-2 border-[var(--sf-border)]'
        : cardStyle === 'bordered'
          ? 'border-2 border-[var(--sf-border)]'
          : 'border border-[var(--sf-border)] bg-[var(--sf-surface)]'

  return (
    <StorefrontShell
      settings={settings}
      theme={theme}
      cssVars={cssVars}
      storeBasePath={storeBasePath}
      storeSlug={storeSlug}
      hideHeroAndProducts={true}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        {/* Navigation Breadcrumb & Badges */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={storeBasePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)] transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" /> Continue shopping catch
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/40 text-[var(--sf-text-muted)]">
              <Snowflake className="h-3.5 w-3.5 text-sky-500" /> Cold-Chain Verified (0°C–4°C)
            </span>
          </div>
        </div>

        <h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8"
          style={{ fontFamily: 'var(--sf-font-heading)' }}
        >
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-6 bg-[var(--sf-surface)] rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-border)] flex flex-col items-center">
                <div className="h-16 w-16 bg-[var(--sf-primary)]/10 text-[var(--sf-primary)] rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Your catch basket is empty</h3>
                <p className="text-sm text-[var(--sf-text-muted)] mt-1.5 max-w-sm">
                  You haven't added any fresh seafood items to your cart yet.
                </p>
                <Link
                  href={storeBasePath}
                  className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[var(--sf-primary)] text-[var(--sf-primary-fg)] px-6 py-2.5 text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-all shadow-md"
                >
                  Explore Fresh Catches
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-[var(--sf-surface)] rounded-[var(--sf-radius)] border-[var(--sf-border)]/40 ${cardClass} relative overflow-hidden`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* User-uploaded Product Image Media — only rendered if uploaded by user */}
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name || 'Product'}
                        className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-[var(--sf-border)]/50 shrink-0"
                      />
                    ) : null}

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-base sm:text-lg leading-tight tracking-tight text-[var(--sf-text)]">
                          {item.product_name || 'Fresh Catch Product'}
                        </p>
                      </div>
                      <p className="text-sm text-[var(--sf-text-muted)] font-medium">
                        KES {item.unit_price.toLocaleString()} / kg
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Fresh Catch
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          Chilled (0–4°C)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--sf-border)]/30">
                    {/* Quantity Controls — Fixed horizontal alignment */}
                    <div className="flex items-center border border-[var(--sf-border)] rounded-full bg-[var(--sf-surface-alt)] p-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity_kg > 1
                            ? updateQuantity(item.product_id, -1)
                            : removeItem(item.id)
                        }
                        disabled={loading}
                        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] disabled:opacity-50 transition-all cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[var(--sf-text)] whitespace-nowrap">
                        {item.quantity_kg} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        disabled={loading}
                        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] disabled:opacity-50 transition-all cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-extrabold text-lg text-[var(--sf-primary)] min-w-[90px] text-right">
                        KES {Number(item.line_total).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItemId === item.id}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-full transition-all disabled:opacity-50 cursor-pointer"
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

          {/* Cart Order Summary Card */}
          {items.length > 0 && (
            <div className="space-y-4">
              <div
                className={`p-6 bg-[var(--sf-surface)] rounded-[var(--sf-radius)] border border-[var(--sf-border)]/40 ${cardClass} shadow-md space-y-6`}
              >
                <h2
                  className="text-xl font-bold tracking-tight border-b pb-4 border-[var(--sf-border)]/30"
                  style={{ fontFamily: 'var(--sf-font-heading)' }}
                >
                  Order summary
                </h2>

                <div className="space-y-3 text-sm font-medium text-[var(--sf-text-muted)]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[var(--sf-text)] font-semibold">
                      KES {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discountApplied && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Promo Discount (10%)</span>
                      <span>- KES {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-[var(--sf-border)]/30 pb-3">
                    <span>VAT (16%)</span>
                    <span className="text-[var(--sf-text)] font-semibold">
                      KES {tax.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold pt-2 text-lg text-[var(--sf-text)]">
                    <span>Total</span>
                    <span className="text-[var(--sf-primary)] font-extrabold">
                      KES {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Estimated Delivery Timeline */}
                <div className="p-3 bg-[var(--sf-surface-alt)] border border-[var(--sf-border)]/40 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--sf-text)]">
                    <Truck className="h-4 w-4 text-[var(--sf-primary)] shrink-0" /> Chilled Delivery Timeline
                  </div>
                  <p className="text-[var(--sf-text-muted)] text-[11px] leading-relaxed">
                    Dispatched from local cooperative depot • Estimated arrival: Tomorrow morning
                  </p>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-[var(--sf-text-muted)] flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Have a promo or wholesale code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FRESH10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-[var(--sf-border)] bg-[var(--sf-surface)] text-[var(--sf-text)] focus:outline-none focus:ring-1 focus:ring-[var(--sf-primary)]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] text-[var(--sf-text)] hover:bg-[var(--sf-surface)] transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </form>

                <Link
                  href={`${storeBasePath}/checkout`}
                  className="block w-full rounded-full bg-[var(--sf-primary)] hover:opacity-95 transition-all py-3.5 text-center text-[var(--sf-primary-fg)] font-bold text-xs tracking-widest uppercase shadow-md hover:shadow-lg min-h-[44px] cursor-pointer"
                >
                  Proceed to checkout
                </Link>

                <div className="pt-2 flex flex-col items-center gap-2 text-[11px] text-[var(--sf-text-muted)] border-t border-[var(--sf-border)]/30">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>PCI-DSS Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>EU-Compliant Catch Traceability</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StorefrontShell>
  )
}
