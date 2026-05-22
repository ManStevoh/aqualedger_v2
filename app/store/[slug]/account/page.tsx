'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { publicApiFetch } from '@/lib/client-api'
import { storePath } from '@/lib/config/urls'

export default function StoreAccountPage() {
  const params = useParams()
  const slug = String(params.slug)
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await publicApiFetch(
        `/store/${slug}/orders?email=${encodeURIComponent(email)}`,
      )
      const data = await res.json()
      if (data.success) setOrders(data.data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Link href={storePath(slug)} className="text-sm text-sky-600">← Back to store</Link>
      <h1 className="mt-4 text-2xl font-bold">My orders</h1>
      <p className="text-sm text-slate-500">Guest order lookup — enter the email used at checkout</p>
      <form onSubmit={lookup} className="mt-6 max-w-md flex gap-2">
        <input
          type="email"
          required
          className="flex-1 rounded border px-3 py-2 min-h-[44px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button type="submit" disabled={loading} className="rounded bg-sky-600 px-4 py-2 text-white min-h-[44px]">
          {loading ? '…' : 'Find'}
        </button>
      </form>
      <ul className="mt-8 space-y-3 max-w-lg">
        {orders.map((o) => (
          <li key={String(o.id)} className="rounded border bg-white p-4">
            <p className="font-medium">{String(o.order_number)}</p>
            <p className="text-sm text-slate-500">
              {String(o.status)} · KES {Number(o.total).toLocaleString()} · {String(o.created_at).slice(0, 10)}
            </p>
          </li>
        ))}
        {orders.length === 0 && email && !loading && (
          <p className="text-slate-500">No orders for this email.</p>
        )}
      </ul>
    </div>
  )
}
