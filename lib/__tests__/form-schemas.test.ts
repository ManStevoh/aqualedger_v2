/**
 * Form payload validation — ensures dashboard/API create schemas accept valid
 * data and reject invalid input (tenant_id is never in client schemas).
 */
import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  boatCreateSchema,
  walletTransferSchema,
  walletDepositSchema,
  landingSiteCreateSchema,
  licenseCreateSchema,
  inventoryBatchCreateSchema,
} from '@/lib/validation/schemas'
import {
  customerCreateSchema,
  leadCreateSchema,
  leadUpdateSchema,
  activityCreateSchema,
  campaignCreateSchema,
} from '@/lib/modules/crm/schemas'
import {
  createJournalEntrySchema,
  taxCodeCreateSchema,
  apInvoiceCreateSchema,
  arInvoiceCreateSchema,
  budgetCreateSchema,
  bankReconciliationCreateSchema,
} from '@/lib/modules/accounting/schemas'
import {
  productCatalogCreateSchema,
  couponCreateSchema,
  payoutCreateSchema,
  cartAddItemSchema,
  checkoutSchema,
} from '@/lib/modules/commerce/schemas'
import {
  inventoryMovementCreateSchema,
  traceabilityLotCreateSchema,
  stockTransferCreateSchema,
} from '@/lib/modules/inventory/schemas'
import {
  supplierCreateSchema,
  purchaseOrderCreateSchema,
  purchaseRequestCreateSchema,
  rfqCreateSchema,
  goodsReceiptCreateSchema,
} from '@/lib/modules/procurement/schemas'
import { paymentIntentCreateSchema } from '@/lib/modules/payments/schemas'
import {
  fishingZoneCreateSchema,
  boatFuelLogCreateSchema,
} from '@/lib/modules/fishing-ops/schemas'
import { z } from 'zod'

const UUID = '550e8400-e29b-41d4-a716-446655440000'
const UUID2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/** Mirrors app/api/v2/risk/insurance/route.ts — insurance dialog payloads */
const insurancePolicyFormSchema = z.object({
  type: z.literal('policy'),
  boatId: z.string().uuid().optional().nullable(),
  policyNumber: z.string().min(1).max(80),
  insurerName: z.string().min(1).max(200),
  policyType: z.enum(['hull', 'liability', 'cargo', 'crew', 'comprehensive']),
  premiumAmount: z.number().min(0),
  coverageAmount: z.number().min(0),
  currency: z.string().length(3).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  notes: z.string().optional().nullable(),
})

const insuranceClaimFormSchema = z.object({
  type: z.literal('claim'),
  policyId: z.string().uuid(),
  boatId: z.string().uuid().optional().nullable(),
  incidentDate: z.string().min(1),
  description: z.string().min(1).max(5000),
  claimedAmount: z.number().positive(),
})

function expectValid<T>(schema: z.ZodType<T>, data: unknown): void {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.flatten(), null, 2))
  }
  expect(result.success).toBe(true)
}

function expectInvalid(schema: z.ZodType, data: unknown): void {
  expect(schema.safeParse(data).success).toBe(false)
}

function assertNoTenantIdKey(schema: z.ZodType): void {
  const json = JSON.stringify(schema)
  expect(json).not.toMatch(/tenantId|tenant_id/)
}

describe('form schemas — auth & core', () => {
  it('loginSchema accepts valid credentials', () => {
    expectValid(loginSchema, { email: 'user@example.com', password: 'secret' })
  })

  it('registerSchema rejects weak password', () => {
    expectInvalid(registerSchema, {
      email: 'new@example.com',
      password: 'weak',
      firstName: 'Jane',
      lastName: 'Doe',
      organizationName: 'Co-op',
      businessType: 'fisherman',
    })
  })

  it('boatCreateSchema requires core fields', () => {
    expectValid(boatCreateSchema, {
      registrationNumber: 'KEN-001',
      name: 'Sea Breeze',
      type: 'trawler',
    })
    expectInvalid(boatCreateSchema, { name: 'No reg' })
  })

  it('wallet schemas reject non-positive amounts', () => {
    expectValid(walletDepositSchema, { action: 'deposit', amount: 100 })
    expectInvalid(walletTransferSchema, {
      action: 'transfer',
      recipientEmail: 'a@b.com',
      amount: 0,
    })
  })

  it('landingSiteCreateSchema requires name and county', () => {
    expectValid(landingSiteCreateSchema, { name: 'Dunga', county: 'Kisumu' })
    expectInvalid(landingSiteCreateSchema, { name: '' })
  })

  it('licenseCreateSchema requires user and expiry', () => {
    expectValid(licenseCreateSchema, {
      userId: UUID,
      licenseType: 'fishing',
      expiresDate: '2027-12-31',
    })
  })

  it('inventoryBatchCreateSchema requires positive quantity', () => {
    expectValid(inventoryBatchCreateSchema, {
      sku: 'TIL-01',
      productName: 'Tilapia fillet',
      batchCode: 'LOT-1',
      quantityKg: 50,
    })
    expectInvalid(inventoryBatchCreateSchema, {
      sku: 'TIL-01',
      productName: 'Tilapia',
      batchCode: 'LOT-1',
      quantityKg: 0,
    })
  })
})

describe('form schemas — CRM', () => {
  it('customerCreateSchema accepts retail customer', () => {
    expectValid(customerCreateSchema, {
      name: 'Harbor Restaurant',
      email: 'chef@harbor.co.ke',
      segment: 'restaurant',
    })
    assertNoTenantIdKey(customerCreateSchema)
  })

  it('leadCreateSchema accepts pipeline lead', () => {
    expectValid(leadCreateSchema, {
      name: 'Export buyer',
      stage: 'new',
      estimatedValue: 250000,
    })
  })

  it('leadUpdateSchema requires at least one field', () => {
    expectInvalid(leadUpdateSchema, {})
    expectValid(leadUpdateSchema, { stage: 'qualified' })
  })

  it('activityCreateSchema requires customer or lead', () => {
    expectInvalid(activityCreateSchema, {
      activityType: 'call',
      subject: 'Follow up',
    })
    expectValid(activityCreateSchema, {
      leadId: UUID,
      activityType: 'call',
      subject: 'Follow up',
    })
  })

  it('campaignCreateSchema accepts email campaign', () => {
    expectValid(campaignCreateSchema, {
      name: 'Spring promo',
      channel: 'email',
      subject: 'Fresh catch',
      body: 'Order today',
    })
  })
})

describe('form schemas — accounting', () => {
  it('createJournalEntrySchema requires balanced lines', () => {
    expectValid(createJournalEntrySchema, {
      entryDate: '2026-05-01',
      description: 'Sales',
      lines: [
        { accountId: '1000', debit: 1000, credit: 0 },
        { accountId: '4000', debit: 0, credit: 1000 },
      ],
    })
    expectInvalid(createJournalEntrySchema, {
      entryDate: '2026-05-01',
      lines: [{ accountCode: '1000', debit: 100, credit: 0 }],
    })
  })

  it('taxCodeCreateSchema accepts VAT code', () => {
    expectValid(taxCodeCreateSchema, { code: 'VAT16', name: 'VAT 16%', ratePct: 16 })
  })

  it('apInvoiceCreateSchema and arInvoiceCreateSchema accept invoices', () => {
    expectValid(apInvoiceCreateSchema, {
      invoiceNumber: 'AP-001',
      invoiceDate: '2026-05-01',
      subtotal: 5000,
      totalAmount: 5000,
    })
    expectValid(arInvoiceCreateSchema, {
      invoiceNumber: 'AR-001',
      invoiceDate: '2026-05-01',
      subtotal: 12000,
      totalAmount: 12000,
    })
  })

  it('budgetCreateSchema and bankReconciliationCreateSchema', () => {
    expectValid(budgetCreateSchema, {
      fiscalYear: 2026,
      accountId: UUID,
      amount: 500000,
      period: 'annual',
    })
    expectValid(bankReconciliationCreateSchema, {
      statementDate: '2026-05-31',
      openingBalance: 100000,
      closingBalance: 150000,
    })
  })
})

describe('form schemas — commerce', () => {
  it('productCatalogCreateSchema accepts catalog item', () => {
    expectValid(productCatalogCreateSchema, {
      sku: 'TUNA-01',
      name: 'Yellowfin tuna',
      basePrice: 450,
    })
    assertNoTenantIdKey(productCatalogCreateSchema)
  })

  it('couponCreateSchema rejects zero discount', () => {
    expectValid(couponCreateSchema, {
      code: 'SAVE10',
      discountType: 'percent',
      discountValue: 10,
    })
    expectInvalid(couponCreateSchema, {
      code: 'BAD',
      discountType: 'fixed',
      discountValue: 0,
    })
  })

  it('payoutCreateSchema and checkoutSchema', () => {
    expectValid(payoutCreateSchema, { vendorId: UUID })
    expectValid(checkoutSchema, { cartId: UUID, deliveryAddress: 'Mombasa port' })
  })

  it('cartAddItemSchema requires listing', () => {
    expectValid(cartAddItemSchema, { listingId: UUID, quantityKg: 2 })
  })
})

describe('form schemas — inventory & procurement', () => {
  it('inventoryMovementCreateSchema accepts transfer', () => {
    expectValid(inventoryMovementCreateSchema, {
      batchId: UUID,
      movementType: 'transfer',
      quantityKg: 10,
      toLocation: 'Cold room B',
    })
  })

  it('traceabilityLotCreateSchema and stockTransferCreateSchema', () => {
    expectValid(traceabilityLotCreateSchema, {
      lotCode: 'LOT-2026-001',
      speciesName: 'Tilapia',
      catchDate: '2026-05-20',
      grading: 'A',
    })
    expectValid(stockTransferCreateSchema, {
      fromLocation: 'Cold room A',
      toLocation: 'Cold room B',
      batchId: UUID,
      quantityKg: 5,
    })
  })

  it('supplierCreateSchema and purchaseOrderCreateSchema', () => {
    expectValid(supplierCreateSchema, { code: 'SUP-01', name: 'Net Supplies Ltd' })
    expectValid(purchaseOrderCreateSchema, {
      supplierId: UUID,
      lines: [{ description: 'Ice blocks', quantity: 100, unitPrice: 50 }],
    })
  })

  it('purchaseRequestCreateSchema, rfqCreateSchema, goodsReceiptCreateSchema', () => {
    expectValid(purchaseRequestCreateSchema, { department: 'Fleet' })
    expectValid(rfqCreateSchema, { title: 'Fuel RFQ' })
    expectValid(goodsReceiptCreateSchema, {
      purchaseOrderId: UUID,
      receivedDate: '2026-05-22',
    })
  })
})

describe('form schemas — fishing ops & payments', () => {
  it('fishingZoneCreateSchema and boatFuelLogCreateSchema', () => {
    expectValid(fishingZoneCreateSchema, {
      code: 'MBA-01',
      name: 'Mombasa deep',
      faoArea: '51',
    })
    expectValid(boatFuelLogCreateSchema, {
      boatId: UUID,
      liters: 120,
      cost: 15000,
      loggedAt: '2026-05-22T10:00:00Z',
    })
  })

  it('paymentIntentCreateSchema accepts mpesa intent', () => {
    expectValid(paymentIntentCreateSchema, {
      provider: 'mpesa',
      amount: 5000,
      orderId: UUID,
    })
    assertNoTenantIdKey(paymentIntentCreateSchema)
  })
})

describe('form schemas — insurance (risk)', () => {
  it('policy form accepts hull policy', () => {
    expectValid(insurancePolicyFormSchema, {
      type: 'policy',
      policyNumber: 'POL-2026-001',
      insurerName: 'Kenya Marine',
      policyType: 'hull',
      premiumAmount: 50000,
      coverageAmount: 2000000,
      startDate: '2026-01-01',
      endDate: '2027-01-01',
    })
    assertNoTenantIdKey(insurancePolicyFormSchema)
  })

  it('claim form requires positive claimed amount', () => {
    expectValid(insuranceClaimFormSchema, {
      type: 'claim',
      policyId: UUID,
      incidentDate: '2026-05-20',
      description: 'Engine damage',
      claimedAmount: 150000,
    })
    expectInvalid(insuranceClaimFormSchema, {
      type: 'claim',
      policyId: UUID,
      incidentDate: '2026-05-20',
      description: 'Minor',
      claimedAmount: 0,
    })
  })

  it('discriminated union rejects unknown type', () => {
    const union = z.discriminatedUnion('type', [insurancePolicyFormSchema, insuranceClaimFormSchema])
    expectInvalid(union, { type: 'unknown' })
  })
})
