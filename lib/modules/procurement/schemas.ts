import { z } from 'zod'
import { paginationSchema } from '@/lib/validation/schemas'

export const supplierStatusSchema = z.enum(['active', 'inactive', 'blocked'])

export const supplierCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  contactName: z.string().max(150).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  countryCode: z.string().length(2).default('KE'),
  rating: z.number().min(0).max(5).optional(),
  status: supplierStatusSchema.default('active'),
  notes: z.string().optional().nullable(),
})

export const supplierListQuerySchema = paginationSchema.extend({
  status: supplierStatusSchema.optional(),
  search: z.string().max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
})

export const purchaseOrderStatusSchema = z.enum([
  'draft',
  'sent',
  'partial',
  'received',
  'cancelled',
])

export const purchaseOrderLineSchema = z.object({
  description: z.string().min(1).max(255),
  quantity: z.number().positive(),
  unit: z.string().max(20).default('kg'),
  unitPrice: z.number().min(0),
})

export const purchaseOrderCreateSchema = z.object({
  supplierId: z.string().uuid(),
  poNumber: z.string().max(50).optional(),
  status: purchaseOrderStatusSchema.default('draft'),
  currency: z.string().length(3).default('KES'),
  taxAmount: z.number().min(0).default(0),
  expectedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(purchaseOrderLineSchema).min(1),
})

export const purchaseOrderListQuerySchema = paginationSchema.extend({
  status: purchaseOrderStatusSchema.optional(),
  supplierId: z.string().uuid().optional(),
})

export const supplierUpdateSchema = z.object({
  supplierId: z.string().uuid().optional(),
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().max(150).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  countryCode: z.string().length(2).optional(),
  rating: z.number().min(0).max(5).optional(),
  status: supplierStatusSchema.optional(),
  notes: z.string().optional().nullable(),
})

export const purchaseRequestApproveSchema = z.object({
  status: z.enum(['approved', 'rejected']).default('approved'),
})

export const purchaseRequestStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
  'ordered',
])

export const purchaseRequestCreateSchema = z.object({
  prNumber: z.string().max(50).optional(),
  department: z.string().max(100).optional().nullable(),
  status: purchaseRequestStatusSchema.default('draft'),
  neededBy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const purchaseRequestListQuerySchema = paginationSchema.extend({
  status: purchaseRequestStatusSchema.optional(),
})

export const rfqStatusSchema = z.enum(['open', 'closed', 'awarded', 'cancelled'])

export const rfqCreateSchema = z.object({
  rfqNumber: z.string().max(50).optional(),
  title: z.string().min(1).max(255),
  status: rfqStatusSchema.default('open'),
  closingDate: z.string().optional().nullable(),
})

export const rfqListQuerySchema = paginationSchema.extend({
  status: rfqStatusSchema.optional(),
})

export const grnStatusSchema = z.enum(['draft', 'posted', 'void'])

export const goodsReceiptCreateSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  grnNumber: z.string().max(50).optional(),
  receivedDate: z.string().min(1),
  status: grnStatusSchema.default('posted'),
  notes: z.string().optional().nullable(),
})

export const goodsReceiptListQuerySchema = paginationSchema.extend({
  purchaseOrderId: z.string().uuid().optional(),
  status: grnStatusSchema.optional(),
})

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>
export type PurchaseOrderCreateInput = z.infer<typeof purchaseOrderCreateSchema>
export type PurchaseRequestCreateInput = z.infer<typeof purchaseRequestCreateSchema>
export type RfqCreateInput = z.infer<typeof rfqCreateSchema>
export type GoodsReceiptCreateInput = z.infer<typeof goodsReceiptCreateSchema>
