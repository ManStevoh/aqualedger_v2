import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne } from '@/lib/db'
import { getExecutiveSummary } from '@/lib/modules/analytics/service'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { analyticsTenantScope, pushAnalyticsTenant } from '@/lib/modules/analytics/tenant-scope'
import { tenantWhere } from '@/lib/tenant'

// GET /api/v2/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('analytics.dashboard.read')
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') || 'dashboard'
    const period = searchParams.get('period') || '30' // days
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const dateFilter = startDate && endDate
      ? `created_at BETWEEN '${startDate}' AND '${endDate}'`
      : `created_at >= DATE_SUB(NOW(), INTERVAL ${parseInt(period)} DAY)`
    
    if (type === 'executive-summary') {
      const summary = await getExecutiveSummary(auth.tenantId)
      return NextResponse.json({ success: true, data: summary })
    }

    if (type === 'dashboard') {
      const tenantScoped = analyticsTenantScope(auth.role, auth.tenantId)
      const scopeOwner = !hasFullSystemAccess(auth.role)

      const boatConditions: string[] = []
      const boatParams: unknown[] = []
      if (tenantScoped) pushAnalyticsTenant(boatConditions, boatParams, 'boats', auth.tenantId)
      if (scopeOwner) {
        boatConditions.push('owner_id = ?')
        boatParams.push(auth.userId)
      }
      const boatWhere = boatConditions.length ? `WHERE ${boatConditions.join(' AND ')}` : ''

      const tripConditions: string[] = []
      const tripParams: unknown[] = []
      const tripJoin = scopeOwner || tenantScoped ? 'LEFT JOIN boats b ON t.boat_id = b.id' : ''
      if (tenantScoped) pushAnalyticsTenant(tripConditions, tripParams, 't', auth.tenantId)
      if (scopeOwner) {
        tripConditions.push('b.owner_id = ?')
        tripParams.push(auth.userId)
      }
      const tripWhere = tripConditions.length ? `WHERE ${tripConditions.join(' AND ')}` : ''

      const [boatsCount] = await query<{ total: number; active: number }>(
        `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
         FROM boats ${boatWhere}`,
        boatParams,
      )

      const [tripsStats] = await query<{
        total_trips: number
        completed_trips: number
        total_catch_kg: number
        total_revenue: number
      }>(
        `SELECT COUNT(*) as total_trips,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
          COALESCE(SUM(t.total_catch_kg), 0) as total_catch_kg,
          COALESCE(SUM(t.total_revenue), 0) as total_revenue
         FROM fishing_trips t ${tripJoin} ${tripWhere}`,
        tripParams,
      )

      const wallet = await queryOne<{ balance: number }>(
        'SELECT balance FROM wallets WHERE user_id = ? AND tenant_id = ?',
        [auth.userId, auth.tenantId],
      )

      const monthlyConditions = [...tripConditions, 't.departure_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)', "t.status = 'completed'"]
      const monthlyRevenue = await query<{ month: string; revenue: number; catches_kg: number }>(
        `SELECT DATE_FORMAT(t.departure_time, '%Y-%m') as month,
          COALESCE(SUM(t.total_revenue), 0) as revenue,
          COALESCE(SUM(t.total_catch_kg), 0) as catches_kg
         FROM fishing_trips t ${tripJoin}
         ${monthlyConditions.length ? `WHERE ${monthlyConditions.join(' AND ')}` : ''}
         GROUP BY DATE_FORMAT(t.departure_time, '%Y-%m') ORDER BY month`,
        tripParams,
      )

      const speciesConditions = [...tripConditions]
      const topSpecies = await query<{ species_name: string; total_kg: number; total_value: number }>(
        `SELECT fs.name as species_name,
          COALESCE(SUM(c.quantity_kg), 0) as total_kg,
          COALESCE(SUM(c.total_value), 0) as total_value
         FROM catches c
         LEFT JOIN fish_species fs ON c.species_id = fs.id
         LEFT JOIN fishing_trips t ON c.trip_id = t.id
         ${tripJoin}
         ${speciesConditions.length ? `WHERE ${speciesConditions.join(' AND ')}` : ''}
         GROUP BY fs.id, fs.name ORDER BY total_kg DESC LIMIT 10`,
        tripParams,
      )
      
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalBoats: boatsCount?.total || 0,
            activeBoats: boatsCount?.active || 0,
            totalTrips: tripsStats?.total_trips || 0,
            completedTrips: tripsStats?.completed_trips || 0,
            totalCatchKg: tripsStats?.total_catch_kg || 0,
            totalRevenue: tripsStats?.total_revenue || 0,
            walletBalance: wallet?.balance || 0,
          },
          monthlyRevenue,
          topSpecies,
        },
      })
    }
    
    if (type === 'catches') {
      const tenantScoped = analyticsTenantScope(auth.role, auth.tenantId)
      const scopeOwner = !hasFullSystemAccess(auth.role)
      const catchConditions: string[] = []
      const catchParams: unknown[] = []
      const catchJoin =
        scopeOwner || tenantScoped
          ? 'LEFT JOIN fishing_trips t ON c.trip_id = t.id LEFT JOIN boats b ON t.boat_id = b.id'
          : 'LEFT JOIN fishing_trips t ON c.trip_id = t.id'
      if (tenantScoped) pushAnalyticsTenant(catchConditions, catchParams, 'c', auth.tenantId)
      if (scopeOwner) {
        catchConditions.push('b.owner_id = ?')
        catchParams.push(auth.userId)
      }
      catchConditions.push(`c.${dateFilter}`)
      const catchWhere = `WHERE ${catchConditions.join(' AND ')}`

      const catchesByGrade = await query<{ grade: string; total_kg: number; total_value: number }>(
        `SELECT c.grade, COALESCE(SUM(c.quantity_kg), 0) as total_kg, COALESCE(SUM(c.total_value), 0) as total_value
         FROM catches c ${catchJoin} ${catchWhere} GROUP BY c.grade`,
        catchParams,
      )

      const catchesByMethod = await query<{ storage_method: string; total_kg: number }>(
        `SELECT c.storage_method, COALESCE(SUM(c.quantity_kg), 0) as total_kg
         FROM catches c ${catchJoin} ${catchWhere} GROUP BY c.storage_method`,
        catchParams,
      )

      const dailyCatches = await query<{ date: string; total_kg: number; total_value: number }>(
        `SELECT DATE(c.created_at) as date, COALESCE(SUM(c.quantity_kg), 0) as total_kg, COALESCE(SUM(c.total_value), 0) as total_value
         FROM catches c ${catchJoin} ${catchWhere}
         GROUP BY DATE(c.created_at) ORDER BY date`,
        catchParams,
      )
      
      return NextResponse.json({
        success: true,
        data: {
          byGrade: catchesByGrade,
          byStorageMethod: catchesByMethod,
          dailyTrend: dailyCatches,
        },
      })
    }
    
    if (type === 'financial') {
      const tenantScoped = analyticsTenantScope(auth.role, auth.tenantId)
      const scopeOwner = !hasFullSystemAccess(auth.role)
      const revConditions: string[] = ["t.status = 'completed'", `t.${dateFilter}`]
      const revParams: unknown[] = []
      const revJoin = scopeOwner || tenantScoped ? 'LEFT JOIN boats b ON t.boat_id = b.id' : ''
      if (tenantScoped) pushAnalyticsTenant(revConditions, revParams, 't', auth.tenantId)
      if (scopeOwner) {
        revConditions.push('b.owner_id = ?')
        revParams.push(auth.userId)
      }
      const revWhere = `WHERE ${revConditions.join(' AND ')}`

      const [revenue] = await query<{ total: number }>(
        `SELECT COALESCE(SUM(t.total_revenue), 0) as total FROM fishing_trips t ${revJoin} ${revWhere}`,
        revParams,
      )

      const salesConditions = [tenantWhere('o'), "o.status != 'cancelled'", `o.${dateFilter}`]
      const salesParams: unknown[] = [auth.tenantId]
      const [orderSales] = await query<{ total: number }>(
        `SELECT COALESCE(SUM(o.total), 0) as total FROM orders o WHERE ${salesConditions.join(' AND ')}`,
        salesParams,
      )

      const catchRevenue = Number(revenue?.total ?? 0)
      const salesRevenue = Number(orderSales?.total ?? 0)

      const expConditions = ['user_id = ?', "status = 'approved'", dateFilter]
      const expParams: unknown[] = [auth.userId]
      if (tenantScoped) {
        expConditions.push('tenant_id = ?')
        expParams.push(auth.tenantId)
      }
      const [expenses] = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE ${expConditions.join(' AND ')}`,
        expParams,
      )
      
      const expensesByCategory = await query<{ category: string; total: number }>(
        `SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses
         WHERE ${expConditions.join(' AND ')} GROUP BY category ORDER BY total DESC`,
        expParams,
      )

      const monthlyProfitLoss = await query<{ month: string; revenue: number; expenses: number }>(
        `SELECT months.month,
           COALESCE(rev.catch_revenue, 0) + COALESCE(sales.order_revenue, 0) as revenue,
           COALESCE(exp.expenses, 0) as expenses
         FROM (
           SELECT DATE_FORMAT(t.departure_time, '%Y-%m') as month FROM fishing_trips t ${revJoin} ${revWhere}
           UNION
           SELECT DATE_FORMAT(o.created_at, '%Y-%m') FROM orders o WHERE ${salesConditions.join(' AND ')}
           UNION
           SELECT DATE_FORMAT(expense_date, '%Y-%m') FROM expenses WHERE ${expConditions.join(' AND ')}
         ) months
         LEFT JOIN (
           SELECT DATE_FORMAT(t.departure_time, '%Y-%m') as month, SUM(t.total_revenue) as catch_revenue
           FROM fishing_trips t ${revJoin} ${revWhere}
           GROUP BY DATE_FORMAT(t.departure_time, '%Y-%m')
         ) rev ON months.month = rev.month
         LEFT JOIN (
           SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month, SUM(o.total) as order_revenue
           FROM orders o WHERE ${salesConditions.join(' AND ')}
           GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
         ) sales ON months.month = sales.month
         LEFT JOIN (
           SELECT DATE_FORMAT(expense_date, '%Y-%m') as month, SUM(amount) as expenses
           FROM expenses WHERE ${expConditions.join(' AND ')}
           GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
         ) exp ON months.month = exp.month
         ORDER BY months.month`,
        [...revParams, ...salesParams, ...expParams, ...revParams, ...salesParams, ...expParams],
      )
      
      const totalRevenue = catchRevenue + salesRevenue
      const totalExpenses = Number(expenses?.total ?? 0)

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalRevenue,
            catchRevenue,
            salesRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
          },
          expensesByCategory,
          monthlyProfitLoss,
        },
      })
    }
    
    if (type === 'commerce-revenue' || type === 'investment-distribution') {
      const rows = await query<{ name: string; value: number }>(
        `SELECT COALESCE(fs.name, 'Catalog') as name, COALESCE(SUM(oi.quantity_kg * oi.unit_price), 0) as value
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN fish_species fs ON oi.species_id = fs.id
         WHERE o.tenant_id = ? AND o.status NOT IN ('cancelled')
           AND o.created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)
         GROUP BY fs.id, fs.name
         ORDER BY value DESC
         LIMIT 12`,
        [auth.tenantId],
      )
      return NextResponse.json({
        success: true,
        data: rows.map((r) => ({ name: r.name, value: Number(r.value) || 0 })),
      })
    }

    if (type === 'admin' && hasFullSystemAccess(auth.role)) {
      // Admin-only analytics
      const [userStats] = await query<{
        total_users: number
        active_users: number
        new_users_this_month: number
      }>(
        `SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_this_month
         FROM users`
      )
      
      const usersByRole = await query<{ role: string; count: number }>(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
      )
      
      const [platformStats] = await query<{
        total_boats: number
        total_trips: number
        total_catches_kg: number
        total_marketplace_value: number
      }>(
        `SELECT 
          (SELECT COUNT(*) FROM boats) as total_boats,
          (SELECT COUNT(*) FROM fishing_trips) as total_trips,
          (SELECT COALESCE(SUM(quantity_kg), 0) FROM catches) as total_catches_kg,
          (SELECT COALESCE(SUM(quantity_kg * price_per_kg), 0) FROM fish_listings WHERE status = 'sold') as total_marketplace_value`
      )
      
      return NextResponse.json({
        success: true,
        data: {
          users: {
            ...userStats,
            byRole: usersByRole,
          },
          platform: platformStats,
        },
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid analytics type' },
      { status: 400 }
    )
  } catch (error) {
    return handleApiError(error, 'v2/analytics')
  }
}
