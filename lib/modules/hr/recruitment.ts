import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export async function listJobPostings(tenantId: string) {
  return query(
    `SELECT j.*, (SELECT COUNT(*) FROM hr_applicants a WHERE a.job_id = j.id) as applicant_count
     FROM hr_job_postings j WHERE j.tenant_id = ?
     ORDER BY j.posted_at DESC`,
    [tenantId],
  )
}

export async function createJobPosting(
  tenantId: string,
  input: { title: string; department?: string; description?: string; postedAt: string },
) {
  const id = generateId()
  await execute(
    `INSERT INTO hr_job_postings (id, tenant_id, title, department, description, posted_at, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [id, tenantId, input.title, input.department ?? null, input.description ?? null, input.postedAt],
  )
  return queryOne(`SELECT * FROM hr_job_postings WHERE id = ?`, [id])
}

export async function listApplicants(tenantId: string, jobId?: string) {
  const conditions = [tenantWhere('a')]
  const params: unknown[] = [tenantId]
  if (jobId) {
    conditions.push('a.job_id = ?')
    params.push(jobId)
  }
  return query(
    `SELECT a.*, j.title as job_title FROM hr_applicants a
     JOIN hr_job_postings j ON a.job_id = j.id
     WHERE ${conditions.join(' AND ')} ORDER BY a.created_at DESC`,
    params,
  )
}

export async function createApplicant(
  tenantId: string,
  input: {
    jobId: string
    fullName: string
    email?: string
    phone?: string
    notes?: string
  },
) {
  const id = generateId()
  await execute(
    `INSERT INTO hr_applicants (id, tenant_id, job_id, full_name, email, phone, notes, stage)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'applied')`,
    [id, tenantId, input.jobId, input.fullName, input.email ?? null, input.phone ?? null, input.notes ?? null],
  )
  return queryOne(`SELECT * FROM hr_applicants WHERE id = ?`, [id])
}

export async function updateApplicantStage(
  tenantId: string,
  applicantId: string,
  stage: string,
) {
  const row = await queryOne(`SELECT id FROM hr_applicants WHERE id = ? AND ${tenantWhere()}`, [
    applicantId,
    tenantId,
  ])
  if (!row) throw notFound('Applicant not found')
  await execute(`UPDATE hr_applicants SET stage = ? WHERE id = ?`, [stage, applicantId])
  return queryOne(`SELECT * FROM hr_applicants WHERE id = ?`, [applicantId])
}
