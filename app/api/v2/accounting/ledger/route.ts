import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listGlAccounts,
  listJournalEntries,
  getLedgerSummary,
  createJournalEntry,
} from '@/lib/modules/accounting/service'
import { createJournalEntrySchema, ledgerQuerySchema } from '@/lib/modules/accounting/schemas'

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const parsed = ledgerQuerySchema.parse({
    resource: searchParams.get('resource') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    fromDate: searchParams.get('fromDate') ?? undefined,
    toDate: searchParams.get('toDate') ?? undefined,
    accountType: searchParams.get('accountType') ?? undefined,
  })

  const entryOpts = {
    status: parsed.status,
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
  }

  if (parsed.resource === 'summary') {
    const ctx = await requirePermission('accounting.reports.read')
    const summary = await getLedgerSummary(ctx.tenantId)
    return jsonOk({ summary })
  }

  const ctx = await requirePermission('accounting.ledger.read')

  if (parsed.resource === 'accounts') {
    let accounts = await listGlAccounts(ctx.tenantId)
    if (parsed.accountType) {
      accounts = accounts.filter((a) => a.type === parsed.accountType)
    }
    return jsonOk({ accounts })
  }

  if (parsed.resource === 'entries') {
    const { entries, total } = await listJournalEntries(
      ctx.tenantId,
      parsed.page,
      parsed.limit,
      entryOpts,
    )
    return jsonOk({
      entries,
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        totalPages: Math.ceil(total / parsed.limit) || 1,
      },
    })
  }

  let accounts = await listGlAccounts(ctx.tenantId)
  if (parsed.accountType) {
    accounts = accounts.filter((a) => a.type === parsed.accountType)
  }

  const { entries, total } = await listJournalEntries(
    ctx.tenantId,
    parsed.page,
    parsed.limit,
    entryOpts,
  )

  return jsonOk({
    accounts,
    entries,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/accounting/ledger')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = await request.json()
  const input = createJournalEntrySchema.parse(body)
  const entry = await createJournalEntry(ctx.tenantId, ctx.userId, input)
  return jsonOk({ entry }, 201)
}, 'v2/accounting/ledger')
