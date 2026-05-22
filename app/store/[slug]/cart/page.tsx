'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { publicApiFetch } from '@/lib/client-api'

interface CartItem {
  id: string
  product_id: string
  quantity_kg: number
  unit_price: number
  line_total: number
  product_name?: string
}

export default function StoreCartPage() {
  const params = useParams()
  const slug = String(params.slug)
  const [items, setItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await publicApiFetch(`/store/${slug}/cart`)
      const data = await res.json()
      if (data.success && data.data?.cart) {
        setItems(data.data.cart.items || [])
        setSubtotal(data.data.cart.subtotal || 0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [slug])

  const removeItem = async (itemId: string) => {
    const res = await publicApiFetch(`/store/${slug}/cart?itemId=${itemId}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    if (data.success) {
      setItems(data.data.cart.items)
      setSubtotal(data.data.cart.subtotal)
    } else toast.error('Could not remove item')
  }

  const tax = Math.round(subtotal * 0.16 * 100) / 100
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-4 py-4">
        <Link href={`/store/${slug}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Your cart</h1>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        {loading ? (
          <p className="text-slate-500">Loading cart…</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500">Your cart is empty.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between rounded-lg border bg-white p-4">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity_kg} kg × KES {item.unit_price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">KES {Number(item.line_total).toLocaleString()}</p>
                  <button type="button" onClick={() => removeItem(item.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <div className="mt-8 rounded-lg border bg-white p-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>VAT (16%)</span>
              <span>KES {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold mt-3 text-lg">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
            <Link
              href={`/store/${slug}/checkout`}
              className="mt-6 block w-full rounded-lg bg-sky-600 py-3 text-center text-white font-medium min-h-[44px]"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
