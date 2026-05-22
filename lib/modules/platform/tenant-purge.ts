import { queryOne, execute } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { ApiError } from '@/lib/api-handler'

export async function purgeTenant(
  tenantId: string,
  confirmSlug: string,
  opts?: { userId?: string; ipAddress?: string; userAgent?: string },
): Promise<{ deleted: true; slug: string }> {
  const tenant = await queryOne<{ id: string; slug: string }>(
    `SELECT id, slug FROM tenants WHERE id = ? LIMIT 1`,
    [tenantId],
  )

  if (!tenant) {
    throw new ApiError('Tenant not found', 404, 'NOT_FOUND')
  }

  if (tenant.slug !== confirmSlug) {
    throw new ApiError('Confirmation slug does not match tenant slug', 400, 'BAD_REQUEST')
  }

  const { slug } = tenant

  await execute(`DELETE FROM tenants WHERE id = ?`, [tenantId])

  await logAudit({
    userId: opts?.userId,
    tenantId,
    action: 'platform.tenant.purge',
    resourceType: 'tenant',
    resourceId: tenantId,
    metadata: { slug },
    ipAddress: opts?.ipAddress,
    userAgent: opts?.userAgent,
  })

  return { deleted: true, slug }
}
