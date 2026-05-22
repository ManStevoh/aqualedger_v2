import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface WorkflowRule {
  id: string
  tenant_id: string
  name: string
  trigger_event: string
  conditions: string | Record<string, unknown> | null
  actions: string | Record<string, unknown>[]
  active: number
  created_at: string
}

export interface CreateWorkflowRuleInput {
  name: string
  triggerEvent: string
  conditions?: Record<string, unknown>
  actions: Record<string, unknown>[]
  active?: boolean
}

export async function listWorkflowRules(tenantId: string): Promise<WorkflowRule[]> {
  return query<WorkflowRule>(
    `SELECT * FROM workflow_rules WHERE ${tenantWhere()} ORDER BY created_at DESC`,
    [tenantId],
  )
}

export async function createWorkflowRule(
  tenantId: string,
  input: CreateWorkflowRuleInput,
): Promise<WorkflowRule> {
  const id = generateId()
  await execute(
    `INSERT INTO workflow_rules (id, tenant_id, name, trigger_event, conditions, actions, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.name,
      input.triggerEvent,
      input.conditions ? JSON.stringify(input.conditions) : null,
      JSON.stringify(input.actions),
      input.active !== false ? 1 : 0,
    ],
  )

  const rule = await queryOne<WorkflowRule>(
    `SELECT * FROM workflow_rules WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!rule) throw new Error('Failed to create workflow rule')
  return rule
}
