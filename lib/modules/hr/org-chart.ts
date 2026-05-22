import { query, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface OrgNode {
  id: string
  name: string
  parent_id: string | null
  children: OrgNode[]
  employees: { id: string; full_name: string; job_title: string | null }[]
}

export interface OrgUnitRow {
  id: string
  tenant_id: string
  name: string
  parent_id: string | null
}

export async function listOrgUnits(tenantId: string): Promise<OrgUnitRow[]> {
  return query<OrgUnitRow>(
    `SELECT * FROM hr_org_units WHERE ${tenantWhere()} ORDER BY name`,
    [tenantId],
  )
}

export async function createOrgUnit(
  tenantId: string,
  input: { name: string; parentId?: string },
) {
  const id = generateId()
  await execute(
    `INSERT INTO hr_org_units (id, tenant_id, name, parent_id) VALUES (?, ?, ?, ?)`,
    [id, tenantId, input.name, input.parentId ?? null],
  )
  return { id, tenant_id: tenantId, name: input.name, parent_id: input.parentId ?? null }
}

export async function getOrgChart(tenantId: string): Promise<OrgNode[]> {
  const units = await listOrgUnits(tenantId)
  const employees = await query<{
    id: string
    full_name: string
    job_title: string | null
    org_unit_id: string | null
    manager_employee_id: string | null
  }>(
    `SELECT id, full_name, job_title, org_unit_id, manager_employee_id
     FROM hr_employees WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )

  const byUnit = new Map<string | null, typeof employees>()
  for (const e of employees) {
    const key = e.org_unit_id
    if (!byUnit.has(key)) byUnit.set(key, [])
    byUnit.get(key)!.push(e)
  }

  const nodeMap = new Map<string, OrgNode>()
  for (const u of units) {
    nodeMap.set(u.id, {
      id: u.id,
      name: u.name,
      parent_id: u.parent_id,
      children: [],
      employees: (byUnit.get(u.id) ?? []).map((e) => ({
        id: e.id,
        full_name: e.full_name,
        job_title: e.job_title,
      })),
    })
  }

  const roots: OrgNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      nodeMap.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const unassigned = byUnit.get(null) ?? []
  if (unassigned.length > 0) {
    roots.push({
      id: 'unassigned',
      name: 'Unassigned',
      parent_id: null,
      children: [],
      employees: unassigned.map((e) => ({
        id: e.id,
        full_name: e.full_name,
        job_title: e.job_title,
      })),
    })
  }

  return roots
}
