import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated'
export type PayrollStatus = 'draft' | 'approved' | 'paid'

export interface Employee {
  id: string
  tenant_id: string
  user_id: string | null
  employee_number: string
  full_name: string
  department: string | null
  job_title: string | null
  hire_date: string | null
  salary: number | null
  status: EmployeeStatus
  created_at: string
  updated_at: string
}

export interface PayrollRun {
  id: string
  tenant_id: string
  period_start: string
  period_end: string
  status: PayrollStatus
  total_gross: number
  total_net: number
  created_at: string
}

export interface CreateEmployeeInput {
  employeeNumber?: string
  fullName: string
  department?: string
  jobTitle?: string
  hireDate?: string
  salary?: number
  userId?: string
  status?: EmployeeStatus
}

function nextEmployeeNumber(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `EMP-${suffix}`
}

export async function listEmployees(
  tenantId: string,
  page = 1,
  limit = 50,
): Promise<{ employees: Employee[]; total: number }> {
  const pagination = buildPagination(page, limit)

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_employees WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const total = countRow?.total ?? 0

  const employees = await query<Employee>(
    `SELECT * FROM hr_employees WHERE ${tenantWhere()}
     ORDER BY full_name ASC
     ${pagination.clause}`,
    [tenantId],
  )

  return { employees, total }
}

export async function createEmployee(
  tenantId: string,
  input: CreateEmployeeInput,
): Promise<Employee> {
  const id = generateId()
  const employeeNumber = input.employeeNumber?.trim() || nextEmployeeNumber()

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM hr_employees WHERE ${tenantWhere()} AND employee_number = ?`,
    [tenantId, employeeNumber],
  )
  if (existing) {
    throw new Error('Employee number already exists')
  }

  await execute(
    `INSERT INTO hr_employees
     (id, tenant_id, user_id, employee_number, full_name, department, job_title, hire_date, salary, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.userId ?? null,
      employeeNumber,
      input.fullName,
      input.department ?? null,
      input.jobTitle ?? null,
      input.hireDate ?? null,
      input.salary ?? null,
      input.status ?? 'active',
    ],
  )

  const employee = await queryOne<Employee>(
    `SELECT * FROM hr_employees WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!employee) {
    throw new Error('Failed to create employee')
  }
  return employee
}

export async function listPayrollRuns(
  tenantId: string,
  page = 1,
  limit = 50,
): Promise<{ payrollRuns: PayrollRun[]; total: number }> {
  const pagination = buildPagination(page, limit)

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_payroll_runs WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const total = countRow?.total ?? 0

  const payrollRuns = await query<PayrollRun>(
    `SELECT * FROM hr_payroll_runs WHERE ${tenantWhere()}
     ORDER BY period_end DESC, created_at DESC
     ${pagination.clause}`,
    [tenantId],
  )

  return { payrollRuns, total }
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day'
export type LeaveType = 'annual' | 'sick' | 'maternity' | 'unpaid' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface AttendanceRecord {
  id: string
  tenant_id: string
  employee_id: string
  work_date: string
  check_in: string | null
  check_out: string | null
  hours_worked: number | null
  status: AttendanceStatus
  employee_name?: string
}

export interface LeaveRequest {
  id: string
  tenant_id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  days: number
  status: LeaveStatus
  reason: string | null
  created_at: string
  employee_name?: string
}

export interface RecordAttendanceInput {
  employeeId: string
  workDate: string
  checkIn?: string
  checkOut?: string
  hoursWorked?: number
  status?: AttendanceStatus
}

export interface CreateLeaveInput {
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  days: number
  reason?: string
}

function computeHoursWorked(checkIn?: string, checkOut?: string): number | null {
  if (!checkIn || !checkOut) return null
  const [inH, inM] = checkIn.split(':').map(Number)
  const [outH, outM] = checkOut.split(':').map(Number)
  const minutes = outH * 60 + outM - (inH * 60 + inM)
  return minutes > 0 ? Math.round((minutes / 60) * 100) / 100 : null
}

export async function listAttendance(
  tenantId: string,
  employeeId?: string,
  page = 1,
  limit = 50,
): Promise<{ records: AttendanceRecord[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('a')]
  const params: unknown[] = [tenantId]

  if (employeeId) {
    conditions.push('a.employee_id = ?')
    params.push(employeeId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_attendance a ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const records = await query<AttendanceRecord>(
    `SELECT a.*, e.full_name as employee_name
     FROM hr_attendance a
     JOIN hr_employees e ON a.employee_id = e.id
     ${where}
     ORDER BY a.work_date DESC, e.full_name ASC
     ${pagination.clause}`,
    params,
  )

  return { records, total }
}

export async function recordAttendance(
  tenantId: string,
  input: RecordAttendanceInput,
): Promise<AttendanceRecord> {
  const employee = await queryOne<{ id: string }>(
    `SELECT id FROM hr_employees WHERE id = ? AND ${tenantWhere()}`,
    [input.employeeId, tenantId],
  )
  if (!employee) {
    throw new Error('Employee not found')
  }

  const hoursWorked =
    input.hoursWorked ?? computeHoursWorked(input.checkIn, input.checkOut)

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM hr_attendance WHERE employee_id = ? AND work_date = ?`,
    [input.employeeId, input.workDate],
  )

  if (existing) {
    await execute(
      `UPDATE hr_attendance
       SET check_in = ?, check_out = ?, hours_worked = ?, status = ?
       WHERE id = ? AND ${tenantWhere()}`,
      [
        input.checkIn ?? null,
        input.checkOut ?? null,
        hoursWorked,
        input.status ?? 'present',
        existing.id,
        tenantId,
      ],
    )
    const updated = await queryOne<AttendanceRecord>(
      `SELECT a.*, e.full_name as employee_name
       FROM hr_attendance a
       JOIN hr_employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [existing.id],
    )
    if (!updated) throw new Error('Failed to update attendance')
    return updated
  }

  const id = generateId()
  await execute(
    `INSERT INTO hr_attendance
     (id, tenant_id, employee_id, work_date, check_in, check_out, hours_worked, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.employeeId,
      input.workDate,
      input.checkIn ?? null,
      input.checkOut ?? null,
      hoursWorked,
      input.status ?? 'present',
    ],
  )

  const record = await queryOne<AttendanceRecord>(
    `SELECT a.*, e.full_name as employee_name
     FROM hr_attendance a
     JOIN hr_employees e ON a.employee_id = e.id
     WHERE a.id = ?`,
    [id],
  )
  if (!record) throw new Error('Failed to record attendance')
  return record
}

export async function listLeaveRequests(
  tenantId: string,
  filters?: { employeeId?: string; status?: LeaveStatus },
  page = 1,
  limit = 50,
): Promise<{ requests: LeaveRequest[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('lr')]
  const params: unknown[] = [tenantId]

  if (filters?.employeeId) {
    conditions.push('lr.employee_id = ?')
    params.push(filters.employeeId)
  }
  if (filters?.status) {
    conditions.push('lr.status = ?')
    params.push(filters.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_leave_requests lr ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const requests = await query<LeaveRequest>(
    `SELECT lr.*, e.full_name as employee_name
     FROM hr_leave_requests lr
     JOIN hr_employees e ON lr.employee_id = e.id
     ${where}
     ORDER BY lr.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { requests, total }
}

export async function createLeaveRequest(
  tenantId: string,
  input: CreateLeaveInput,
): Promise<LeaveRequest> {
  const employee = await queryOne<{ id: string }>(
    `SELECT id FROM hr_employees WHERE id = ? AND ${tenantWhere()}`,
    [input.employeeId, tenantId],
  )
  if (!employee) {
    throw new Error('Employee not found')
  }

  const id = generateId()
  await execute(
    `INSERT INTO hr_leave_requests
     (id, tenant_id, employee_id, leave_type, start_date, end_date, days, reason, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      tenantId,
      input.employeeId,
      input.leaveType,
      input.startDate,
      input.endDate,
      input.days,
      input.reason ?? null,
    ],
  )

  const request = await queryOne<LeaveRequest>(
    `SELECT lr.*, e.full_name as employee_name
     FROM hr_leave_requests lr
     JOIN hr_employees e ON lr.employee_id = e.id
     WHERE lr.id = ?`,
    [id],
  )
  if (!request) throw new Error('Failed to create leave request')
  return request
}

export async function approveLeaveRequest(
  tenantId: string,
  requestId: string,
  approved: boolean,
): Promise<LeaveRequest> {
  const existing = await queryOne<LeaveRequest>(
    `SELECT * FROM hr_leave_requests WHERE id = ? AND ${tenantWhere()}`,
    [requestId, tenantId],
  )
  if (!existing) {
    throw new Error('Leave request not found')
  }
  if (existing.status !== 'pending') {
    throw new Error('Leave request is not pending')
  }

  const status: LeaveStatus = approved ? 'approved' : 'rejected'
  await execute(
    `UPDATE hr_leave_requests SET status = ? WHERE id = ? AND ${tenantWhere()}`,
    [status, requestId, tenantId],
  )

  if (approved) {
    await execute(
      `UPDATE hr_employees SET status = 'on_leave' WHERE id = ? AND ${tenantWhere()}`,
      [existing.employee_id, tenantId],
    )
  }

  const request = await queryOne<LeaveRequest>(
    `SELECT lr.*, e.full_name as employee_name
     FROM hr_leave_requests lr
     JOIN hr_employees e ON lr.employee_id = e.id
     WHERE lr.id = ?`,
    [requestId],
  )
  if (!request) throw new Error('Failed to update leave request')
  return request
}
