import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export type TrainingType = 'safety' | 'haccp' | 'equipment' | 'compliance' | 'other'

export interface TrainingRecord {
  id: string
  tenant_id: string
  employee_id: string | null
  title: string
  training_type: TrainingType
  completed_at: string | null
  expiry_at: string | null
  certificate_url: string | null
  created_at: string
  employee_name?: string
}

export interface CreateTrainingRecordInput {
  employeeId?: string
  title: string
  trainingType?: TrainingType
  completedAt?: string
  expiryAt?: string
  certificateUrl?: string
}

export async function listTrainingRecords(
  tenantId: string,
  filters?: { employeeId?: string; trainingType?: TrainingType },
  page = 1,
  limit = 50,
): Promise<{ records: TrainingRecord[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('tr')]
  const params: unknown[] = [tenantId]

  if (filters?.employeeId) {
    conditions.push('tr.employee_id = ?')
    params.push(filters.employeeId)
  }
  if (filters?.trainingType) {
    conditions.push('tr.training_type = ?')
    params.push(filters.trainingType)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_training_records tr ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const records = await query<TrainingRecord>(
    `SELECT tr.*, e.full_name as employee_name
     FROM hr_training_records tr
     LEFT JOIN hr_employees e ON tr.employee_id = e.id
     ${where}
     ORDER BY tr.completed_at DESC, tr.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { records, total }
}

export async function createTrainingRecord(
  tenantId: string,
  input: CreateTrainingRecordInput,
): Promise<TrainingRecord> {
  if (input.employeeId) {
    const employee = await queryOne<{ id: string }>(
      `SELECT id FROM hr_employees WHERE id = ? AND ${tenantWhere()}`,
      [input.employeeId, tenantId],
    )
    if (!employee) throw new Error('Employee not found')
  }

  const id = generateId()
  await execute(
    `INSERT INTO hr_training_records
     (id, tenant_id, employee_id, title, training_type, completed_at, expiry_at, certificate_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.employeeId ?? null,
      input.title,
      input.trainingType ?? 'safety',
      input.completedAt ?? null,
      input.expiryAt ?? null,
      input.certificateUrl ?? null,
    ],
  )

  const record = await queryOne<TrainingRecord>(
    `SELECT tr.*, e.full_name as employee_name
     FROM hr_training_records tr
     LEFT JOIN hr_employees e ON tr.employee_id = e.id
     WHERE tr.id = ?`,
    [id],
  )
  if (!record) throw new Error('Failed to create training record')
  return record
}
