import { query, queryOne } from '@/lib/db'

export async function exportTenantData(tenantId: string): Promise<Record<string, unknown> | null> {
  const tenant = await queryOne(
    `SELECT id, slug, name, plan, status, created_at FROM tenants WHERE id = ?`,
    [tenantId],
  )
  if (!tenant) return null

  const [members, branches, orders, catches] = await Promise.all([
    query(
      `SELECT tm.user_id, tm.role, tm.status, u.email, u.first_name, u.last_name
       FROM tenant_members tm
       LEFT JOIN users u ON u.id = tm.user_id
       WHERE tm.tenant_id = ?`,
      [tenantId],
    ),
    query(`SELECT id, code, name, type, status FROM branches WHERE tenant_id = ?`, [tenantId]),
    query(
      `SELECT id, order_number, total, status, payment_status, created_at
       FROM orders WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500`,
      [tenantId],
    ),
    query(
      `SELECT id, quantity_kg, species_id, created_at FROM catches WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500`,
      [tenantId],
    ),
  ])

  return {
    exportedAt: new Date().toISOString(),
    tenant,
    members,
    branches,
    orders,
    catches,
  }
}
