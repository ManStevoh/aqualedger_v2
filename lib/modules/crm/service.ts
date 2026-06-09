import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { notFound, conflict } from '@/lib/api-handler'
import { dispatchNotification } from '@/lib/notifications/dispatch'
import { resolveTenantId, tenantWhere } from '@/lib/tenant'
import type {
  CustomerCreateInput,
  CustomerUpdateInput,
  LeadCreateInput,
  ActivityCreateInput,
  CampaignCreateInput,
  CampaignUpdateInput,
} from './schemas'

export interface CustomerRow {
  id: string
  tenant_id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string | null
  segment: string
  lifetime_value: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LeadRow {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: string
  estimated_value: number
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export async function listCustomers(
  tenantId?: string | null,
  opts: { segment?: string; status?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)

  // Outer conditions applied to the UNION results
  const outerConditions: string[] = []
  const outerParams: unknown[] = []

  if (opts.segment) {
    outerConditions.push('c.segment = ?')
    outerParams.push(opts.segment)
  }
  if (opts.status) {
    outerConditions.push('c.status = ?')
    outerParams.push(opts.status)
  }

  const outerWhere = outerConditions.length > 0 ? `WHERE ${outerConditions.join(' AND ')}` : ''

  // Subquery params (each subquery uses `tid`)
  const subQueryParams = [tid, tid, tid]

  const unionQuery = `
    SELECT 
      COALESCE(cc.id, CONCAT('tm-', tm.id)) as id,
      tm.tenant_id,
      tm.user_id,
      COALESCE(cc.name, CONCAT(u.first_name, ' ', u.last_name)) as name,
      COALESCE(cc.email, u.email) as email,
      COALESCE(cc.phone, u.phone) as phone,
      COALESCE(cc.segment, 'retail') as segment,
      COALESCE(
        (SELECT SUM(total) FROM orders WHERE buyer_id = tm.user_id AND status = 'delivered'),
        cc.lifetime_value,
        0
      ) as lifetime_value,
      COALESCE(cc.status, 'active') as status,
      cc.notes,
      COALESCE(cc.created_at, tm.joined_at) as created_at,
      cs.score as credit_score,
      cs.grade as credit_grade
    FROM tenant_members tm
    JOIN users u ON tm.user_id = u.id
    LEFT JOIN crm_customers cc ON cc.user_id = tm.user_id AND cc.tenant_id = tm.tenant_id
    LEFT JOIN credit_scores cs ON cs.user_id = tm.user_id
    WHERE tm.tenant_id = ? AND tm.role = 'customer'

    UNION ALL

    SELECT 
      cc.id,
      cc.tenant_id,
      cc.user_id,
      cc.name,
      cc.email,
      cc.phone,
      cc.segment,
      cc.lifetime_value,
      cc.status,
      cc.notes,
      cc.created_at,
      cs.score as credit_score,
      cs.grade as credit_grade
    FROM crm_customers cc
    LEFT JOIN credit_scores cs ON cs.user_id = cc.user_id
    WHERE cc.tenant_id = ? AND (cc.user_id IS NULL OR cc.user_id NOT IN (
      SELECT tm2.user_id FROM tenant_members tm2 WHERE tm2.tenant_id = ? AND tm2.role = 'customer'
    ))
  `

  const countParams = [...subQueryParams, ...outerParams]
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM (${unionQuery}) as c ${outerWhere}`,
    countParams,
  )
  const total = countRow?.total || 0

  const selectParams = [...subQueryParams, ...outerParams]
  const customers = await query<any>(
    `SELECT * FROM (${unionQuery}) as c ${outerWhere} ORDER BY c.name ASC ${pagination.clause}`,
    selectParams,
  )

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createCustomer(
  tenantId: string | null | undefined,
  input: CustomerCreateInput,
): Promise<CustomerRow> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()

  await execute(
    `INSERT INTO crm_customers (id, tenant_id, user_id, name, email, phone, segment, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.userId || null,
      input.name,
      input.email || null,
      input.phone || null,
      input.segment,
      input.status,
      input.notes || null,
    ],
  )

  const customer = await queryOne<CustomerRow>('SELECT * FROM crm_customers WHERE id = ?', [id])
  if (!customer) throw new Error('Failed to create customer')
  return customer
}

export async function updateCustomer(
  tenantId: string | null | undefined,
  customerId: string,
  input: CustomerUpdateInput,
): Promise<CustomerRow> {
  const tid = resolveTenantId(tenantId)

  // Check if it's a tenant_member id (tm-...)
  let id = customerId
  let isNewCrmRow = false

  let existing = await queryOne<CustomerRow>(
    `SELECT * FROM crm_customers WHERE id = ? AND tenant_id = ?`,
    [id, tid],
  )

  if (!existing && id.startsWith('tm-')) {
    // It's a storefront/portal customer. Let's find their user details.
    const memberId = id.slice(3) // remove 'tm-' prefix
    const tm = await queryOne<{ user_id: string; email: string; first_name: string; last_name: string; phone: string | null }>(
      `SELECT tm.user_id, u.email, u.first_name, u.last_name, u.phone
       FROM tenant_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.id = ? AND tm.tenant_id = ?`,
      [memberId, tid],
    )
    if (!tm) throw notFound('Customer not found')

    // Create a new crm_customers row
    id = generateId()
    await execute(
      `INSERT INTO crm_customers (id, tenant_id, user_id, name, email, phone, segment, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tid,
        tm.user_id,
        input.name ?? `${tm.first_name} ${tm.last_name}`.trim(),
        input.email !== undefined ? input.email : tm.email,
        input.phone !== undefined ? input.phone : tm.phone,
        input.segment ?? 'retail',
        input.status ?? 'active',
        input.notes ?? null,
      ],
    )
    isNewCrmRow = true
  } else if (!existing) {
    throw notFound('Customer not found')
  }

  if (!isNewCrmRow) {
    const sets: string[] = []
    const params: unknown[] = []

    if (input.name !== undefined) {
      sets.push('name = ?')
      params.push(input.name)
    }
    if (input.email !== undefined) {
      sets.push('email = ?')
      params.push(input.email)
    }
    if (input.phone !== undefined) {
      sets.push('phone = ?')
      params.push(input.phone)
    }
    if (input.segment !== undefined) {
      sets.push('segment = ?')
      params.push(input.segment)
    }
    if (input.status !== undefined) {
      sets.push('status = ?')
      params.push(input.status)
    }
    if (input.notes !== undefined) {
      sets.push('notes = ?')
      params.push(input.notes)
    }

    if (sets.length > 0) {
      params.push(id, tid)
      await execute(
        `UPDATE crm_customers SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
        params,
      )
    }
  }

  const customer = await queryOne<CustomerRow>(
    `SELECT * FROM crm_customers WHERE id = ? AND tenant_id = ?`,
    [id, tid],
  )
  if (!customer) throw new Error('Failed to update customer')
  return customer
}

export async function listLeads(
  tenantId?: string | null,
  opts: { stage?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('l')]
  const params: unknown[] = [tid]

  if (opts.stage) {
    conditions.push('l.stage = ?')
    params.push(opts.stage)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM crm_leads l ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const leads = await query<LeadRow>(
    `SELECT l.* FROM crm_leads l ${where} ORDER BY l.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createLead(
  tenantId: string | null | undefined,
  input: LeadCreateInput,
): Promise<LeadRow> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()

  await execute(
    `INSERT INTO crm_leads (id, tenant_id, name, email, phone, source, stage, estimated_value, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.name,
      input.email || null,
      input.phone || null,
      input.source || null,
      input.stage,
      input.estimatedValue,
      input.assignedTo || null,
    ],
  )

  const lead = await queryOne<LeadRow>('SELECT * FROM crm_leads WHERE id = ?', [id])
  if (!lead) throw new Error('Failed to create lead')
  return lead
}

export interface ActivityRow {
  id: string
  tenant_id: string
  customer_id: string | null
  lead_id: string | null
  activity_type: string
  subject: string
  body: string | null
  scheduled_at: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
}

export interface CustomerDataExport {
  exportedAt: string
  tenantId: string
  customer: CustomerRow
  activities: ActivityRow[]
  arInvoices: Record<string, unknown>[]
  creditScore: Record<string, unknown> | null
}

export async function listActivities(
  tenantId?: string | null,
  opts: {
    customerId?: string
    leadId?: string
    activityType?: string
    page?: number
    limit?: number
  } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('a')]
  const params: unknown[] = [tid]

  if (opts.customerId) {
    conditions.push('a.customer_id = ?')
    params.push(opts.customerId)
  }
  if (opts.leadId) {
    conditions.push('a.lead_id = ?')
    params.push(opts.leadId)
  }
  if (opts.activityType) {
    conditions.push('a.activity_type = ?')
    params.push(opts.activityType)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM crm_activities a ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const activities = await query<ActivityRow>(
    `SELECT a.* FROM crm_activities a ${where}
     ORDER BY COALESCE(a.completed_at, a.scheduled_at, a.created_at) DESC
     ${pagination.clause}`,
    params,
  )

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createActivity(
  tenantId: string | null | undefined,
  userId: string,
  input: ActivityCreateInput,
): Promise<ActivityRow> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()

  await execute(
    `INSERT INTO crm_activities
     (id, tenant_id, customer_id, lead_id, activity_type, subject, body, scheduled_at, completed_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.customerId ?? null,
      input.leadId ?? null,
      input.activityType,
      input.subject,
      input.body ?? null,
      input.scheduledAt ?? null,
      input.completedAt ?? null,
      userId,
    ],
  )

  const activity = await queryOne<ActivityRow>('SELECT * FROM crm_activities WHERE id = ?', [id])
  if (!activity) throw new Error('Failed to create activity')
  return activity
}

export async function exportCustomerData(
  tenantId: string,
  customerId: string,
): Promise<CustomerDataExport> {
  const customer = await queryOne<CustomerRow>(
    `SELECT * FROM crm_customers WHERE id = ? AND ${tenantWhere()}`,
    [customerId, tenantId],
  )
  if (!customer) {
    throw notFound('Customer not found')
  }

  const activities = await query<ActivityRow>(
    `SELECT * FROM crm_activities WHERE ${tenantWhere()} AND customer_id = ?
     ORDER BY created_at DESC`,
    [tenantId, customerId],
  )

  const arInvoices = await query<Record<string, unknown>>(
    `SELECT * FROM ar_invoices WHERE ${tenantWhere()} AND customer_id = ?
     ORDER BY invoice_date DESC`,
    [tenantId, customerId],
  )

  let creditScore: Record<string, unknown> | null = null
  if (customer.user_id) {
    creditScore = await queryOne<Record<string, unknown>>(
      'SELECT score, grade, updated_at FROM credit_scores WHERE user_id = ?',
      [customer.user_id],
    )
  }

  return {
    exportedAt: new Date().toISOString(),
    tenantId,
    customer,
    activities,
    arInvoices,
    creditScore,
  }
}

export interface CampaignRow {
  id: string
  tenant_id: string
  name: string
  channel: string
  status: string
  subject: string | null
  body: string | null
  scheduled_at: string | null
  created_at: string
}

export async function listCampaigns(
  tenantId?: string | null,
  opts: { status?: string; channel?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page || 1
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('c')]
  const params: unknown[] = [tid]

  if (opts.status) {
    conditions.push('c.status = ?')
    params.push(opts.status)
  }
  if (opts.channel) {
    conditions.push('c.channel = ?')
    params.push(opts.channel)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM crm_campaigns c ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const campaigns = await query<CampaignRow>(
    `SELECT c.* FROM crm_campaigns c ${where} ORDER BY c.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    campaigns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createCampaign(
  tenantId: string | null | undefined,
  input: CampaignCreateInput,
): Promise<CampaignRow> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()

  await execute(
    `INSERT INTO crm_campaigns (id, tenant_id, name, channel, status, subject, body, scheduled_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.name,
      input.channel,
      input.status,
      input.subject ?? null,
      input.body ?? null,
      input.scheduledAt ?? null,
    ],
  )

  const campaign = await queryOne<CampaignRow>('SELECT * FROM crm_campaigns WHERE id = ?', [id])
  if (!campaign) throw new Error('Failed to create campaign')
  return campaign
}

export async function updateCampaign(
  tenantId: string | null | undefined,
  campaignId: string,
  input: CampaignUpdateInput,
): Promise<CampaignRow> {
  const tid = resolveTenantId(tenantId)
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM crm_campaigns WHERE id = ? AND ${tenantWhere()}`,
    [campaignId, tid],
  )
  if (!existing) {
    throw notFound('Campaign not found')
  }

  const sets: string[] = []
  const params: unknown[] = []
  if (input.name !== undefined) {
    sets.push('name = ?')
    params.push(input.name)
  }
  if (input.channel !== undefined) {
    sets.push('channel = ?')
    params.push(input.channel)
  }
  if (input.status !== undefined) {
    sets.push('status = ?')
    params.push(input.status)
  }
  if (input.subject !== undefined) {
    sets.push('subject = ?')
    params.push(input.subject)
  }
  if (input.body !== undefined) {
    sets.push('body = ?')
    params.push(input.body)
  }
  if (input.scheduledAt !== undefined) {
    sets.push('scheduled_at = ?')
    params.push(input.scheduledAt)
  }

  if (sets.length > 0) {
    params.push(campaignId, tid)
    await execute(`UPDATE crm_campaigns SET ${sets.join(', ')} WHERE id = ? AND ${tenantWhere()}`, params)
  }

  const campaign = await queryOne<CampaignRow>(
    `SELECT * FROM crm_campaigns WHERE id = ? AND ${tenantWhere()}`,
    [campaignId, tid],
  )
  if (!campaign) throw new Error('Failed to update campaign')
  return campaign
}

export async function deleteCampaign(
  tenantId: string | null | undefined,
  campaignId: string,
): Promise<void> {
  const tid = resolveTenantId(tenantId)
  const result = await execute(
    `DELETE FROM crm_campaigns WHERE id = ? AND ${tenantWhere()}`,
    [campaignId, tid],
  )
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    throw notFound('Campaign not found')
  }
}

export async function sendCampaign(
  tenantId: string | null | undefined,
  campaignId: string,
): Promise<{ enqueued: number; campaign: CampaignRow }> {
  const tid = resolveTenantId(tenantId)
  const campaign = await queryOne<CampaignRow>(
    `SELECT * FROM crm_campaigns WHERE id = ? AND ${tenantWhere()}`,
    [campaignId, tid],
  )
  if (!campaign) {
    throw notFound('Campaign not found')
  }
  if (campaign.status === 'sent') {
    throw conflict('Campaign already sent')
  }
  if (campaign.status === 'cancelled') {
    throw conflict('Campaign is cancelled')
  }

  const customers = await query<CustomerRow>(
    `SELECT * FROM crm_customers WHERE ${tenantWhere()} AND status = 'active'`,
    [tid],
  )

  const subject = campaign.subject || campaign.name
  const body = campaign.body || campaign.name
  let enqueued = 0

  for (const customer of customers) {
    if (campaign.channel === 'in_app') {
      if (!customer.user_id) continue
      await dispatchNotification({
        tenantId: tid,
        userId: customer.user_id,
        title: subject,
        message: body,
        type: 'info',
      })
      enqueued++
      continue
    }

    if (campaign.channel === 'email') {
      if (!customer.email) continue
      const { sendCommunication } = await import('@/lib/modules/communications/send')
      const { getTemplate, renderTemplate } = await import('@/lib/modules/communications/templates')
      const tpl = await getTemplate(tid, 'crm_campaign', 'email')
      const html = tpl?.body_html
        ? renderTemplate(tpl.body_html, { subject, body })
        : `<p>${body}</p>`
      await sendCommunication({
        tenantId: tid,
        channel: 'email',
        recipient: customer.email,
        subject: tpl?.subject ? renderTemplate(tpl.subject, { subject, body }) : subject,
        body,
        html,
        messageType: 'crm_campaign',
        referenceType: 'crm_campaign',
        referenceId: campaignId,
      })
      enqueued++
      continue
    }

    if (campaign.channel === 'sms' || campaign.channel === 'whatsapp') {
      if (!customer.phone) continue
      const { sendCommunication } = await import('@/lib/modules/communications/send')
      await sendCommunication({
        tenantId: tid,
        channel: campaign.channel,
        recipient: customer.phone,
        subject,
        body: body.slice(0, 480),
        messageType: 'crm_campaign',
        referenceType: 'crm_campaign',
        referenceId: campaignId,
      })
      enqueued++
    }
  }

  await execute(
    `UPDATE crm_campaigns SET status = 'sent' WHERE id = ? AND ${tenantWhere()}`,
    [campaignId, tid],
  )

  const updated = await queryOne<CampaignRow>(
    `SELECT * FROM crm_campaigns WHERE id = ? AND ${tenantWhere()}`,
    [campaignId, tid],
  )
  if (!updated) throw new Error('Failed to update campaign status')

  return { enqueued, campaign: updated }
}
