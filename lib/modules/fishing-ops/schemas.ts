import { z } from 'zod'
import { paginationSchema } from '@/lib/validation/schemas'

export const fishingZoneStatusSchema = z.enum(['open', 'restricted', 'closed'])

export const fishingZoneCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  faoArea: z.string().max(20).optional().nullable(),
  county: z.string().max(100).optional().nullable(),
  status: fishingZoneStatusSchema.default('open'),
})

export const fishingZoneUpdateSchema = fishingZoneCreateSchema.partial().extend({
  id: z.string().uuid(),
})

export const fishingZoneListQuerySchema = paginationSchema.extend({
  status: fishingZoneStatusSchema.optional(),
  code: z.string().optional(),
})

export const boatFuelLogCreateSchema = z.object({
  boatId: z.string().uuid(),
  tripId: z.string().uuid().optional().nullable(),
  liters: z.number().positive(),
  cost: z.number().min(0),
  loggedAt: z.string().min(1),
  notes: z.string().max(255).optional().nullable(),
})

export const boatFuelLogListQuerySchema = paginationSchema.extend({
  boatId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
})

export type FishingZoneCreateInput = z.infer<typeof fishingZoneCreateSchema>
export type FishingZoneUpdateInput = z.infer<typeof fishingZoneUpdateSchema>
export type BoatFuelLogCreateInput = z.infer<typeof boatFuelLogCreateSchema>
