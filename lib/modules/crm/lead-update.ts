import { queryOne, execute } from '@/lib/db'
import { notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'
import type { LeadCreateInput } from './schemas'
import type { LeadRow } from './service'
import { resolveTenantId } from '@/lib/tenant'

export type LeadUpdateInput = Partial<
  Pick<LeadCreateInput, 'name' | 'email' | 'phone' | 'source' | 'stage' | 'estimatedValue' | 'assignedTo'>
>

export async function getLead(tenantId: string | null | undefined, leadId: string): Promise<LeadRow | null> {
  const tid = resolveTenantId(tenantId)
  return queryOne<LeadRow>(
    `SELECT * FROM crm_leads WHERE id = ? AND ${tenantWhere()}`,
    [leadId, tid],
  )
}

export async function updateLead(
  tenantId: string | null | undefined,
  leadId: string,
  input: LeadUpdateInput,
): Promise<LeadRow> {
  const tid = resolveTenantId(tenantId)
  const existing = await getLead(tid, leadId)
  if (!existing) throw notFound('Lead not found')

  const sets: string[] = []
  const params: unknown[] = []

  if (input.name !== undefined) {
    sets.push('name = ?')
    params.push(input.name)
  }
  if (input.email !== undefined) {
    sets.push('email = ?')
    params.push(input.email || null)
  }
  if (input.phone !== undefined) {
    sets.push('phone = ?')
    params.push(input.phone || null)
  }
  if (input.source !== undefined) {
    sets.push('source = ?')
    params.push(input.source || null)
  }
  if (input.stage !== undefined) {
    sets.push('stage = ?')
    params.push(input.stage)
  }
  if (input.estimatedValue !== undefined) {
    sets.push('estimated_value = ?')
    params.push(input.estimatedValue)
  }
  if (input.assignedTo !== undefined) {
    sets.push('assigned_to = ?')
    params.push(input.assignedTo || null)
  }

  if (sets.length === 0) return existing

  sets.push('updated_at = NOW()')
  params.push(leadId, tid)

  await execute(
    `UPDATE crm_leads SET ${sets.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
    params,
  )

  const lead = await getLead(tid, leadId)
  if (!lead) throw new Error('Failed to update lead')
  return lead
}
