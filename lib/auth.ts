import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { query, queryOne, execute, generateId } from './db'

// Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  county: string | null
  role: UserRole
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  avatar_url: string | null
  kyc_verified: boolean
  email_verified: boolean
  created_at: Date
}

export type UserRole = 'super_admin' | 'investor' | 'boat_owner' | 'fisherman' | 'fish_buyer' | 'bmu_official'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface Session {
  id: string
  user_id: string
  refresh_token: string
  expires_at: Date
  ip_address: string | null
  user_agent: string | null
}

// Constants
const DEV_JWT_FALLBACK = 'dev-only-jwt-secret-not-for-production'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (min 32 characters) in production')
  }
  return secret || DEV_JWT_FALLBACK
}

function getJwtSecretOrThrow(): string {
  return getJwtSecret()
}
const JWT_EXPIRES_IN = '15m' // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const SALT_ROUNDS = 12

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT functions
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecretOrThrow(), { expiresIn: JWT_EXPIRES_IN })
}

export function generateRefreshToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID()
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecretOrThrow()) as JWTPayload
  } catch {
    return null
  }
}

// User functions
export async function createUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: UserRole
  /** Self-service sign-up should use `active` so JWT-protected APIs work immediately */
  initialStatus?: 'active' | 'pending'
}): Promise<User> {
  const id = generateId()
  const passwordHash = await hashPassword(data.password)
  const status = data.initialStatus ?? 'pending'

  await query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.email.toLowerCase(), passwordHash, data.firstName, data.lastName, data.phone || null, data.role || 'fisherman', status]
  )
  
  // Create wallet for user
  await query(
    `INSERT INTO wallets (id, user_id, balance, currency, status)
     VALUES (?, ?, 0, 'KES', 'active')`,
    [generateId(), id]
  )
  
  // Create credit score record
  await query(
    `INSERT INTO credit_scores (id, user_id, score, grade)
     VALUES (?, ?, 300, 'E')`,
    [generateId(), id]
  )
  
  const user = await getUserById(id)
  if (!user) throw new Error('Failed to create user')
  
  return user
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, email, first_name, last_name, phone, county, role, status, avatar_url, kyc_verified, email_verified, created_at
     FROM users WHERE id = ?`,
    [id]
  )
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  return queryOne<User & { password_hash: string }>(
    `SELECT id, email, password_hash, first_name, last_name, phone, county, role, status, avatar_url, kyc_verified, email_verified, created_at
     FROM users WHERE email = ?`,
    [email.toLowerCase()]
  )
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await execute(
    `UPDATE users SET last_login = NOW() WHERE id = ?`,
    [userId]
  )
}

// Session functions
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const user = await getUserById(userId)
  if (!user) throw new Error('User not found')
  
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
  
  const refreshToken = generateRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN)
  
  // Store refresh token in database
  await query(
    `INSERT INTO sessions (id, user_id, refresh_token, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [generateId(), userId, refreshToken, expiresAt, ipAddress || null, userAgent || null]
  )
  
  // Update last login
  await updateUserLastLogin(userId)
  
  return { accessToken, refreshToken, expiresAt }
}

export async function refreshSession(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
  const session = await queryOne<Session>(
    `SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > NOW()`,
    [refreshToken]
  )
  
  if (!session) return null
  
  // Delete old session
  await execute(`DELETE FROM sessions WHERE id = ?`, [session.id])
  
  // Create new session
  return createSession(session.user_id)
}

export async function deleteSession(refreshToken: string): Promise<void> {
  await execute(`DELETE FROM sessions WHERE refresh_token = ?`, [refreshToken])
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await execute(`DELETE FROM sessions WHERE user_id = ?`, [userId])
}

// Cookie helpers
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  })
  
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}

export async function getAuthFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  
  if (!accessToken) return null
  
  return verifyAccessToken(accessToken)
}

// Auth middleware helper
export async function requireAuth(): Promise<JWTPayload> {
  const payload = await getAuthFromCookies()
  
  if (!payload) {
    throw new Error('Unauthorized')
  }
  
  // Verify user still exists and is active
  const user = await getUserById(payload.userId)
  if (!user || user.status !== 'active') {
    throw new Error('Unauthorized')
  }
  
  return payload
}

export async function requireRole(allowedRoles: UserRole[]): Promise<JWTPayload> {
  const payload = await requireAuth()
  
  if (!allowedRoles.includes(payload.role)) {
    throw new Error('Forbidden')
  }
  
  return payload
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true }
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}
