import { z } from 'zod'

export const paymentProviderSchema = z.enum(['mpesa', 'stripe', 'cash', 'bank'])

export const paymentIntentCreateSchema = z.object({
  orderId: z.string().uuid().optional().nullable(),
  provider: paymentProviderSchema,
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default('KES'),
  metadata: z.record(z.unknown()).optional().nullable(),
})

export type PaymentIntentCreateInput = z.infer<typeof paymentIntentCreateSchema>
