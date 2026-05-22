import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export interface CommunicationTemplate {
  id: string
  tenant_id: string
  template_key: string
  channel: string
  name: string
  subject: string | null
  body_html: string | null
  body_text: string | null
  active: number
}

const DEFAULT_TEMPLATES: Omit<CommunicationTemplate, 'id' | 'tenant_id' | 'active'>[] = [
  {
    template_key: 'report_delivery',
    channel: 'email',
    name: 'Automated report email',
    subject: '[{{brand}}] {{reportTitle}} — {{periodEnd}}',
    body_html: `<p>Hello,</p><p>Your <strong>{{reportTitle}}</strong> for {{periodStart}} to {{periodEnd}} is ready.</p><p><a href="{{shareUrl}}">View online</a> or use the attachment.</p><p>{{rowCount}} records · {{standards}}</p>`,
    body_text: 'Your {{reportTitle}} is ready. Period: {{periodStart}} to {{periodEnd}}. View: {{shareUrl}}',
  },
  {
    template_key: 'alert_coldchain',
    channel: 'email',
    name: 'Cold chain alert',
    subject: '[{{brand}}] Temperature alert — action required',
    body_html: '<p>A cold storage threshold breach was detected. Review HACCP logs in AquaERP immediately.</p>',
    body_text: 'Cold chain temperature alert. Log in to AquaERP.',
  },
  {
    template_key: 'crm_campaign',
    channel: 'email',
    name: 'CRM campaign email',
    subject: '{{subject}}',
    body_html: '<p>{{body}}</p>',
    body_text: '{{body}}',
  },
]

export async function ensureDefaultTemplates(tenantId: string): Promise<void> {
  for (const t of DEFAULT_TEMPLATES) {
    const exists = await queryOne<{ id: string }>(
      `SELECT id FROM communication_templates
       WHERE ${tenantWhere()} AND template_key = ? AND channel = ?`,
      [tenantId, t.template_key, t.channel],
    )
    if (!exists) {
      await execute(
        `INSERT INTO communication_templates (id, tenant_id, template_key, channel, name, subject, body_html, body_text, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          generateId(),
          tenantId,
          t.template_key,
          t.channel,
          t.name,
          t.subject,
          t.body_html,
          t.body_text,
        ],
      )
    }
  }
}

export async function listTemplates(tenantId: string): Promise<CommunicationTemplate[]> {
  await ensureDefaultTemplates(tenantId)
  return query<CommunicationTemplate>(
    `SELECT * FROM communication_templates WHERE ${tenantWhere()} ORDER BY template_key, channel`,
    [tenantId],
  )
}

export async function getTemplate(
  tenantId: string,
  templateKey: string,
  channel = 'email',
): Promise<CommunicationTemplate | null> {
  await ensureDefaultTemplates(tenantId)
  return queryOne<CommunicationTemplate>(
    `SELECT * FROM communication_templates
     WHERE ${tenantWhere()} AND template_key = ? AND channel = ? AND active = 1`,
    [tenantId, templateKey, channel],
  )
}

export function renderTemplate(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key]
    return v === undefined || v === null ? '' : String(v)
  })
}

export async function updateTemplate(
  tenantId: string,
  templateId: string,
  input: Partial<{ subject: string; bodyHtml: string; bodyText: string; active: boolean; name: string }>,
): Promise<CommunicationTemplate> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM communication_templates WHERE id = ? AND ${tenantWhere()}`,
    [templateId, tenantId],
  )
  if (!row) throw notFound('Template not found')

  const fields: string[] = []
  const params: unknown[] = []
  if (input.subject !== undefined) {
    fields.push('subject = ?')
    params.push(input.subject)
  }
  if (input.bodyHtml !== undefined) {
    fields.push('body_html = ?')
    params.push(input.bodyHtml)
  }
  if (input.bodyText !== undefined) {
    fields.push('body_text = ?')
    params.push(input.bodyText)
  }
  if (input.active !== undefined) {
    fields.push('active = ?')
    params.push(input.active ? 1 : 0)
  }
  if (input.name !== undefined) {
    fields.push('name = ?')
    params.push(input.name)
  }
  if (fields.length > 0) {
    params.push(templateId, tenantId)
    await execute(
      `UPDATE communication_templates SET ${fields.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const updated = await queryOne<CommunicationTemplate>(
    `SELECT * FROM communication_templates WHERE id = ?`,
    [templateId],
  )
  if (!updated) throw notFound('Template not found')
  return updated
}
