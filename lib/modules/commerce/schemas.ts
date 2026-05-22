import { z } from 'zod'
import { paginationSchema } from '@/lib/validation/schemas'

export const productCatalogStatusSchema = z.enum(['active', 'draft', 'archived'])

export const productCatalogCreateSchema = z.object({
  sku: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  speciesId: z.string().uuid().optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  unit: z.string().max(20).default('kg'),
  basePrice: z.number().min(0).default(0),
  taxCode: z.string().max(20).optional().nullable(),
  hsCode: z.string().max(20).optional().nullable(),
  status: productCatalogStatusSchema.default('active'),
  vendorId: z.string().uuid().optional().nullable(),
})

export const productCatalogUpdateSchema = productCatalogCreateSchema.partial().extend({
  id: z.string().uuid(),
})

export const productCatalogListQuerySchema = paginationSchema.extend({
  status: productCatalogStatusSchema.optional(),
  sku: z.string().optional(),
})

export const couponDiscountTypeSchema = z.enum(['percent', 'fixed'])

export const couponCreateSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: couponDiscountTypeSchema,
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).default(0),
  maxUses: z.number().int().positive().optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const storefrontSettingsUpdateSchema = z.object({
  themeId: z.string().max(50).optional(),
  storeName: z.string().max(200).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  logoUrl: z.string().max(500).optional().nullable(),
  faviconUrl: z.string().max(500).optional().nullable(),
  heroImageUrl: z.string().max(500).optional().nullable(),
  heroHeadline: z.string().max(255).optional().nullable(),
  heroSubheadline: z.string().max(500).optional().nullable(),
  heroCtaLabel: z.string().max(80).optional().nullable(),
  heroCtaHref: z.string().max(255).optional().nullable(),
  customTokens: z.record(z.string()).optional().nullable(),
  showTraceability: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  showLoyalty: z.boolean().optional(),
  cookieBannerText: z.string().max(500).optional().nullable(),
  privacyPolicyUrl: z.string().max(500).optional().nullable(),
  termsUrl: z.string().max(500).optional().nullable(),
  footerText: z.string().max(2000).optional().nullable(),
  socialLinks: z.record(z.string()).optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  published: z.boolean().optional(),
})

export const couponListQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'inactive']).optional(),
})

export const marketplaceVendorListQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'pending', 'suspended']).optional(),
})

export type ProductCatalogCreateInput = z.infer<typeof productCatalogCreateSchema>
export type ProductCatalogUpdateInput = z.infer<typeof productCatalogUpdateSchema>
export type CouponCreateInput = z.infer<typeof couponCreateSchema>

export const productVariantGradeSchema = z.enum(['A', 'B', 'C'])
export const productVariantStatusSchema = z.enum(['active', 'inactive'])

export const productVariantCreateSchema = z.object({
  sku: z.string().min(1).max(80),
  name: z.string().min(1).max(150),
  grade: productVariantGradeSchema.optional().nullable(),
  weightKg: z.number().positive().optional().nullable(),
  price: z.number().min(0),
  stockKg: z.number().min(0).default(0),
  status: productVariantStatusSchema.default('active'),
})

export const productVariantUpdateSchema = productVariantCreateSchema.partial().extend({
  id: z.string().uuid(),
})

export const marketplaceReviewCreateSchema = z.object({
  listingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
})

export const marketplaceReviewListQuerySchema = paginationSchema.extend({
  listingId: z.string().uuid().optional(),
})

export const loyaltyTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum'])

export const loyaltyAccountUpsertSchema = z.object({
  customerId: z.string().uuid(),
  points: z.number().int().min(0).optional(),
  pointsDelta: z.number().int().optional(),
  tier: loyaltyTierSchema.optional(),
})

export const loyaltyAccountListQuerySchema = paginationSchema.extend({
  tier: loyaltyTierSchema.optional(),
  customerId: z.string().uuid().optional(),
})

export type ProductVariantCreateInput = z.infer<typeof productVariantCreateSchema>
export type ProductVariantUpdateInput = z.infer<typeof productVariantUpdateSchema>
export type MarketplaceReviewCreateInput = z.infer<typeof marketplaceReviewCreateSchema>
export type LoyaltyAccountUpsertInput = z.infer<typeof loyaltyAccountUpsertSchema>

export const cartAddItemSchema = z
  .object({
    listingId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    quantityKg: z.number().positive(),
    notes: z.string().max(255).optional().nullable(),
  })
  .refine((v) => Boolean(v.listingId || v.productId), {
    message: 'listingId or productId is required',
  })

export const cartRemoveItemSchema = z.object({
  itemId: z.string().uuid(),
})

export const wishlistAddSchema = z.object({
  listingId: z.string().uuid(),
})

export const wishlistRemoveSchema = z.object({
  listingId: z.string().uuid().optional(),
  id: z.string().uuid().optional(),
}).refine((v) => Boolean(v.listingId || v.id), {
  message: 'listingId or id is required',
})

export const checkoutPaymentMethodSchema = z.enum(['mpesa', 'cod', 'paystack', 'stripe'])

export const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  couponCode: z.string().max(50).optional().nullable(),
  deliveryAddress: z.string().max(2000).optional().nullable(),
  paymentMethod: checkoutPaymentMethodSchema.optional().default('cod'),
  phoneNumber: z.string().min(9).max(15).optional(),
})

export const commissionListQuerySchema = paginationSchema.extend({
  vendorId: z.string().uuid().optional(),
  status: z.enum(['pending', 'payable', 'paid', 'void']).optional(),
})

export const payoutCreateSchema = z.object({
  vendorId: z.string().uuid(),
  commissionIds: z.array(z.string().uuid()).optional(),
  currency: z.string().length(3).default('KES'),
})

export const payoutMarkPaidSchema = z.object({
  payoutId: z.string().uuid(),
})

export const payoutListQuerySchema = paginationSchema.extend({
  vendorId: z.string().uuid().optional(),
  status: z.enum(['draft', 'processing', 'paid', 'failed']).optional(),
})

export type CartAddItemInput = z.infer<typeof cartAddItemSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type PayoutCreateInput = z.infer<typeof payoutCreateSchema>
