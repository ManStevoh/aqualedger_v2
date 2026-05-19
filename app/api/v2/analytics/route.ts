import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { hasFullSystemAccess } from '@/lib/platform-access'

// GET /api/v2/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') || 'dashboard'
    const period = searchParams.get('period') || '30' // days
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const dateFilter = startDate && endDate
      ? `created_at BETWEEN '${startDate}' AND '${endDate}'`
      : `created_at >= DATE_SUB(NOW(), INTERVAL ${parseInt(period)} DAY)`
    
    if (type === 'dashboard') {
      // Overall dashboard stats
      let userFilter = ''
      const userParams: unknown[] = []
      
      if (!hasFullSystemAccess(auth.role)) {
        userFilter = 'WHERE owner_id = ?'
        userParams.push(auth.userId)
      }
      
      // Boats count
      const [boatsCount] = await query<{ total: number; active: number }>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
         FROM boats ${userFilter}`,
        userParams
      )
      
      // Trips stats
      const [tripsStats] = await query<{ 
        total_trips: number
        completed_trips: number
        total_catch_kg: number
        total_revenue: number
      }>(
        `SELECT 
          COUNT(*) as total_trips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
          COALESCE(SUM(total_catch_kg), 0) as total_catch_kg,
          COALESCE(SUM(total_revenue), 0) as total_revenue
         FROM fishing_trips t
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ?' : ''}`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
      )
      
      // Get wallet balance
      const wallet = await queryOne<{ balance: number }>(
        'SELECT balance FROM wallets WHERE user_id = ?',
        [auth.userId]
      )
      
      // Monthly revenue trend
      const monthlyRevenue = await query<{ month: string; revenue: number; catches_kg: number }>(
        `SELECT 
          DATE_FORMAT(t.departure_time, '%Y-%m') as month,
          COALESCE(SUM(t.total_revenue), 0) as revenue,
          COALESCE(SUM(t.total_catch_kg), 0) as catches_kg
         FROM fishing_trips t
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ? AND' : 'WHERE'}
         t.departure_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         AND t.status = 'completed'
         GROUP BY DATE_FORMAT(t.departure_time, '%Y-%m')
         ORDER BY month`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
      )
      
      // Top species by catch
      const topSpecies = await query<{ species_name: string; total_kg: number; total_value: number }>(
        `SELECT 
          fs.name as species_name,
          COALESCE(SUM(c.quantity_kg), 0) as total_kg,
          COALESCE(SUM(c.total_value), 0) as total_value
         FROM catches c
         LEFT JOIN fish_species fs ON c.species_id = fs.id
         LEFT JOIN fishing_trips t ON c.trip_id = t.id
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ?' : ''}
         GROUP BY fs.id, fs.name
         ORDER BY total_kg DESC
         LIMIT 10`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
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
      // Catches analytics
      const catchesByGrade = await query<{ grade: string; total_kg: number; total_value: number }>(
        `SELECT 
          c.grade,
          COALESCE(SUM(c.quantity_kg), 0) as total_kg,
          COALESCE(SUM(c.total_value), 0) as total_value
         FROM catches c
         LEFT JOIN fishing_trips t ON c.trip_id = t.id
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ? AND' : 'WHERE'}
         c.${dateFilter}
         GROUP BY c.grade`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
      )
      
      const catchesByMethod = await query<{ storage_method: string; total_kg: number }>(
        `SELECT 
          c.storage_method,
          COALESCE(SUM(c.quantity_kg), 0) as total_kg
         FROM catches c
         LEFT JOIN fishing_trips t ON c.trip_id = t.id
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ? AND' : 'WHERE'}
         c.${dateFilter}
         GROUP BY c.storage_method`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
      )
      
      const dailyCatches = await query<{ date: string; total_kg: number; total_value: number }>(
        `SELECT 
          DATE(c.recorded_at) as date,
          COALESCE(SUM(c.quantity_kg), 0) as total_kg,
          COALESCE(SUM(c.total_value), 0) as total_value
         FROM catches c
         LEFT JOIN fishing_trips t ON c.trip_id = t.id
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ? AND' : 'WHERE'}
         c.${dateFilter}
         GROUP BY DATE(c.recorded_at)
         ORDER BY date`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
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
      // Financial analytics
      const [revenue] = await query<{ total: number }>(
        `SELECT COALESCE(SUM(total_revenue), 0) as total
         FROM fishing_trips t
         ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ? AND' : 'WHERE'}
         t.status = 'completed' AND t.${dateFilter}`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
      )
      
      const [expenses] = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM expenses
         WHERE user_id = ? AND status = 'approved' AND ${dateFilter}`,
        [auth.userId]
      )
      
      const expensesByCategory = await query<{ category: string; total: number }>(
        `SELECT category, COALESCE(SUM(amount), 0) as total
         FROM expenses
         WHERE user_id = ? AND status = 'approved' AND ${dateFilter}
         GROUP BY category
         ORDER BY total DESC`,
        [auth.userId]
      )
      
      const monthlyProfitLoss = await query<{ month: string; revenue: number; expenses: number }>(
        `SELECT 
          months.month,
          COALESCE(rev.revenue, 0) as revenue,
          COALESCE(exp.expenses, 0) as expenses
         FROM (
           SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m') as month
           FROM (
             SELECT created_at FROM fishing_trips WHERE ${dateFilter}
             UNION
             SELECT created_at FROM expenses WHERE ${dateFilter}
           ) combined
         ) months
         LEFT JOIN (
           SELECT DATE_FORMAT(departure_time, '%Y-%m') as month, SUM(total_revenue) as revenue
           FROM fishing_trips t
           ${!hasFullSystemAccess(auth.role) ? 'LEFT JOIN boats b ON t.boat_id = b.id WHERE b.owner_id = ? AND' : 'WHERE'}
           t.status = 'completed'
           GROUP BY DATE_FORMAT(departure_time, '%Y-%m')
         ) rev ON months.month = rev.month
         LEFT JOIN (
           SELECT DATE_FORMAT(expense_date, '%Y-%m') as month, SUM(amount) as expenses
           FROM expenses WHERE user_id = ? AND status = 'approved'
           GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
         ) exp ON months.month = exp.month
         ORDER BY months.month`,
        !hasFullSystemAccess(auth.role) ? [auth.userId, auth.userId] : [auth.userId]
      )
      
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalRevenue: revenue?.total || 0,
            totalExpenses: expenses?.total || 0,
            netProfit: (revenue?.total || 0) - (expenses?.total || 0),
          },
          expensesByCategory,
          monthlyProfitLoss,
        },
      })
    }
    
    if (type === 'investment-distribution') {
      const rows = await query<{ name: string; value: number }>(
        `SELECT ip.name as name, COALESCE(SUM(i.amount), 0) as value
         FROM investments i
         JOIN investment_packages ip ON i.package_id = ip.id
         WHERE i.status = 'active'
         ${!hasFullSystemAccess(auth.role) ? 'AND i.user_id = ?' : ''}
         GROUP BY ip.id, ip.name
         ORDER BY value DESC`,
        !hasFullSystemAccess(auth.role) ? [auth.userId] : []
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
