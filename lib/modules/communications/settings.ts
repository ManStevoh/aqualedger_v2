import { queryOne, execute } from '@/lib/db'

export interface TenantCommunicationSettings {
  tenant_id: string
  brand_name: string | null
  reply_to_email: string | null
  default_report_emails: string[] | null
  default_report_phones: string[] | null
  default_bcc_emails: string[] | null
  email_footer_html: string | null
  logo_url: string | null
}

function parseJsonEmails(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') {
    try {
      const p = JSON.parse(value)
      return Array.isArray(p) ? p.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

export async function getCommunicationSettings(
  tenantId: string,
): Promise<TenantCommunicationSettings> {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM tenant_communication_settings WHERE tenant_id = ?`,
    [tenantId],
  )
  if (!row) {
    return {
      tenant_id: tenantId,
      brand_name: 'AquaERP',
      reply_to_email: null,
      default_report_emails: [],
      default_report_phones: [],
      default_bcc_emails: [],
      email_footer_html: null,
      logo_url: null,
    }
  }
  return {
    tenant_id: tenantId,
    brand_name: (row.brand_name as string) || 'AquaERP',
    reply_to_email: (row.reply_to_email as string) || null,
    default_report_emails: parseJsonEmails(row.default_report_emails),
    default_report_phones: parseJsonEmails(row.default_report_phones),
    default_bcc_emails: parseJsonEmails(row.default_bcc_emails),
    email_footer_html: (row.email_footer_html as string) || null,
    logo_url: (row.logo_url as string) || null,
  }
}

export async function upsertCommunicationSettings(
  tenantId: string,
  input: Partial<{
    brandName: string
    replyToEmail: string
    defaultReportEmails: string[]
    defaultReportPhones: string[]
    defaultBccEmails: string[]
    emailFooterHtml: string
    logoUrl: string
  }>,
): Promise<TenantCommunicationSettings> {
  const existing = await queryOne<{ tenant_id: string }>(
    `SELECT tenant_id FROM tenant_communication_settings WHERE tenant_id = ?`,
    [tenantId],
  )

  if (!existing) {
    await execute(
      `INSERT INTO tenant_communication_settings (
        tenant_id, brand_name, reply_to_email, default_report_emails, default_report_phones,
        default_bcc_emails, email_footer_html, logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        input.brandName ?? 'AquaERP',
        input.replyToEmail ?? null,
        JSON.stringify(input.defaultReportEmails ?? []),
        JSON.stringify(input.defaultReportPhones ?? []),
        JSON.stringify(input.defaultBccEmails ?? []),
        input.emailFooterHtml ?? null,
        input.logoUrl ?? null,
      ],
    )
  } else {
    const fields: string[] = []
    const params: unknown[] = []
    if (input.brandName !== undefined) {
      fields.push('brand_name = ?')
      params.push(input.brandName)
    }
    if (input.replyToEmail !== undefined) {
      fields.push('reply_to_email = ?')
      params.push(input.replyToEmail)
    }
    if (input.defaultReportEmails !== undefined) {
      fields.push('default_report_emails = ?')
      params.push(JSON.stringify(input.defaultReportEmails))
    }
    if (input.defaultReportPhones !== undefined) {
      fields.push('default_report_phones = ?')
      params.push(JSON.stringify(input.defaultReportPhones))
    }
    if (input.defaultBccEmails !== undefined) {
      fields.push('default_bcc_emails = ?')
      params.push(JSON.stringify(input.defaultBccEmails))
    }
    if (input.emailFooterHtml !== undefined) {
      fields.push('email_footer_html = ?')
      params.push(input.emailFooterHtml)
    }
    if (input.logoUrl !== undefined) {
      fields.push('logo_url = ?')
      params.push(input.logoUrl)
    }
    if (fields.length > 0) {
      params.push(tenantId)
      await execute(
        `UPDATE tenant_communication_settings SET ${fields.join(', ')} WHERE tenant_id = ?`,
        params,
      )
    }
  }

  return getCommunicationSettings(tenantId)
}
