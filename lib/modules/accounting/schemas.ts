import { z } from 'zod'

export const glAccountTypeSchema = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'])

export const journalLineInputSchema = z.object({
  accountId: z.string().min(1),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
  memo: z.string().max(255).optional(),
})

export const createJournalEntrySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'entryDate must be YYYY-MM-DD'),
  description: z.string().min(1).max(255),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
  lines: z.array(journalLineInputSchema).min(2, 'At least two lines are required'),
}).superRefine((data, ctx) => {
  let totalDebit = 0
  let totalCredit = 0
  for (let i = 0; i < data.lines.length; i++) {
    const line = data.lines[i]
    if (line.debit > 0 && line.credit > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A line cannot have both debit and credit',
        path: ['lines', i],
      })
    }
    if (line.debit === 0 && line.credit === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each line must have a debit or credit amount',
        path: ['lines', i],
      })
    }
    totalDebit += line.debit
    totalCredit += line.credit
  }
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Debits (${totalDebit}) must equal credits (${totalCredit})`,
      path: ['lines'],
    })
  }
})

export const ledgerQuerySchema = z.object({
  resource: z.enum(['accounts', 'entries', 'summary', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.string().optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
})

export const taxCodeTypeSchema = z.enum(['vat', 'withholding', 'excise', 'other'])

export const taxCodeCreateSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  ratePct: z.coerce.number().min(0).max(100),
  type: taxCodeTypeSchema.default('vat'),
  countryCode: z.string().length(2).default('KE'),
  active: z.boolean().default(true),
})

export const apInvoiceCreateSchema = z.object({
  supplierId: z.string().uuid().optional().nullable(),
  purchaseOrderId: z.string().uuid().optional().nullable(),
  grnId: z.string().uuid().optional().nullable(),
  invoiceNumber: z.string().min(1).max(50),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  currency: z.string().length(3).default('KES'),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  status: z.enum(['draft', 'approved', 'paid', 'void']).default('draft'),
})

export const arInvoiceCreateSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  orderId: z.string().uuid().optional().nullable(),
  invoiceNumber: z.string().min(1).max(50),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  currency: z.string().length(3).default('KES'),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'void']).default('draft'),
})

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
})

export const accountingReportQuerySchema = z.object({
  report: z.enum([
    'trial_balance',
    'profit_loss',
    'balance_sheet',
    'budget_vs_actual',
    'cash_flow',
    'equity',
  ]),
  fiscalYear: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const budgetPeriodSchema = z.enum(['monthly', 'quarterly', 'annual'])

export const budgetCreateSchema = z.object({
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
  accountId: z.string().uuid(),
  amount: z.coerce.number().min(0),
  period: budgetPeriodSchema.default('annual'),
})

export const budgetUpdateSchema = z.object({
  fiscalYear: z.coerce.number().int().min(2000).max(2100).optional(),
  accountId: z.string().uuid().optional(),
  amount: z.coerce.number().min(0).optional(),
  period: budgetPeriodSchema.optional(),
})

export const budgetListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  fiscalYear: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const bankReconciliationStatusSchema = z.enum(['draft', 'reconciled'])

export const bankReconciliationCreateSchema = z.object({
  statementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  openingBalance: z.coerce.number(),
  closingBalance: z.coerce.number(),
  status: bankReconciliationStatusSchema.default('draft'),
})

export const bankReconciliationUpdateSchema = z.object({
  statementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  openingBalance: z.coerce.number().optional(),
  closingBalance: z.coerce.number().optional(),
  status: bankReconciliationStatusSchema.optional(),
})

export const bankReconciliationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: bankReconciliationStatusSchema.optional(),
})

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>
export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>
export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>
export type BankReconciliationCreateInput = z.infer<typeof bankReconciliationCreateSchema>
export type BankReconciliationUpdateInput = z.infer<typeof bankReconciliationUpdateSchema>
export type JournalLineInput = z.infer<typeof journalLineInputSchema>
export type TaxCodeCreateInput = z.infer<typeof taxCodeCreateSchema>
export type ApInvoiceCreateInput = z.infer<typeof apInvoiceCreateSchema>
export type ArInvoiceCreateInput = z.infer<typeof arInvoiceCreateSchema>
