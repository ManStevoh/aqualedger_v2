import { z } from 'zod'
import { paginationSchema } from '@/lib/validation/schemas'

export const movementTypeSchema = z.enum([
  'in',
  'out',
  'transfer',
  'adjustment',
  'spoilage',
])

export const inventoryMovementCreateSchema = z.object({
  batchId: z.string().uuid().optional().nullable(),
  movementType: movementTypeSchema,
  quantityKg: z.number().positive(),
  fromLocation: z.string().max(100).optional().nullable(),
  toLocation: z.string().max(100).optional().nullable(),
  referenceType: z.string().max(50).optional().nullable(),
  referenceId: z.string().uuid().optional().nullable(),
  lotCode: z.string().max(80).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const inventoryMovementListQuerySchema = paginationSchema.extend({
  batchId: z.string().uuid().optional(),
  movementType: movementTypeSchema.optional(),
})

export const traceabilityGradingSchema = z.enum(['A', 'B', 'C', 'reject'])

export const traceabilityLotCreateSchema = z.object({
  lotCode: z.string().max(80).optional(),
  catchId: z.string().uuid().optional().nullable(),
  speciesName: z.string().max(150).optional().nullable(),
  vesselName: z.string().max(150).optional().nullable(),
  landingSite: z.string().max(150).optional().nullable(),
  catchDate: z.string().optional().nullable(),
  grading: traceabilityGradingSchema.optional().nullable(),
  mscCertified: z.boolean().default(false),
  faoArea: z.string().max(20).optional().nullable(),
  storageTempC: z.number().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
})

export const traceabilityLotListQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'recalled', 'consumed']).optional(),
  lotCode: z.string().optional(),
})

export type InventoryMovementCreateInput = z.infer<typeof inventoryMovementCreateSchema>
export type TraceabilityLotCreateInput = z.infer<typeof traceabilityLotCreateSchema>

export const stockTransferStatusSchema = z.enum(['draft', 'in_transit', 'received', 'cancelled'])

export const stockTransferCreateSchema = z.object({
  fromLocation: z.string().min(1).max(100),
  toLocation: z.string().min(1).max(100),
  batchId: z.string().uuid().optional().nullable(),
  quantityKg: z.number().positive(),
  status: stockTransferStatusSchema.default('draft'),
})

export const stockTransferUpdateSchema = z.object({
  id: z.string().uuid(),
  status: stockTransferStatusSchema,
})

export const stockTransferListQuerySchema = paginationSchema.extend({
  status: stockTransferStatusSchema.optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
})

export type StockTransferCreateInput = z.infer<typeof stockTransferCreateSchema>
export type StockTransferUpdateInput = z.infer<typeof stockTransferUpdateSchema>
