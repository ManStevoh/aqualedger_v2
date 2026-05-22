import { queryOne } from '@/lib/db'

export interface PlatformOverview {
  tenants: {
    total: number
    active: number
    suspended: number
    trial: number
  }
  users: {
    total: number
    active: number
    suspended: number
  }
  orders: {
    total: number
    last30Days: number
  }
  catches: {
    total: number
    totalKg: number
    last30Days: number
  }
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const tenants = await queryOne<{
    total: number
    active: number
    suspended: number
    trial: number
  }>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'active') AS active,
       SUM(status = 'suspended') AS suspended,
       SUM(plan = 'trial') AS trial
     FROM tenants`,
  )

  const users = await queryOne<{
    total: number
    active: number
    suspended: number
  }>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'active') AS active,
       SUM(status = 'suspended') AS suspended
     FROM users`,
  )

  const orders = await queryOne<{ total: number; last30Days: number }>(
    `SELECT
       COUNT(*) AS total,
       SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS last30Days
     FROM orders`,
  )

  const catches = await queryOne<{
    total: number
    totalKg: number
    last30Days: number
  }>(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(quantity_kg), 0) AS totalKg,
       SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS last30Days
     FROM catches`,
  )

  return {
    tenants: {
      total: Number(tenants?.total ?? 0),
      active: Number(tenants?.active ?? 0),
      suspended: Number(tenants?.suspended ?? 0),
      trial: Number(tenants?.trial ?? 0),
    },
    users: {
      total: Number(users?.total ?? 0),
      active: Number(users?.active ?? 0),
      suspended: Number(users?.suspended ?? 0),
    },
    orders: {
      total: Number(orders?.total ?? 0),
      last30Days: Number(orders?.last30Days ?? 0),
    },
    catches: {
      total: Number(catches?.total ?? 0),
      totalKg: Number(catches?.totalKg ?? 0),
      last30Days: Number(catches?.last30Days ?? 0),
    },
  }
}
