'use client'

import useSWR from 'swr'
import { authFetchJson } from './auth-fetch'
import type {
  ApiResponse,
  PaginatedResponse,
  Boat,
  FishingTrip,
  Catch,
  FishListing,
  FishOrder,
  Wallet,
  Transaction,
  Investment,
  InvestmentPackage,
  MaintenanceRecord,
  DashboardStats,
  BMU,
  ROIRecord,
  UserRole,
} from './types'
import { hasFullSystemAccess } from './platform-access'

export { authFetchJson } from './auth-fetch'

const swrFetcher = (url: string) => authFetchJson(url)

function mapTripStatus(db: string): FishingTrip['status'] {
  if (db === 'in_progress' || db === 'ongoing') return 'ongoing'
  if (db === 'completed') return 'completed'
  if (db === 'cancelled') return 'cancelled'
  if (db === 'planned') return 'planned'
  return 'planned'
}

function mapBoatType(raw: string): Boat['type'] {
  const t = (raw || '').toLowerCase()
  if (t === 'deep_sea' || t === 'lake' || t === 'river' || t === 'coastal') return t as Boat['type']
  const hullLabels: Record<string, Boat['type']> = {
    fiber: 'coastal',
    wooden: 'river',
    steel: 'deep_sea',
    aluminum: 'lake',
  }
  return hullLabels[t] || 'coastal'
}

function mapGradeToUi(g: string): Catch['grade'] {
  const x = (g || '').toUpperCase()
  if (x === 'A') return 'premium'
  if (x === 'B') return 'export'
  return 'local'
}

function mapGradeToDb(g: string): string {
  const m: Record<string, string> = { premium: 'A', export: 'B', local: 'C' }
  return m[g] || g
}

function mapBoatRow(row: Record<string, unknown>): Boat {
  return {
    id: String(row.id),
    registrationNumber: String(row.registration_number || ''),
    name: String(row.name || ''),
    ownerId: String(row.owner_id || ''),
    ownerName: String(row.owner_name || ''),
    type: mapBoatType(String(row.type || 'coastal')),
    engineType: String(row.engine_type || ''),
    engineCapacity: Number(row.engine_power_hp) || 0,
    capacity: Number(row.capacity_kg) || 0,
    crew: [],
    status: (String(row.status || 'active') as Boat['status']) || 'active',
    insuranceExpiry: row.insurance_expiry ? String(row.insurance_expiry).split('T')[0] : '',
    licenseExpiry: row.license_expiry ? String(row.license_expiry).split('T')[0] : '',
    gpsEnabled: Boolean(row.gps_enabled),
    lastTrip: undefined,
    totalTrips: 0,
    totalCatch: 0,
    fuelEfficiency: 0,
    createdAt: row.created_at ? String(row.created_at).split('T')[0] : '',
  }
}

function mapTripRow(row: Record<string, unknown>): FishingTrip {
  return {
    id: String(row.id),
    boatId: String(row.boat_id || ''),
    boatName: String(row.boat_name || ''),
    captainId: String(row.captain_id || ''),
    captainName: String(row.captain_name || ''),
    crew: [],
    startTime: row.departure_time ? String(row.departure_time) : '',
    endTime: row.return_time ? String(row.return_time) : undefined,
    status: mapTripStatus(String(row.status || '')),
    fishingZone: String(row.fishing_zone || ''),
    fuelUsed: Number(row.fuel_used_liters) || 0,
    fuelCost: Number(row.fuel_cost) || 0,
    catches: [],
    totalCatch: Number(row.total_catch_kg) || 0,
    totalRevenue: Number(row.total_revenue) || 0,
    expenses: [],
    totalExpenses: Number(row.other_expenses) || 0,
    netProfit:
      (Number(row.total_revenue) || 0) -
      ((Number(row.fuel_cost) || 0) + (Number(row.other_expenses) || 0)),
    notes: row.notes ? String(row.notes) : undefined,
  }
}

function mapCatchRow(row: Record<string, unknown>): Catch {
  return {
    id: String(row.id),
    tripId: String(row.trip_id || ''),
    fishType: String(row.species_name || row.fish_type || 'Unknown'),
    weight: Number(row.quantity_kg) || 0,
    grade: mapGradeToUi(String(row.grade || 'C')),
    pricePerKg: Number(row.unit_price) || 0,
    totalValue: Number(row.total_value) || 0,
    buyerId: row.buyer_id ? String(row.buyer_id) : undefined,
    buyerName: row.buyer_name ? String(row.buyer_name) : undefined,
    soldAt: row.sold_at ? String(row.sold_at) : undefined,
    loggedAt: row.created_at
      ? String(row.created_at)
      : row.recorded_at
        ? String(row.recorded_at)
        : undefined,
  }
}

function mapListingRow(row: Record<string, unknown>): FishListing {
  const g = String(row.grade || 'B').toUpperCase()
  const grade: FishListing['grade'] = g === 'A' ? 'premium' : g === 'B' ? 'export' : 'local'
  return {
    id: String(row.id),
    sellerId: String(row.seller_id || ''),
    sellerName: String(row.seller_name || ''),
    fishType: String(row.fish_type || row.species_name || ''),
    quantity: Number(row.quantity_kg) || 0,
    availableQuantity: Number(row.available_quantity_kg) || 0,
    grade,
    pricePerKg: Number(row.price_per_kg) || 0,
    location: String(row.location || row.landing_site_county || ''),
    landingSite: String(row.landing_site_name || ''),
    status: (String(row.status || 'available') as FishListing['status']) || 'available',
    createdAt: row.created_at ? String(row.created_at) : '',
    expiresAt: row.expires_at ? String(row.expires_at) : '',
  }
}

function mapFishOrder(row: Record<string, unknown>): FishOrder {
  const items = (row.items as Record<string, unknown>[]) || []
  const qty = items.reduce((s, i) => s + (Number(i.quantity_kg) || 0), 0)
  const subFromItems = items.reduce((s, i) => s + (Number(i.total_price) || 0), 0)
  const first = items[0] || {}
  return {
    id: String(row.id),
    listingId: String(first.listing_id || ''),
    buyerId: String(row.buyer_id || ''),
    buyerName: String(row.buyer_name || ''),
    buyerPhone: row.buyer_phone ? String(row.buyer_phone) : undefined,
    sellerId: String(row.seller_id || ''),
    sellerName: String(row.seller_name || ''),
    fishType: String(first.species_name || first.fish_type || 'Mixed'),
    quantity: qty,
    pricePerKg: qty > 0 ? subFromItems / qty : 0,
    totalAmount: Number(row.total) || subFromItems,
    status: (String(row.status || 'pending') as FishOrder['status']) || 'pending',
    deliveryAddress: String(row.delivery_address || ''),
    createdAt: row.created_at ? String(row.created_at) : '',
    deliveredAt: row.delivered_at ? String(row.delivered_at) : undefined,
  }
}

function mapTransactionRow(row: Record<string, unknown>, userId: string): Transaction {
  let t = String(row.type || '')
  if (t === 'withdraw') t = 'withdrawal'
  if (t === 'return' || t === 'transfer_in') t = 'dividend'
  return {
    id: String(row.id),
    walletId: String(row.wallet_id || ''),
    userId,
    type: (t as Transaction['type']) || 'deposit',
    amount: Number(row.amount) || 0,
    description: String(row.description || row.reference || ''),
    status: (String(row.status || 'completed') as Transaction['status']) || 'completed',
    reference: String(row.reference || ''),
    createdAt: row.created_at ? String(row.created_at) : '',
  }
}

function mapInvestmentRow(row: Record<string, unknown>): Investment {
  return {
    id: String(row.id),
    investorId: String(row.user_id || row.investor_id || ''),
    packageId: String(row.package_id || ''),
    packageName: String(row.package_name || ''),
    amount: Number(row.amount) || 0,
    expectedReturn: Number(row.expected_return) || 0,
    actualReturn: Number(row.actual_return) || 0,
    status: (String(row.status || 'active') as Investment['status']) || 'active',
    startDate: row.start_date ? String(row.start_date).split('T')[0] : '',
    endDate: row.end_date ? String(row.end_date).split('T')[0] : '',
    dividendsPaid: Number(row.dividends_paid) || 0,
  }
}

function mapPackageRow(row: Record<string, unknown>): InvestmentPackage {
  const funded = Number(row.funded_amount) || 0
  const target = Number(row.total_pool) || Number(row.target_amount) || 0
  const dbStatus = String(row.status || 'active')
  const uiStatus: InvestmentPackage['status'] =
    dbStatus === 'active' ? 'open' : (dbStatus as InvestmentPackage['status'])
  return {
    id: String(row.id),
    name: String(row.name || ''),
    type: 'fish_trading',
    description: String(row.description || ''),
    minInvestment: Number(row.min_investment) || 0,
    expectedROI: Number(row.expected_return_rate) || 0,
    riskLevel: (String(row.risk_level || 'medium') as InvestmentPackage['riskLevel']) || 'medium',
    duration: Number(row.duration_months) || 12,
    totalFunding: target,
    currentFunding: funded,
    status: uiStatus,
    investors: [],
    createdAt: row.created_at ? String(row.created_at).split('T')[0] : '',
  }
}

function mapMaintenanceRow(row: Record<string, unknown>): MaintenanceRecord {
  const dbType = String(row.maintenance_type || row.type || 'routine')
  const uiType: MaintenanceRecord['type'] =
    dbType === 'emergency' ? 'emergency' : dbType === 'inspection' ? 'inspection' : 'scheduled'
  return {
    id: String(row.id),
    boatId: String(row.boat_id || ''),
    boatName: String(row.boat_name || ''),
    type: uiType,
    description: String(row.description || row.work_performed || ''),
    cost: Number(row.cost) || 0,
    parts: [],
    technicianName: String(row.technician_name || row.performed_by || ''),
    status: (String(row.status || 'scheduled') as MaintenanceRecord['status']) || 'scheduled',
    scheduledDate: row.maintenance_date
      ? String(row.maintenance_date).split('T')[0]
      : row.scheduled_date
        ? String(row.scheduled_date).split('T')[0]
        : '',
    completedDate: row.completion_date
      ? String(row.completion_date).split('T')[0]
      : row.completed_date
        ? String(row.completed_date).split('T')[0]
        : undefined,
  }
}

function mapBmuRow(row: Record<string, unknown>): BMU {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    region: String(row.county || ''),
    county: String(row.county || ''),
    landingSite: String(row.landing_site_name || ''),
    chairperson: String(row.chairman_name || ''),
    registeredBoats: Number(row.total_boats) || 0,
    registeredFishermen: Number(row.total_members) || 0,
    status: row.status === 'active' ? 'active' : 'inactive',
    createdAt: row.created_at ? String(row.created_at).split('T')[0] : '',
  }
}

export function useDashboardStats(role?: string, userId?: string) {
  const key = role != null ? ['v2-dashboard-stats', role, userId || ''] : null
  return useSWR(key, async () => {
    const dash = await authFetchJson<{
      success: boolean
      data?: {
        summary: Record<string, unknown>
      }
    }>('/api/v2/analytics?type=dashboard&period=30')
    const fin = await authFetchJson<{
      success: boolean
      data?: { summary?: { netProfit?: number } }
    }>('/api/v2/analytics?type=financial&period=30')

    const s = dash.data?.summary || {}
    const totalTrips = Number(s.totalTrips) || 0
    const completedTrips = Number(s.completedTrips) || 0
    let totalInvestments = 0
    let activeInvestments = 0
    let totalROI = 0

    if (role && hasFullSystemAccess(role as UserRole)) {
      const inv = await authFetchJson<{
        success: boolean
        data?: { investments?: Record<string, unknown>[] }
      }>(`/api/v2/investments?limit=200`)
      const rows = inv.data?.investments || []
      totalInvestments = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0)
      activeInvestments = rows
        .filter((r) => r.status === 'active')
        .reduce((a, r) => a + (Number(r.amount) || 0), 0)
      totalROI = rows.length ? rows.reduce((a, r) => a + (Number(r.expected_return) || 0), 0) / rows.length : 0
    }

    const stats: DashboardStats = {
      totalInvestments,
      activeInvestments,
      totalROI,
      totalBoats: Number(s.totalBoats) || 0,
      activeTrips: Math.max(0, totalTrips - completedTrips),
      totalCatch: Number(s.totalCatchKg) || 0,
      totalRevenue: Number(s.totalRevenue) || 0,
      totalExpenses: 0,
      netProfit: Number(fin.data?.summary?.netProfit) || 0,
      fishSold: 0,
      pendingOrders: 0,
    }

    return { success: true, data: stats } satisfies ApiResponse<DashboardStats>
  })
}

export function useRevenueData() {
  return useSWR(`/api/v2/analytics?type=financial&period=365`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: {
        monthlyProfitLoss?: { month: string; revenue: number; expenses: number }[]
      }
    }>(url)
    const rows = raw.data?.monthlyProfitLoss || []
    const data = rows.map((m) => ({
      name: m.month,
      revenue: Number(m.revenue) || 0,
      profit: (Number(m.revenue) || 0) - (Number(m.expenses) || 0),
    }))
    return { success: true, data } satisfies ApiResponse<typeof data>
  })
}

export function useCatchDistribution() {
  return useSWR(`/api/v2/analytics?type=catches&period=365`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { byGrade?: { grade: string; total_kg: number }[] }
    }>(url)
    const pie = (raw.data?.byGrade || []).map((b) => ({
      name: mapGradeToUi(String(b.grade)),
      value: Number(b.total_kg) || 0,
    }))
    return { success: true, data: pie } satisfies ApiResponse<{ name: string; value: number }[]>
  })
}

export function useInvestmentDistribution() {
  return useSWR(`/api/v2/analytics?type=investment-distribution&period=365`, async (url) => {
    const raw = await authFetchJson<{ success: boolean; data?: { name: string; value: number }[] }>(url)
    return { success: true, data: raw.data || [] } satisfies ApiResponse<{ name: string; value: number }[]>
  })
}

export function useROIAnalysis(_userId?: string) {
  const params = new URLSearchParams()
  params.set('limit', '50')
  if (_userId) params.set('investor_id', _userId)
  const url = `/api/v2/investments?${params}`
  return useSWR(['v2-roi-analysis', url], async () => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { investments: Record<string, unknown>[] }
    }>(url)
    const rows = raw.data?.investments || []
    const data: ROIRecord[] = rows.map((r) => ({
      id: String(r.id),
      investorId: String(r.investor_id || ''),
      packageId: String(r.package_id || ''),
      period: String(r.package_name || 'Investment').slice(0, 24),
      grossRevenue: Number(r.expected_return) || 0,
      expenses: 0,
      netProfit: (Number(r.expected_return) || 0) - (Number(r.amount) || 0),
      investorShare: Number(r.dividends_paid) || 0,
      dividendAmount: Number(r.dividends_paid) || 0,
      paidAt: Number(r.dividends_paid) > 0 ? String(r.updated_at || r.created_at || '') : undefined,
      status: (Number(r.dividends_paid) || 0) > 0 ? 'paid' : 'pending_payment',
    }))
    return { success: true, data } satisfies ApiResponse<ROIRecord[]>
  })
}

export type BoatPerformanceRow = {
  boatId: string
  boatName: string
  catchKg: number
  revenue: number
}

export function useBoatPerformance() {
  return useSWR('/api/v2/trips?limit=200', async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { trips: Record<string, unknown>[] }
    }>(url)
    const trips = raw.data?.trips || []
    const agg = new Map<string, { name: string; catchKg: number; revenue: number }>()
    for (const t of trips) {
      const id = String(t.boat_id || '')
      if (!id) continue
      const name = String(t.boat_name || 'Boat')
      const cur = agg.get(id) || { name, catchKg: 0, revenue: 0 }
      cur.catchKg += Number(t.total_catch_kg) || 0
      cur.revenue += Number(t.total_revenue) || 0
      agg.set(id, cur)
    }
    const data: BoatPerformanceRow[] = [...agg.entries()].map(([boatId, v]) => ({
      boatId,
      boatName: v.name,
      catchKg: v.catchKg,
      revenue: v.revenue,
    }))
    return { success: true, data } satisfies ApiResponse<BoatPerformanceRow[]>
  })
}

export function useInvestments(investorId?: string, status?: string) {
  const params = new URLSearchParams()
  params.set('limit', '50')
  if (investorId) params.set('investor_id', investorId)
  if (status) params.set('status', status)
  return useSWR(`/api/v2/investments?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { investments: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as Investment[], total: 0, page: 1, pageSize: 10, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<Investment>>
    }
    const items = (raw.data.investments || []).map(mapInvestmentRow)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<Investment>>
  })
}

export function useInvestmentPackages(type?: string, _status?: string) {
  return useSWR(`/api/v2/investment-packages`, async (url) => {
    const raw = await authFetchJson<{ success: boolean; data?: { packages: Record<string, unknown>[] } }>(url)
    let items = (raw.data?.packages || []).map(mapPackageRow)
    if (type && type !== 'all') {
      items = items.filter((p) => p.type === type)
    }
    return {
      success: true,
      data: { items, total: items.length, page: 1, pageSize: items.length, totalPages: 1 },
    } satisfies ApiResponse<PaginatedResponse<InvestmentPackage>>
  })
}

export function useBoats(filters?: Record<string, string>) {
  const qs = new URLSearchParams(filters || {})
  return useSWR(`/api/v2/boats?${qs}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { boats: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as Boat[], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<Boat>>
    }
    const items = (raw.data.boats || []).map(mapBoatRow)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<Boat>>
  })
}

export function useTrips(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {})
  return useSWR(`/api/v2/trips?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { trips: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as FishingTrip[], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<FishingTrip>>
    }
    const items = (raw.data.trips || []).map(mapTripRow)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<FishingTrip>>
  })
}

export function useCatches(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {})
  return useSWR(`/api/v2/catches?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { catches: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as Catch[], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<Catch>>
    }
    const items = (raw.data.catches || []).map(mapCatchRow)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<Catch>>
  })
}

export function useFishListings(status = 'available', limit = '50') {
  const params = new URLSearchParams()
  params.set('status', status)
  params.set('limit', limit)
  return useSWR(`/api/v2/marketplace?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { listings: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as FishListing[], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<FishListing>>
    }
    const items = (raw.data.listings || []).map(mapListingRow)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<FishListing>>
  })
}

export function useFishOrders(role: 'buyer' | 'seller') {
  const params = new URLSearchParams()
  params.set('role', role)
  params.set('limit', '50')
  return useSWR(`/api/v2/orders?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { orders: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as FishOrder[], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<FishOrder>>
    }
    const items = (raw.data.orders || []).map(mapFishOrder)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<FishOrder>>
  })
}

export function useWallet(userId: string | undefined) {
  return useSWR(userId ? '/api/v2/wallet?action=summary' : null, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: Record<string, unknown>
    }>(url)
    const d = raw.data || {}
    const w: Wallet = {
      id: 'wallet',
      userId: userId || '',
      balance: Number(d.balance) || 0,
      totalDeposits: Number(d.total_deposits) || 0,
      totalWithdrawals: Number(d.total_withdrawals) || 0,
      totalEarnings: Number(d.total_earnings) || 0,
      currency: 'KES',
    }
    return { success: true, data: w } satisfies ApiResponse<Wallet>
  })
}

export function useTransactions(userId: string | undefined) {
  return useSWR(userId ? `/api/v2/wallet?action=transactions&limit=50` : null, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { transactions: Record<string, unknown>[]; pagination: { total: number } }
    }>(url)
    const rows = raw.data?.transactions || []
    const items = rows.map((r) => mapTransactionRow(r, userId || ''))
    const total = raw.data?.pagination?.total ?? items.length
    return {
      success: true,
      data: { items, total, page: 1, pageSize: items.length, totalPages: 1 },
    } satisfies ApiResponse<PaginatedResponse<Transaction>>
  })
}

export function useBMUs(filters?: Record<string, string>) {
  const params = new URLSearchParams({ resource: 'bmus', limit: '100', ...(filters || {}) })
  return useSWR(`/api/v2/bmu?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { bmus: Record<string, unknown>[] }
    }>(url)
    const items = (raw.data?.bmus || []).map(mapBmuRow)
    return {
      success: true,
      data: { items, total: items.length, page: 1, pageSize: items.length, totalPages: 1 },
    } satisfies ApiResponse<PaginatedResponse<BMU>>
  })
}

export function useMaintenance(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {})
  return useSWR(`/api/v2/maintenance?${params}`, async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { records: Record<string, unknown>[]; pagination: { total: number; page: number; limit: number } }
    }>(url)
    if (!raw.success || !raw.data) {
      return {
        success: false,
        data: { items: [] as MaintenanceRecord[], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      } satisfies ApiResponse<PaginatedResponse<MaintenanceRecord>>
    }
    const items = (raw.data.records || []).map(mapMaintenanceRow)
    const p = raw.data.pagination
    return {
      success: true,
      data: {
        items,
        total: p.total,
        page: p.page,
        pageSize: p.limit,
        totalPages: Math.ceil(p.total / p.limit) || 1,
      },
    } satisfies ApiResponse<PaginatedResponse<MaintenanceRecord>>
  })
}

export async function createInvestment(body: { packageId: string; amount: number; investorId?: string }) {
  const res = await fetch('/api/v2/investments', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function createTrip(body: {
  boatId: string
  captainId?: string
  crew?: string[]
  fishingZone: string
}) {
  const res = await fetch('/api/v2/trips', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      boatId: body.boatId,
      captainId: body.captainId || undefined,
      departureTime: new Date().toISOString(),
      fishingZone: body.fishingZone,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function completeTrip(tripId: string) {
  const res = await fetch('/api/v2/trips', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: tripId, action: 'complete' }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function logCatch(body: {
  tripId: string
  fishType: string
  weight: number
  grade: string
  pricePerKg: number
}) {
  const res = await fetch('/api/v2/catches', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tripId: body.tripId,
      fishType: body.fishType,
      weight: body.weight,
      grade: mapGradeToDb(body.grade),
      pricePerKg: body.pricePerKg,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function createListing(body: {
  sellerId: string
  sellerName: string
  fishType: string
  quantity: number
  grade: string
  pricePerKg: number
  location: string
  landingSite: string
}) {
  const res = await fetch('/api/v2/marketplace', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fishType: body.fishType,
      quantityKg: body.quantity,
      grade: body.grade,
      pricePerKg: body.pricePerKg,
      location: body.location || body.landingSite,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function placeOrder(body: {
  listingId: string
  buyerId: string
  buyerName: string
  quantity: number
  deliveryAddress: string
}) {
  const res = await fetch('/api/v2/orders', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ listingId: body.listingId, quantity: body.quantity }],
      deliveryAddress: body.deliveryAddress,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function updateOrderStatus(orderId: string, action: string) {
  const res = await fetch('/api/v2/orders', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: orderId, action }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function walletTransaction(body: {
  userId: string
  action: 'deposit' | 'withdraw'
  amount: number
  description?: string
}) {
  const res = await fetch('/api/v2/wallet', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: body.action === 'withdraw' ? 'withdraw' : 'deposit',
      amount: body.amount,
      description: body.description,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function recordExpense(body: {
  category: string
  description: string
  amount: number
  boatId?: string
  tripId?: string
  date?: string
}) {
  const res = await fetch('/api/v2/expenses', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: body.category,
      description: body.description,
      amount: body.amount,
      boatId: body.boatId,
      tripId: body.tripId,
      date: body.date,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string; data?: unknown }>
}

export async function scheduleMaintenance(body: {
  boatId: string
  type: string
  description: string
  cost: number
  technicianName: string
  scheduledDate: string
}) {
  const res = await fetch('/api/v2/maintenance', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      boatId: body.boatId,
      type: body.type,
      description: body.description,
      cost: body.cost,
      technicianName: body.technicianName,
      scheduledDate: body.scheduledDate,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function createBoat(body: {
  registrationNumber: string
  name: string
  type: string
  capacityKg?: number
  engineType?: string
  enginePowerHp?: number
}) {
  const res = await fetch('/api/v2/boats', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationNumber: body.registrationNumber,
      name: body.name,
      type: body.type,
      capacityKg: body.capacityKg,
      engineType: body.engineType,
      enginePowerHp: body.enginePowerHp,
    }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export async function updateProfile(body: {
  firstName?: string
  lastName?: string
  phone?: string
  county?: string
}) {
  return authFetchJson<{ success: boolean; error?: string }>('/api/v2/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      county: body.county,
    }),
  })
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  return authFetchJson<{ success: boolean; error?: string }>('/api/v2/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: newPassword,
      currentPassword,
    }),
  })
}

export async function updateNotificationPreferences(prefs: Record<string, boolean>) {
  return authFetchJson<{ success: boolean; error?: string }>('/api/v2/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationPreferences: prefs }),
  })
}

export async function createLandingSite(body: {
  name: string
  county: string
  bmuId?: string
}) {
  return authFetchJson<{ success: boolean; data?: { id: string }; error?: string }>(
    '/api/v2/landing-sites',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: body.name, county: body.county, bmuId: body.bmuId }),
    },
  )
}

export function useNotifications(_userId?: string, unreadOnly = false) {
  const params = new URLSearchParams()
  params.set('limit', '50')
  if (unreadOnly) params.set('unread', '1')
  return useSWR(`/api/v2/notifications?${params}`, swrFetcher)
}

export function useColdStorageInventory() {
  return useSWR('/api/v2/storage?type=records&limit=100', swrFetcher)
}

export function useFishSpecies() {
  return useSWR('/api/v2/fish-species', async (url) => {
    const raw = await authFetchJson<{
      success: boolean
      data?: { species: { id: string; name: string; market_price_per_kg?: number }[] }
    }>(url)
    return raw.data?.species || []
  })
}

export async function createAdminUser(body: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
}) {
  return authFetchJson<{ success: boolean; data?: { id: string }; error?: string }>('/api/v2/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function createBmu(body: { name: string; code: string; county: string }) {
  return authFetchJson<{ success: boolean; data?: { bmu: unknown }; error?: string }>('/api/v2/bmu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function createStorageFacility(body: {
  name: string
  code: string
  county: string
  capacityKg: number
  type?: string
  dailyRatePerKg?: number
}) {
  return authFetchJson<{ success: boolean; data?: { facility: unknown }; error?: string }>(
    '/api/v2/storage',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

export async function issueLicense(body: {
  userId: string
  licenseType: 'fishing' | 'trading' | 'transportation'
  expiresDate: string
  licenseNumber?: string
}) {
  return authFetchJson<{ success: boolean; data?: { license: unknown }; error?: string }>(
    '/api/v2/licenses',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}
