import { z } from 'zod'

export const userRoleSchema = z.enum([
  'super_admin',
  'investor',
  'boat_owner',
  'fisherman',
  'fish_buyer',
  'bmu_official',
])

export const businessTypeSchema = z.enum([
  'fisherman',
  'cooperative',
  'processor',
  'market',
  'exporter',
])

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  recaptchaToken: z.string().min(1).optional(),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  organizationName: z.string().min(2, 'Organization name is required').max(200),
  /** Optional preferred subdomain (else derived from organization name) */
  tenantSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid subdomain format')
    .optional(),
  businessType: businessTypeSchema,
  role: userRoleSchema
    .refine((r) => r !== 'super_admin', 'Invalid role')
    .optional(),
  recaptchaToken: z.string().min(1).optional(),
})

export const boatCreateSchema = z.object({
  registrationNumber: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  lengthMeters: z.number().optional(),
  capacityKg: z.number().optional(),
  engineType: z.string().optional(),
  enginePowerHp: z.number().optional(),
  yearBuilt: z.number().optional(),
  gpsEnabled: z.boolean().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  notes: z.string().optional(),
  ownerId: z.string().uuid().optional(),
})

export const walletTransferSchema = z.object({
  action: z.literal('transfer'),
  recipientEmail: z.string().email(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
})

export const walletDepositSchema = z.object({
  action: z.literal('deposit'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const landingSiteCreateSchema = z.object({
  name: z.string().min(1),
  county: z.string().min(1),
  bmuId: z.string().uuid().optional().nullable(),
  code: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
})

export const licenseCreateSchema = z.object({
  userId: z.string().uuid(),
  licenseType: z.enum(['fishing', 'trading', 'transportation']),
  licenseNumber: z.string().min(1).optional(),
  issuedDate: z.string().optional(),
  expiresDate: z.string().min(1),
  issuingAuthority: z.string().optional(),
})

export const inventoryBatchCreateSchema = z.object({
  sku: z.string().min(1).max(80),
  productName: z.string().min(1).max(200),
  batchCode: z.string().min(1).max(80),
  quantityKg: z.number().positive('Quantity must be positive'),
  speciesId: z.string().uuid().optional().nullable(),
  storageType: z.enum(['fresh', 'frozen', 'dried']).default('fresh'),
  expiryDate: z.string().optional().nullable(),
  sourceType: z.enum(['catch', 'purchase', 'transfer', 'adjustment']).default('catch'),
  sourceId: z.string().uuid().optional().nullable(),
  status: z.enum(['available', 'reserved', 'depleted', 'spoiled']).optional(),
})
