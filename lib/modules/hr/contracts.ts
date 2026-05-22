import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export type ContractType = 'permanent' | 'contract' | 'casual'

export interface HrContract {
  id: string
  tenant_id: string
  employee_id: string
  contract_type: ContractType
  start_date: string
  end_date: string | null
  salary: number | null
  document_url: string | null
  created_at: string
  employee_name?: string
  employee_number?: string
}

export interface CreateContractInput {
  employeeId: string
  contractType: ContractType
  startDate: string
  endDate?: string
  salary?: number
  documentUrl?: string
}

export async function listContracts(
  tenantId: string,
  opts: { employeeId?: string; page?: number; limit?: number } = {},
): Promise<{ contracts: HrContract[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('c')]
  const params: unknown[] = [tenantId]

  if (opts.employeeId) {
    conditions.push('c.employee_id = ?')
    params.push(opts.employeeId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_contracts c ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const contracts = await query<HrContract>(
    `SELECT c.*, e.full_name as employee_name, e.employee_number
     FROM hr_contracts c
     JOIN hr_employees e ON c.employee_id = e.id
     ${where}
     ORDER BY c.start_date DESC, c.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { contracts, total }
}

export async function createContract(
  tenantId: string,
  input: CreateContractInput,
): Promise<HrContract> {
  const employee = await queryOne<{ id: string }>(
    `SELECT id FROM hr_employees WHERE id = ? AND ${tenantWhere()}`,
    [input.employeeId, tenantId],
  )
  if (!employee) {
    throw notFound('Employee not found')
  }

  const id = generateId()
  await execute(
    `INSERT INTO hr_contracts
     (id, tenant_id, employee_id, contract_type, start_date, end_date, salary, document_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.employeeId,
      input.contractType,
      input.startDate,
      input.endDate ?? null,
      input.salary ?? null,
      input.documentUrl ?? null,
    ],
  )

  const contract = await queryOne<HrContract>(
    `SELECT c.*, e.full_name as employee_name, e.employee_number
     FROM hr_contracts c
     JOIN hr_employees e ON c.employee_id = e.id
     WHERE c.id = ?`,
    [id],
  )
  if (!contract) {
    throw new Error('Failed to create contract')
  }
  return contract
}
