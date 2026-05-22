import crypto from 'crypto'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface ApiToken {
  id: string
  tenant_id: string
  user_id: string
  name: string
  scopes: string[] | null
  last_used_at: string | null
  expires_at: string | null
  revoked: number
  created_at: string
}

export interface ApiTokenWithSecret extends ApiToken {
  token: string
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateToken(): string {
  return `aqua_${crypto.randomBytes(32).toString('hex')}`
}

export async function listApiTokens(
  tenantId: string,
  userId: string,
): Promise<ApiToken[]> {
  const rows = await query<Omit<ApiToken, 'scopes'> & { scopes: string | string[] | null }>(
    `SELECT id, tenant_id, user_id, name, scopes, last_used_at, expires_at, revoked, created_at
     FROM api_tokens
     WHERE ${tenantWhere()} AND user_id = ? AND revoked = 0
     ORDER BY created_at DESC`,
    [tenantId, userId],
  )
  return rows.map((row) => ({
    ...row,
    scopes: row.scopes
      ? typeof row.scopes === 'string'
        ? (JSON.parse(row.scopes) as string[])
        : row.scopes
      : null,
  }))
}

export async function createApiToken(
  tenantId: string,
  userId: string,
  name: string,
  scopes?: string[],
  expiresAt?: string,
): Promise<ApiTokenWithSecret> {
  const plainToken = generateToken()
  const tokenHash = hashToken(plainToken)
  const id = generateId()

  await execute(
    `INSERT INTO api_tokens (id, tenant_id, user_id, name, token_hash, scopes, expires_at, revoked)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      tenantId,
      userId,
      name,
      tokenHash,
      scopes?.length ? JSON.stringify(scopes) : null,
      expiresAt ?? null,
    ],
  )

  const row = await queryOne<ApiToken>(
    `SELECT id, tenant_id, user_id, name, scopes, last_used_at, expires_at, revoked, created_at
     FROM api_tokens WHERE id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to create token')

  return { ...row, token: plainToken }
}

export async function revokeApiToken(
  tenantId: string,
  tokenId: string,
  userId: string,
): Promise<void> {
  const result = await execute(
    `UPDATE api_tokens SET revoked = 1
     WHERE id = ? AND ${tenantWhere()} AND user_id = ? AND revoked = 0`,
    [tokenId, tenantId, userId],
  )
  if (result.affectedRows === 0) {
    throw new Error('Token not found')
  }
}
