import { z } from 'zod'
import { paginationSchema } from '@/lib/validation/schemas'

export const customerSegmentSchema = z.enum([
  'retail',
  'wholesale',
  'export',
  'restaurant',
  'cooperative',
])

export const customerStatusSchema = z.enum(['active', 'inactive', 'prospect'])

export const customerCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  segment: customerSegmentSchema.default('retail'),
  status: customerStatusSchema.default('active'),
  notes: z.string().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
})

export const customerListQuerySchema = paginationSchema.extend({
  segment: customerSegmentSchema.optional(),
  status: customerStatusSchema.optional(),
})

export const customerUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  segment: customerSegmentSchema.optional(),
  status: customerStatusSchema.optional(),
  notes: z.string().optional().nullable(),
})


export const leadStageSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
])

export const leadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
  stage: leadStageSchema.default('new'),
  estimatedValue: z.number().min(0).default(0),
  assignedTo: z.string().uuid().optional().nullable(),
})

export const leadListQuerySchema = paginationSchema.extend({
  stage: leadStageSchema.optional(),
})

export const leadUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional().nullable().or(z.literal('')),
    phone: z.string().max(30).optional().nullable(),
    source: z.string().max(80).optional().nullable(),
    stage: leadStageSchema.optional(),
    estimatedValue: z.number().min(0).optional(),
    assignedTo: z.string().uuid().optional().nullable(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field is required',
  })

export const activityTypeSchema = z.enum(['call', 'email', 'meeting', 'note', 'whatsapp'])

export const activityCreateSchema = z
  .object({
    customerId: z.string().uuid().optional().nullable(),
    leadId: z.string().uuid().optional().nullable(),
    activityType: activityTypeSchema,
    subject: z.string().min(1).max(255),
    body: z.string().optional().nullable(),
    scheduledAt: z.string().datetime().optional().nullable(),
    completedAt: z.string().datetime().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.customerId && !data.leadId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either customerId or leadId is required',
        path: ['customerId'],
      })
    }
  })

export const activityListQuerySchema = paginationSchema.extend({
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  activityType: activityTypeSchema.optional(),
})

export const campaignChannelSchema = z.enum(['email', 'sms', 'whatsapp', 'in_app'])
export const campaignStatusSchema = z.enum(['draft', 'scheduled', 'sent', 'cancelled'])

export const campaignCreateSchema = z.object({
  name: z.string().min(1).max(200),
  channel: campaignChannelSchema,
  status: campaignStatusSchema.default('draft'),
  subject: z.string().max(255).optional().nullable(),
  body: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
})

export const campaignUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  channel: campaignChannelSchema.optional(),
  status: campaignStatusSchema.optional(),
  subject: z.string().max(255).optional().nullable(),
  body: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
})

export const campaignListQuerySchema = paginationSchema.extend({
  status: campaignStatusSchema.optional(),
  channel: campaignChannelSchema.optional(),
})

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>
export type LeadCreateInput = z.infer<typeof leadCreateSchema>
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>
export type ActivityCreateInput = z.infer<typeof activityCreateSchema>
