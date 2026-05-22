import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export type PerformanceReviewStatus = 'draft' | 'submitted' | 'acknowledged'

export interface PerformanceReview {
  id: string
  tenant_id: string
  employee_id: string
  review_period: string
  rating: number
  goals: string | null
  feedback: string | null
  status: PerformanceReviewStatus
  reviewed_at: string | null
  created_at: string
  employee_name?: string
}

export interface CreatePerformanceReviewInput {
  employeeId: string
  reviewPeriod: string
  rating: number
  goals?: string
  feedback?: string
  status?: PerformanceReviewStatus
  reviewedAt?: string
}

export async function listPerformanceReviews(
  tenantId: string,
  filters?: { employeeId?: string; status?: PerformanceReviewStatus },
  page = 1,
  limit = 50,
): Promise<{ reviews: PerformanceReview[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('pr')]
  const params: unknown[] = [tenantId]

  if (filters?.employeeId) {
    conditions.push('pr.employee_id = ?')
    params.push(filters.employeeId)
  }
  if (filters?.status) {
    conditions.push('pr.status = ?')
    params.push(filters.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_performance_reviews pr ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const reviews = await query<PerformanceReview>(
    `SELECT pr.*, e.full_name as employee_name
     FROM hr_performance_reviews pr
     JOIN hr_employees e ON pr.employee_id = e.id
     ${where}
     ORDER BY pr.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { reviews, total }
}

export async function createPerformanceReview(
  tenantId: string,
  input: CreatePerformanceReviewInput,
): Promise<PerformanceReview> {
  const employee = await queryOne<{ id: string }>(
    `SELECT id FROM hr_employees WHERE id = ? AND ${tenantWhere()}`,
    [input.employeeId, tenantId],
  )
  if (!employee) throw new Error('Employee not found')

  const id = generateId()
  await execute(
    `INSERT INTO hr_performance_reviews
     (id, tenant_id, employee_id, review_period, rating, goals, feedback, status, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.employeeId,
      input.reviewPeriod,
      input.rating,
      input.goals ?? null,
      input.feedback ?? null,
      input.status ?? 'draft',
      input.reviewedAt ?? null,
    ],
  )

  const review = await queryOne<PerformanceReview>(
    `SELECT pr.*, e.full_name as employee_name
     FROM hr_performance_reviews pr
     JOIN hr_employees e ON pr.employee_id = e.id
     WHERE pr.id = ?`,
    [id],
  )
  if (!review) throw new Error('Failed to create performance review')
  return review
}
