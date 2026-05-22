import crypto from 'crypto'
import { queryOne, execute } from '@/lib/db'
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateTotpSecret,
  getTotpUri,
  verifyTotp,
} from './totp'

export interface MfaStatus {
  enabled: boolean
  configured: boolean
  updatedAt: string | null
}

export interface MfaEnrollment {
  secret: string
  otpauthUri: string
  backupCodes: string[]
}

export async function getMfaStatus(userId: string): Promise<MfaStatus> {
  const row = await queryOne<{ enabled: number; updated_at: string }>(
    `SELECT enabled, updated_at FROM user_mfa WHERE user_id = ?`,
    [userId],
  )

  return {
    enabled: Boolean(row?.enabled),
    configured: Boolean(row),
    updatedAt: row?.updated_at ?? null,
  }
}

export async function startMfaEnrollment(
  userId: string,
  accountLabel: string,
): Promise<MfaEnrollment> {
  const secret = generateTotpSecret()
  const secretEncrypted = encryptTotpSecret(secret)
  const backupCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex'))

  const existing = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM user_mfa WHERE user_id = ?`,
    [userId],
  )

  if (existing) {
    await execute(
      `UPDATE user_mfa
       SET secret_encrypted = ?, enabled = 0, backup_codes = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [secretEncrypted, JSON.stringify(backupCodes), userId],
    )
  } else {
    await execute(
      `INSERT INTO user_mfa (user_id, secret_encrypted, enabled, backup_codes)
       VALUES (?, ?, 0, ?)`,
      [userId, secretEncrypted, JSON.stringify(backupCodes)],
    )
  }

  return {
    secret,
    otpauthUri: getTotpUri(secret, accountLabel),
    backupCodes,
  }
}

export async function confirmMfaEnrollment(
  userId: string,
  token: string,
): Promise<MfaStatus> {
  const row = await queryOne<{ secret_encrypted: string }>(
    `SELECT secret_encrypted FROM user_mfa WHERE user_id = ?`,
    [userId],
  )
  if (!row) throw new Error('MFA not started')

  const secret = decryptTotpSecret(row.secret_encrypted)
  if (!secret || !verifyTotp(secret, token)) {
    throw new Error('Invalid verification code')
  }

  await execute(`UPDATE user_mfa SET enabled = 1, updated_at = NOW() WHERE user_id = ?`, [
    userId,
  ])
  return getMfaStatus(userId)
}

export async function verifyMfaToken(userId: string, token: string): Promise<boolean> {
  const row = await queryOne<{ secret_encrypted: string; backup_codes: string; enabled: number }>(
    `SELECT secret_encrypted, backup_codes, enabled FROM user_mfa WHERE user_id = ?`,
    [userId],
  )
  if (!row?.enabled) return true

  const secret = decryptTotpSecret(row.secret_encrypted)
  if (secret && verifyTotp(secret, token)) return true

  try {
    const codes: string[] = JSON.parse(row.backup_codes || '[]')
    const idx = codes.indexOf(token.replace(/\s/g, ''))
    if (idx >= 0) {
      codes.splice(idx, 1)
      await execute(`UPDATE user_mfa SET backup_codes = ? WHERE user_id = ?`, [
        JSON.stringify(codes),
        userId,
      ])
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

export async function disableMfa(userId: string): Promise<MfaStatus> {
  await execute(`UPDATE user_mfa SET enabled = 0, updated_at = NOW() WHERE user_id = ?`, [
    userId,
  ])
  return getMfaStatus(userId)
}

