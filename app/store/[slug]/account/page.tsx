'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { publicApiFetch } from '@/lib/client-api'
import { storePath } from '@/lib/config/urls'
import { toast } from 'sonner'
import { LogOut, ShoppingBag, User, Search } from 'lucide-react'

export default function StoreAccountPage() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params.slug)
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)
  const [guestSearched, setGuestSearched] = useState(false)

  useEffect(() => {
    // Check if customer is logged in
    fetch(`/api/public/store/${slug}/auth/me`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.authenticated) {
          setUser(data.data.user)
          // Fetch their orders automatically
          fetch(`/api/public/store/${slug}/orders`)
            .then((res) => res.json())
            .then((ordersData) => {
              if (ordersData.success) {
                setOrders(ordersData.data.orders || [])
              }
            })
            .finally(() => setLoading(false))
        } else {
          setUser(null)
          setLoading(false)
        }
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [slug])

  const handleLogout = async () => {
    try {
      const res = await fetch(`/api/public/store/${slug}/auth/logout`, {
        method: 'POST',
      })
      if (res.ok) {
        toast.success('Logged out successfully')
        setUser(null)
        setOrders([])
        router.push(`/store/${slug}`)
      }
    } catch {
      toast.error('Logout failed')
    }
  }

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGuestSearched(true)
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
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 mb-8">
          <div>
            <Link href={storePath(slug)} className="text-sm font-semibold text-sky-600 hover:underline">
              ← Back to store
            </Link>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              My Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and view all your fresh catch orders
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm animate-in fade-in duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500 leading-none mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">Loading orders...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-slate-600" />
                <span>Order History ({orders.length})</span>
              </h2>

              <ul className="space-y-4">
                {orders.map((o) => (
                  <li
                    key={String(o.id)}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between border-b pb-3 mb-3">
                      <div>
                        <p className="font-bold text-slate-900 tracking-tight">{String(o.order_number)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Placed on {String(o.created_at).slice(0, 10)} at {String(o.created_at).slice(11, 16)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        o.status === 'delivered' || o.status === 'shipped'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}>
                        {String(o.status)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Delivery Address: </span>
                        <span className="font-medium text-slate-800">{String(o.delivery_address || 'Not provided')}</span>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-slate-500">Total: </span>
                        <span className="text-base font-extrabold text-sky-600">KES {Number(o.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </li>
                ))}

                {orders.length === 0 && (
                  <div className="rounded-xl border border-slate-200 border-dashed bg-white p-12 text-center">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">No orders found</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      {user
                        ? "You haven't placed any orders yet. Visit the catalog to browse today's fresh daily catch."
                        : "No orders found. If you checked out as a guest, please use the lookup form to search."}
                    </p>
                  </div>
                )}
              </ul>
            </div>

            {!user && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
                  <Search className="h-4.5 w-4.5 text-slate-600" />
                  <span>Guest Order Lookup</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Did you place an order as a guest? Enter the exact email address used during checkout to view your details.
                </p>
                <form onSubmit={lookup} className="space-y-3">
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-sky-600/10 focus:border-sky-600 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-sky-600 py-2.5 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow hover:shadow-md cursor-pointer"
                  >
                    Find Orders
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t text-center text-xs text-slate-500 leading-relaxed">
                  <p>Want to see your orders automatically?</p>
                  <Link
                    href={`/store/${slug}/login?redirect=/store/${slug}/account`}
                    className="mt-2 inline-block font-bold text-sky-600 hover:underline"
                  >
                    Log in to your account
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
