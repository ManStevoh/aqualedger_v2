'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Smartphone, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { publicApiFetch } from '@/lib/client-api'

type DeliverySlot = {
  id: string
  slot_date: string
  start_time: string
  end_time: string
  booked_count: number
  max_orders: number
  status: string
}

type PaymentMethod = 'mpesa' | 'cod'

export default function StoreCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params.slug)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [slots, setSlots] = useState<DeliverySlot[]>([])
  const [slotId, setSlotId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')

  useEffect(() => {
    publicApiFetch(`/store/${slug}/delivery-slots`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.slots) {
          const open = (data.data.slots as DeliverySlot[]).filter(
            (s) => s.status === 'open' && Number(s.booked_count) < Number(s.max_orders),
          )
          setSlots(open)
          if (open[0]) setSlotId(open[0].id)
        }
      })
      .catch(() => {})
  }, [slug])

  const pollPayment = useCallback(async (intentId: string, attempts = 0): Promise<boolean> => {
    if (attempts > 30) return false
    const res = await publicApiFetch(`/payments/mpesa/status?id=${encodeURIComponent(intentId)}`)
    const data = await res.json()
    if (data.success && data.data?.intent?.status === 'completed') return true
    if (data.data?.intent?.status === 'failed') return false
    await new Promise((r) => setTimeout(r, 2500))
    return pollPayment(intentId, attempts + 1)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === 'mpesa' && !phone.trim()) {
      toast.error('Enter your M-Pesa phone number (2547...)')
      return
    }
    setSubmitting(true)
    try {
      const res = await publicApiFetch(`/store/${slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guestName: name,
          guestEmail: email,
          guestPhone: phone || undefined,
          deliveryAddress: address || undefined,
          deliverySlotId: slotId || undefined,
          paymentMethod,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Checkout failed')

      const order = data.data.order as {
        orderNumber: string
        orderId: string
        paymentIntentId?: string
        paymentPending?: boolean
        paymentSimulated?: boolean
      }

      if (order.paymentIntentId && order.paymentPending) {
        toast.message('Approve M-Pesa on your phone', {
          description: 'Waiting for payment confirmation…',
        })
        const paid = await pollPayment(order.paymentIntentId)
        if (!paid) {
          toast.error('Payment not confirmed yet. Check your phone or order status later.')
          router.push(`/store/${slug}/account`)
          return
        }
      }

      toast.success(
        order.paymentSimulated
          ? `Order ${order.orderNumber} paid (sandbox)`
          : `Order ${order.orderNumber} confirmed`,
      )
      router.push(`/store/${slug}?ordered=${order.orderNumber}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-4 py-4">
        <Link href={`/store/${slug}/cart`} className="inline-flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Checkout</h1>
        <p className="text-sm text-slate-500">Guest checkout · M-Pesa STK or pay on delivery</p>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-lg px-4 py-8 space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="name">Full name</label>
          <input id="name" required className="mt-1 w-full rounded border px-3 py-2 min-h-[44px]" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" required className="mt-1 w-full rounded border px-3 py-2 min-h-[44px]" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="phone">Phone</label>
          <input
            id="phone"
            required={paymentMethod === 'mpesa'}
            className="mt-1 w-full rounded border px-3 py-2 min-h-[44px]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2547XXXXXXXX"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="address">Delivery address</label>
          <textarea id="address" rows={3} className="mt-1 w-full rounded border px-3 py-2" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        {slots.length > 0 && (
          <div>
            <label className="text-sm font-medium" htmlFor="slot">Cold-chain delivery window</label>
            <select
              id="slot"
              className="mt-1 w-full rounded border px-3 py-2 min-h-[44px]"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.slot_date} {String(s.start_time).slice(0, 5)}–{String(s.end_time).slice(0, 5)} ({Number(s.max_orders) - Number(s.booked_count)} left)
                </option>
              ))}
            </select>
          </div>
        )}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Payment</legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
            <input
              type="radio"
              name="pay"
              checked={paymentMethod === 'mpesa'}
              onChange={() => setPaymentMethod('mpesa')}
              className="h-4 w-4"
            />
            <Smartphone className="h-5 w-5 text-sky-600" />
            <div>
              <p className="font-medium text-sm">M-Pesa</p>
              <p className="text-xs text-slate-500">STK push to your phone now</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
            <input
              type="radio"
              name="pay"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="h-4 w-4"
            />
            <Banknote className="h-5 w-5 text-slate-600" />
            <div>
              <p className="font-medium text-sm">Pay on delivery</p>
              <p className="text-xs text-slate-500">Cash or M-Pesa when delivered</p>
            </div>
          </label>
        </fieldset>

        <p className="text-xs text-slate-500">
          By placing this order you agree to our terms. VAT included where applicable.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sky-600 py-3 text-white font-medium min-h-[44px] disabled:opacity-60"
        >
          {submitting
            ? paymentMethod === 'mpesa'
              ? 'Waiting for M-Pesa…'
              : 'Placing order…'
            : paymentMethod === 'mpesa'
              ? 'Pay with M-Pesa'
              : 'Place order'}
        </button>
      </form>
    </div>
  )
}
