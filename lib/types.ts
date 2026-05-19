// Core User Types
export type UserRole = 'super_admin' | 'investor' | 'boat_owner' | 'fisherman' | 'fish_buyer' | 'bmu_official'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  createdAt: string
  status: 'active' | 'inactive' | 'suspended'
  region?: string
  bmuId?: string
}

// Investment Types
export interface InvestmentPackage {
  id: string
  name: string
  type: 'deep_sea' | 'lake_fishing' | 'fish_transport' | 'cold_storage' | 'fish_trading'
  description: string
  minInvestment: number
  expectedROI: number
  riskLevel: 'low' | 'medium' | 'high'
  duration: number // in months
  totalFunding: number
  currentFunding: number
  status: 'open' | 'funded' | 'active' | 'completed'
  investors: InvestorContribution[]
  createdAt: string
}

export interface InvestorContribution {
  investorId: string
  investorName: string
  amount: number
  percentage: number
  date: string
}

export interface Investment {
  id: string
  investorId: string
  packageId: string
  packageName: string
  amount: number
  expectedReturn: number
  actualReturn: number
  status: 'active' | 'matured' | 'withdrawn'
  startDate: string
  endDate: string
  dividendsPaid: number
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  totalEarnings: number
  currency: string
}

export interface Transaction {
  id: string
  walletId: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'dividend' | 'investment' | 'refund'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  reference: string
  createdAt: string
}

// Boat & Fleet Types
export interface Boat {
  id: string
  registrationNumber: string
  name: string
  ownerId: string
  ownerName: string
  type: 'deep_sea' | 'lake' | 'river' | 'coastal'
  engineType: string
  engineCapacity: number
  capacity: number // in kg
  crew: CrewMember[]
  status: 'active' | 'maintenance' | 'docked' | 'retired'
  insuranceExpiry: string
  licenseExpiry: string
  gpsEnabled: boolean
  lastLocation?: { lat: number; lng: number }
  lastTrip?: string
  totalTrips: number
  totalCatch: number
  fuelEfficiency: number
  createdAt: string
}

export interface CrewMember {
  id: string
  name: string
  role: 'captain' | 'fisherman' | 'helper'
  phone: string
  dailyWage: number
  status: 'active' | 'inactive'
}

export interface FishingTrip {
  id: string
  boatId: string
  boatName: string
  captainId: string
  captainName: string
  crew: string[]
  startTime: string
  endTime?: string
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  fishingZone: string
  fuelUsed: number
  fuelCost: number
  catches: Catch[]
  totalCatch: number
  totalRevenue: number
  expenses: TripExpense[]
  totalExpenses: number
  netProfit: number
  notes?: string
}

export interface Catch {
  id: string
  tripId: string
  fishType: string
  weight: number
  grade: 'premium' | 'export' | 'local'
  pricePerKg: number
  totalValue: number
  buyerId?: string
  buyerName?: string
  soldAt?: string
  /** ISO-ish timestamp from `recorded_at` when present */
  loggedAt?: string
}

export interface TripExpense {
  id: string
  tripId: string
  category: 'fuel' | 'ice' | 'crew_wages' | 'food' | 'equipment' | 'repairs' | 'license' | 'other'
  description: string
  amount: number
  date: string
}

// Maintenance Types
export interface MaintenanceRecord {
  id: string
  boatId: string
  boatName: string
  type: 'scheduled' | 'emergency' | 'inspection'
  description: string
  cost: number
  parts: string[]
  technicianName: string
  status: 'scheduled' | 'in_progress' | 'completed'
  scheduledDate: string
  completedDate?: string
}

// Fish Market Types
export interface FishListing {
  id: string
  sellerId: string
  sellerName: string
  fishType: string
  quantity: number
  availableQuantity: number
  grade: 'premium' | 'export' | 'local'
  pricePerKg: number
  location: string
  landingSite: string
  status: 'available' | 'reserved' | 'sold'
  images?: string[]
  createdAt: string
  expiresAt: string
}

export interface FishOrder {
  id: string
  listingId: string
  buyerId: string
  buyerName: string
  buyerPhone?: string
  sellerId: string
  sellerName: string
  fishType: string
  quantity: number
  pricePerKg: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  deliveryAddress: string
  createdAt: string
  deliveredAt?: string
}

// BMU Types
export interface BMU {
  id: string
  name: string
  region: string
  county: string
  landingSite: string
  chairperson: string
  registeredBoats: number
  registeredFishermen: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface License {
  id: string
  type: 'fishing' | 'boat' | 'trader' | 'exporter' | 'transporter'
  holderId: string
  holderName: string
  bmuId: string
  licenseNumber: string
  issuedDate: string
  expiryDate: string
  status: 'valid' | 'expired' | 'suspended' | 'revoked'
  fee: number
}

// Financial Types
export interface Expense {
  id: string
  category: 'fuel' | 'maintenance' | 'wages' | 'insurance' | 'licenses' | 'storage' | 'transport' | 'other'
  description: string
  amount: number
  boatId?: string
  tripId?: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
}

export interface ROIRecord {
  id: string
  investorId: string
  packageId: string
  period: string
  grossRevenue: number
  expenses: number
  netProfit: number
  investorShare: number
  dividendAmount: number
  paidAt?: string
  status: 'calculated' | 'pending_payment' | 'paid'
}

// Analytics Types
export interface DashboardStats {
  totalInvestments: number
  activeInvestments: number
  totalROI: number
  totalBoats: number
  activeTrips: number
  totalCatch: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  fishSold: number
  pendingOrders: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}

// Cold Storage Types
export interface ColdStorageUnit {
  id: string
  name: string
  location: string
  capacity: number
  usedCapacity: number
  temperature: number
  status: 'operational' | 'maintenance' | 'offline'
  operatorId: string
  operatorName: string
}

export interface StorageRecord {
  id: string
  unitId: string
  fishType: string
  quantity: number
  entryDate: string
  expectedExitDate: string
  actualExitDate?: string
  ownerId: string
  ownerName: string
  status: 'stored' | 'retrieved' | 'spoiled'
  dailyRate: number
  totalCharge: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
