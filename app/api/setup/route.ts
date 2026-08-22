import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const LEGACY_DB_NAMES = ['aqualedger32', 'aqualedger']

function rewriteSqlForDb(sql: string, dbName: string): string {
  let out = sql
  for (const legacy of LEGACY_DB_NAMES) {
    out = out.replace(new RegExp(`USE\\s+${legacy}\\s*;`, 'gi'), `USE ${dbName};`)
  }
  if (!/^\s*USE\s+/im.test(out)) {
    out = `USE ${dbName};\n\n${out}`
  }

  // Strip MySQL incompatible 'IF NOT EXISTS' from ALTER ADD statements
  out = out.replace(/(\bADD(?:\s+COLUMN|\s+INDEX|\s+KEY|\s+UNIQUE\s+KEY)?)\s+IF\s+NOT\s+EXISTS/gi, '$1')

  // Strip MySQL incompatible 'IF NOT EXISTS' from CREATE INDEX statements
  out = out.replace(/(CREATE(?:\s+UNIQUE)?\s+INDEX)\s+IF\s+NOT\s+EXISTS/gi, '$1')

  return out
}

async function handleSetup(providedKey: string | null) {
  const expectedSecret = process.env.SETUP_SECRET || process.env.CRON_SECRET || '1987'
  
  // Accept default secret '1987' or matched expected Secret
  const isAuthorized = providedKey === expectedSecret || providedKey === '1987'

  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized. Invalid setup secret key provided.',
        hint: 'Use ?key=1987 or provide your configured SETUP_SECRET.',
      },
      { status: 401 }
    )
  }

  const logs: string[] = []
  const migrationResults: Array<{ file: string; status: 'applied' | 'skipped' | 'failed'; detail?: string }> = []
  
  const dbName = process.env.DB_NAME || 'aquaerp_operating'
  const host = process.env.DB_HOST || 'localhost'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''

  const rootDir = process.cwd()

  logs.push(`Connecting to MySQL host ${host}:${port} as user '${user}'...`)

  try {
    // 1. Initial connection without database selection to create DB if needed
    const adminConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    })

    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await adminConn.end()
    logs.push(`Database '${dbName}' confirmed / created successfully.`)

    // 2. Connect directly to target database
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database: dbName,
      multipleStatements: true,
    })

    // 3. Check and apply base schema.sql if needed
    const schemaPath = path.join(rootDir, 'database', 'schema.sql')
    let schemaApplied = false

    if (fs.existsSync(schemaPath)) {
      try {
        logs.push('Executing base database schema (database/schema.sql)...')
        const rawSql = fs.readFileSync(schemaPath, 'utf8')
        const sql = rewriteSqlForDb(rawSql, dbName)
        await conn.query(sql)
        schemaApplied = true
        logs.push('Base schema.sql applied successfully.')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logs.push(`Base schema load note: ${msg.slice(0, 200)}`)
      }
    } else {
      logs.push('Notice: database/schema.sql file not found; skipping base schema load.')
    }

    // 4. Scan and run migrations from database/migrations/
    const migrationsDir = path.join(rootDir, 'database', 'migrations')
    if (fs.existsSync(migrationsDir)) {
      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()

      logs.push(`Found ${files.length} migration files in database/migrations/.`)

      for (const file of files) {
        const relPath = path.join('database', 'migrations', file)
        const filePath = path.join(migrationsDir, file)
        const rawSql = fs.readFileSync(filePath, 'utf8')
        const sql = rewriteSqlForDb(rawSql, dbName)

        try {
          await conn.query(sql)
          migrationResults.push({ file, status: 'applied' })
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          if (
            msg.includes('Duplicate column') ||
            msg.includes('already exists') ||
            msg.includes('errno: 150') ||
            msg.includes('Duplicate key') ||
            msg.includes('Duplicate entry') ||
            msg.includes('Table') && msg.includes('already exists')
          ) {
            migrationResults.push({ file, status: 'skipped', detail: msg.slice(0, 160) })
          } else {
            migrationResults.push({ file, status: 'failed', detail: msg })
            logs.push(`Error executing migration ${file}: ${msg}`)
          }
        }
      }
    } else {
      logs.push('Notice: database/migrations/ folder not found.')
    }

    // 5. Ensure Super Admin user exists
    let superAdminStatus = 'already_exists'
    try {
      const email = 'admin@aqualedger.co.ke'
      const [rows] = await conn.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email])
      const existing = (rows as Array<{ id: string }>)[0]

      if (!existing) {
        const passwordHash = await bcrypt.hash('Admin@123', 12)
        const adminId = randomUUID()

        await conn.execute(
          `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
           VALUES (?, ?, ?, 'Platform', 'Admin', 'super_admin', 'active', TRUE)`,
          [adminId, email, passwordHash]
        )

        await conn.execute(
          `INSERT IGNORE INTO wallets (id, user_id, balance, currency, status)
           VALUES (?, ?, 0, 'KES', 'active')`,
          [randomUUID(), adminId]
        )

        superAdminStatus = 'created'
        logs.push(`Created default super admin user: ${email}`)
      } else {
        logs.push(`Super admin user (${email}) is ready.`)
      }
    } catch (adminErr) {
      const msg = adminErr instanceof Error ? adminErr.message : String(adminErr)
      logs.push(`Super admin check note: ${msg}`)
    }

    await conn.end()

    const successCount = migrationResults.filter((m) => m.status === 'applied').length
    const skippedCount = migrationResults.filter((m) => m.status === 'skipped').length
    const failedCount = migrationResults.filter((m) => m.status === 'failed').length

    return NextResponse.json({
      success: failedCount === 0,
      timestamp: new Date().toISOString(),
      database: dbName,
      schemaApplied,
      superAdminStatus,
      summary: {
        totalMigrations: migrationResults.length,
        applied: successCount,
        skipped: skippedCount,
        failed: failedCount,
      },
      migrations: migrationResults,
      logs,
      adminCredentials: {
        email: 'admin@aqualedger.co.ke',
        password: 'Admin@123',
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        logs,
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const key = searchParams.get('key') || searchParams.get('secret')
  return handleSetup(key)
}

export async function POST(req: NextRequest) {
  let key: string | null = null
  try {
    const body = await req.json()
    key = body.key || body.secret
  } catch {
    const searchParams = req.nextUrl.searchParams
    key = searchParams.get('key') || searchParams.get('secret')
  }
  return handleSetup(key)
}
