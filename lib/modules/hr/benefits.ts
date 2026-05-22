import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function listBenefitPlans(tenantId: string) {
  return query(
    `SELECT * FROM hr_benefit_plans WHERE ${tenantWhere()} ORDER BY name`,
    [tenantId],
  )
}

export async function createBenefitPlan(
  tenantId: string,
  input: {
    name: string
    planType: string
    employerContributionPct?: number
    employeeContributionPct?: number
  },
) {
  const id = generateId()
  await execute(
    `INSERT INTO hr_benefit_plans (id, tenant_id, name, plan_type, employer_contribution_pct, employee_contribution_pct)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.name,
      input.planType,
      input.employerContributionPct ?? 0,
      input.employeeContributionPct ?? 0,
    ],
  )
  return queryOne(`SELECT * FROM hr_benefit_plans WHERE id = ?`, [id])
}

export async function listEmployeeBenefits(tenantId: string) {
  return query(
    `SELECT eb.*, e.full_name as employee_name, p.name as plan_name, p.plan_type
     FROM hr_employee_benefits eb
     JOIN hr_employees e ON eb.employee_id = e.id
     JOIN hr_benefit_plans p ON eb.plan_id = p.id
     WHERE eb.tenant_id = ?
     ORDER BY eb.enrolled_at DESC`,
    [tenantId],
  )
}

export async function enrollEmployeeBenefit(
  tenantId: string,
  input: { employeeId: string; planId: string; enrolledAt: string },
) {
  const id = generateId()
  await execute(
    `INSERT INTO hr_employee_benefits (id, tenant_id, employee_id, plan_id, enrolled_at, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [id, tenantId, input.employeeId, input.planId, input.enrolledAt],
  )
  return queryOne(`SELECT * FROM hr_employee_benefits WHERE id = ?`, [id])
}
