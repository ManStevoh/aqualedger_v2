/**
 * Shared JWT secret resolution for Node route handlers and Edge middleware.
 * Keep this module free of Node-only imports so middleware can use it safely.
 */
const DEV_JWT_FALLBACK = 'dev-only-jwt-secret-not-for-production'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (min 32 characters) in production')
  }
  return secret || DEV_JWT_FALLBACK
}
