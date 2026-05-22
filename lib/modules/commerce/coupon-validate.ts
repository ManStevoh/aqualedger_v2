import { queryOne } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound, conflict } from '@/lib/api-handler'
import type { CouponRow } from './service'

export async function validateCoupon(
  tenantId: string,
  code: string | null | undefined,
  subtotal: number,
): Promise<{ coupon: CouponRow | null; discount: number }> {
  if (!code?.trim()) return { coupon: null, discount: 0 }

  const coupon = await queryOne<CouponRow>(
    `SELECT * FROM coupons
     WHERE ${tenantWhere()} AND code = ? AND status = 'active'`,
    [tenantId, code.trim().toUpperCase()],
  )
  if (!coupon) throw notFound('Coupon not found or inactive')

  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    throw conflict('Coupon is not yet valid')
  }
  if (coupon.valid_to && new Date(coupon.valid_to) < now) {
    throw conflict('Coupon has expired')
  }
  if (Number(coupon.min_order_amount) > subtotal) {
    throw conflict(`Minimum order amount is KES ${coupon.min_order_amount}`)
  }
  if (coupon.max_uses != null && coupon.uses_count >= coupon.max_uses) {
    throw conflict('Coupon usage limit reached')
  }

  let discount = 0
  if (coupon.discount_type === 'percent') {
    discount = Math.round(subtotal * (Number(coupon.discount_value) / 100) * 100) / 100
  } else {
    discount = Math.min(Number(coupon.discount_value), subtotal)
  }

  return { coupon, discount }
}
