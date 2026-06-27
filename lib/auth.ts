import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies, headers } from 'next/headers'
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

export type UserRole = 'super_admin' | 'investor' | 'user'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  /** Set when a super_admin is impersonating another user */
  impersonatedBy?: string
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

const JWT_EXPIRES_IN = '15m' // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const REFRESH_TOKEN_REMEMBER_ME = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
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
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN })
}

export function generateRefreshToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID()
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
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
    [id, data.email.toLowerCase(), passwordHash, data.firstName, data.lastName, data.phone || null, data.role || 'user', status]
  )
  
  // Create wallet and credit score — non-blocking: wallets require a tenant_id
  // which is not always available at the user-creation stage (e.g. storefront signups).
  // Tenant-scoped wallets are created separately during tenant onboarding.
  try {
    await query(
      `INSERT INTO wallets (id, user_id, balance, currency, status, tenant_id)
       VALUES (?, ?, 0, 'KES', 'active', (SELECT id FROM tenants LIMIT 1))`,
      [generateId(), id]
    )
  } catch {
    // Non-critical: wallet will be provisioned when the user joins a tenant
  }
  
  try {
    await query(
      `INSERT INTO credit_scores (id, user_id, score, grade)
       VALUES (?, ?, 300, 'E')`,
      [generateId(), id]
    )
  } catch {
    // Non-critical: credit score is created on first financial activity
  }
  
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
  userAgent?: string,
  rememberMe = false,
  impersonatedBy?: string,
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const user = await getUserById(userId)
  if (!user) throw new Error('User not found')
  
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    ...(impersonatedBy ? { impersonatedBy } : {}),
  })
  
  const refreshToken = generateRefreshToken()
  const expiresAt = new Date(
    Date.now() + (rememberMe ? REFRESH_TOKEN_REMEMBER_ME : REFRESH_TOKEN_EXPIRES_IN),
  )
  
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

// Domain helper
async function getCookieDomain(): Promise<string | undefined> {
  try {
    const hdrs = await headers()
    const host = hdrs.get('host')
    if (!host) return undefined
    
    const hostname = host.split(':')[0].toLowerCase()

    // If it's an IP address, do not set domain (must be host-only cookie)
    const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/
    if (ipRegex.test(hostname) || hostname === '[::1]') {
      return undefined
    }

    // Do NOT set domain for localhost or *.localhost — Chrome treats 'localhost'
    // as a public suffix and silently rejects cookies with domain=.localhost,
    // so we use host-only cookies (no domain attribute) for local development.
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return undefined
    }

    // If there's a PLATFORM_HOST configured, use it (prefixed with a dot)
    const platformHost = process.env.PLATFORM_HOST
    if (platformHost) {
      const cleanPlatformHost = platformHost.split(':')[0].toLowerCase()
      if (hostname === cleanPlatformHost || hostname.endsWith('.' + cleanPlatformHost)) {
        return '.' + cleanPlatformHost
      }
    }

    // Fallback: if hostname has subdomains, try to find a base domain.
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      if (parts.length === 2) {
        return '.' + hostname
      }
      const last = parts[parts.length - 1]
      const prev = parts[parts.length - 2]
      const slds = ['co', 'com', 'org', 'net', 'gov', 'ac', 'edu', 'or', 'go', 'ne']
      if (slds.includes(prev) && parts.length >= 3) {
        return '.' + parts.slice(-3).join('.')
      }
      return '.' + parts.slice(-2).join('.')
    }
  } catch {
    // If headers() is called outside of request context (e.g. in some build/test environment)
  }
  return undefined
}

// Cookie helpers
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
  options?: { rememberMe?: boolean },
): Promise<void> {
  const cookieStore = await cookies()
  const rememberMe = options?.rememberMe ?? false
  const domain = await getCookieDomain()
  
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 60 * 60 : 15 * 60,
    ...(domain ? { domain } : {}),
  })
  
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    expires: expiresAt,
    ...(domain ? { domain } : {}),
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  const domain = await getCookieDomain()
  
  // Clear host-only cookies (without domain)
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('admin_refresh_token')
  
  // Clear wildcard/subdomain cookies if domain is resolved
  if (domain) {
    cookieStore.delete({ name: 'access_token', domain, path: '/' })
    cookieStore.delete({ name: 'refresh_token', domain, path: '/' })
    cookieStore.delete({ name: 'admin_refresh_token', domain, path: '/' })
  }
}

/** Preserve super-admin refresh token while impersonating another user */
export async function setAdminRefreshCookie(refreshToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  const domain = await getCookieDomain()
  cookieStore.set('admin_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    maxAge: 7 * 24 * 60 * 60,
    ...(domain ? { domain } : {}),
  })
}

export async function getAdminRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('admin_refresh_token')?.value ?? null
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
