import { queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { CHART_BY_CODE } from './chart-of-accounts'

export async function getGlAccountByCode(tenantId: string, code: string) {
  let row = await queryOne<{ id: string; code: string; name: string; type: string }>(
    `SELECT id, code, name, type FROM gl_accounts WHERE ${tenantWhere()} AND code = ?`,
    [tenantId, code],
  )
  if (row) return row

  const def = CHART_BY_CODE[code]
  if (!def) return null

  const id = generateId()
  await execute(
    `INSERT INTO gl_accounts (id, tenant_id, code, name, type, is_system) VALUES (?, ?, ?, ?, ?, 1)`,
    [id, tenantId, code, def.name, def.type],
  )
  return { id, code, name: def.name, type: def.type }
}
