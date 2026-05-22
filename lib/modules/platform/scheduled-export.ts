import fs from 'fs/promises'
import path from 'path'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { exportTenantData } from '@/lib/modules/platform/tenant-export'

export interface TenantDataExportRow {
  id: string
  tenantId: string
  tenantName: string
  tenantSlug: string
  requestedBy: string | null
  exportType: string
  status: string
  filePath: string | null
  errorMessage: string | null
  completedAt: string | null
  createdAt: string
}

export async function queueTenantExport(
  tenantId: string,
  requestedBy: string | null,
): Promise<string> {
  const tenant = await queryOne<{ id: string }>(`SELECT id FROM tenants WHERE id = ?`, [tenantId])
  if (!tenant) throw new Error('Tenant not found')

  const id = generateId()
  await execute(
    `INSERT INTO tenant_data_exports (id, tenant_id, requested_by, export_type, status)
     VALUES (?, ?, ?, 'gdpr', 'pending')`,
    [id, tenantId, requestedBy],
  )
  return id
}

export async function queueAllTenantExports(requestedBy: string | null): Promise<string[]> {
  const tenants = await query<{ id: string }>(
    `SELECT id FROM tenants WHERE status IN ('active', 'pending')`,
  )
  const ids: string[] = []
  for (const t of tenants) {
    ids.push(await queueTenantExport(t.id, requestedBy))
  }
  return ids
}

export async function listTenantExports(limit = 50): Promise<TenantDataExportRow[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 200)
  const rows = await query<{
    id: string
    tenant_id: string
    tenant_name: string
    tenant_slug: string
    requested_by: string | null
    export_type: string
    status: string
    file_path: string | null
    error_message: string | null
    completed_at: string | null
    created_at: string
  }>(
    `SELECT
       e.id,
       e.tenant_id,
       t.name AS tenant_name,
       t.slug AS tenant_slug,
       e.requested_by,
       e.export_type,
       e.status,
       e.file_path,
       e.error_message,
       e.completed_at,
       e.created_at
     FROM tenant_data_exports e
     INNER JOIN tenants t ON t.id = e.tenant_id
     ORDER BY e.created_at DESC
     LIMIT ?`,
    [safeLimit],
  )

  return rows.map((r) => ({
    id: r.id,
    tenantId: r.tenant_id,
    tenantName: r.tenant_name,
    tenantSlug: r.tenant_slug,
    requestedBy: r.requested_by,
    exportType: r.export_type,
    status: r.status,
    filePath: r.file_path,
    errorMessage: r.error_message,
    completedAt: r.completed_at ? String(r.completed_at) : null,
    createdAt: String(r.created_at),
  }))
}

export async function getTenantExportById(id: string): Promise<TenantDataExportRow | null> {
  const row = await queryOne<{
    id: string
    tenant_id: string
    tenant_name: string
    tenant_slug: string
    requested_by: string | null
    export_type: string
    status: string
    file_path: string | null
    error_message: string | null
    completed_at: string | null
    created_at: string
  }>(
    `SELECT
       e.id,
       e.tenant_id,
       t.name AS tenant_name,
       t.slug AS tenant_slug,
       e.requested_by,
       e.export_type,
       e.status,
       e.file_path,
       e.error_message,
       e.completed_at,
       e.created_at
     FROM tenant_data_exports e
     INNER JOIN tenants t ON t.id = e.tenant_id
     WHERE e.id = ?
     LIMIT 1`,
    [id],
  )
  if (!row) return null
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    tenantSlug: row.tenant_slug,
    requestedBy: row.requested_by,
    exportType: row.export_type,
    status: row.status,
    filePath: row.file_path,
    errorMessage: row.error_message,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    createdAt: String(row.created_at),
  }
}

export async function processPendingExports(limit = 5): Promise<number> {
  const safeLimit = Math.min(Math.max(limit, 1), 20)
  const pending = await query<{ id: string; tenant_id: string }>(
    `SELECT id, tenant_id FROM tenant_data_exports
     WHERE status = 'pending' ORDER BY created_at ASC LIMIT ?`,
    [safeLimit],
  )

  let processed = 0
  const exportDir = path.join(process.cwd(), 'storage', 'exports')
  await fs.mkdir(exportDir, { recursive: true })

  for (const row of pending) {
    await execute(`UPDATE tenant_data_exports SET status = 'processing' WHERE id = ?`, [row.id])
    try {
      const data = await exportTenantData(row.tenant_id)
      if (!data) throw new Error('Tenant not found')

      const fileName = `${row.tenant_id}-${row.id}.json`
      const absolutePath = path.join(exportDir, fileName)
      await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), 'utf8')
      const relativePath = `storage/exports/${fileName}`

      await execute(
        `UPDATE tenant_data_exports
         SET status = 'completed', file_path = ?, completed_at = NOW(), error_message = NULL
         WHERE id = ?`,
        [relativePath, row.id],
      )
      processed++
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      await execute(
        `UPDATE tenant_data_exports SET status = 'failed', error_message = ? WHERE id = ?`,
        [message, row.id],
      )
    }
  }

  return processed
}
