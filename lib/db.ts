import mysql from 'mysql2/promise'
import type { ExecuteValues } from 'mysql2'
import { DB_NAME } from './constants'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Execute a query with parameters
export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const [rows] = await pool.execute(sql, (params ?? []) as ExecuteValues)
  return rows as T[]
}

// Execute a single query and return first result
export async function queryOne<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results[0] || null
}

// Execute an insert and return the insert id
export async function insert(
  sql: string,
  params?: unknown[]
): Promise<{ insertId: number; affectedRows: number }> {
  const pool = getPool()
  const [result] = await pool.execute(sql, (params ?? []) as ExecuteValues)
  const resultSet = result as mysql.ResultSetHeader
  return {
    insertId: resultSet.insertId,
    affectedRows: resultSet.affectedRows,
  }
}

// Execute an update/delete and return affected rows
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<{ affectedRows: number }> {
  const pool = getPool()
  const [result] = await pool.execute(sql, (params ?? []) as ExecuteValues)
  const resultSet = result as mysql.ResultSetHeader
  return {
    affectedRows: resultSet.affectedRows,
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    const result = await callback(connection as unknown as mysql.Connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const pool = getPool()
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID()
}

// Helper to build WHERE clause from filters
export function buildWhereClause(
  filters: Record<string, unknown>,
  allowedFields: string[]
): { clause: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && allowedFields.includes(key)) {
      conditions.push(`${key} = ?`)
      params.push(value)
    }
  }
  
  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  }
}

// Helper to build pagination
export function buildPagination(
  page: number = 1,
  limit: number = 20
): { clause: string; offset: number } {
  const safeLimit = Math.min(Math.max(limit, 1), 100)
  const safePage = Math.max(page, 1)
  const offset = (safePage - 1) * safeLimit
  
  return {
    clause: `LIMIT ${safeLimit} OFFSET ${offset}`,
    offset,
  }
}

// Helper to build ORDER BY clause
export function buildOrderBy(
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  allowedFields: string[]
): string {
  const safeField = allowedFields.includes(sortBy) ? sortBy : 'created_at'
  const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'
  return `ORDER BY ${safeField} ${safeOrder}`
}

// Export types
export type { Pool, Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
