/**
 * One-off DB fix: align wallet/transactions + investment returns tables with app expectations.
 *
 * Run with: npx ts-node database/fix-investments-wallet-schema.ts
 */
import 'dotenv/config'
import mysql from 'mysql2/promise'

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aqualedger32',
}

async function columnExists(
  conn: mysql.Connection,
  table: string,
  column: string,
): Promise<boolean> {
  const [rows] = (await conn.execute(
    `SELECT 1 as ok
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [config.database, table, column],
  )) as [{ ok: 1 }[], unknown]
  return rows.length > 0
}

async function tableExists(conn: mysql.Connection, table: string): Promise<boolean> {
  const [rows] = (await conn.execute(
    `SELECT 1 as ok
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
     LIMIT 1`,
    [config.database, table],
  )) as [{ ok: 1 }[], unknown]
  return rows.length > 0
}

async function getColumnType(conn: mysql.Connection, table: string, column: string): Promise<string | null> {
  const [rows] = (await conn.execute(
    `SELECT COLUMN_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [config.database, table, column],
  )) as [{ COLUMN_TYPE: string }[], unknown]
  return rows[0]?.COLUMN_TYPE || null
}

async function main() {
  const conn = await mysql.createConnection(config)
  try {
    // 1) investment_returns table
    if (!(await tableExists(conn, 'investment_returns'))) {
      await conn.execute(`
        CREATE TABLE investment_returns (
          id VARCHAR(36) PRIMARY KEY,
          investment_id VARCHAR(36) NOT NULL,
          amount DECIMAL(15, 2) NOT NULL,
          status ENUM('pending','paid','failed','cancelled') DEFAULT 'pending',
          paid_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
          INDEX idx_investment_id (investment_id),
          INDEX idx_status (status),
          INDEX idx_paid_at (paid_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)
      console.log('✅ Created investment_returns')
    } else {
      console.log('ℹ️ investment_returns already exists')
    }

    // 2) transactions columns expected by wallet + investments routes
    if (!(await columnExists(conn, 'transactions', 'fee'))) {
      await conn.execute(`ALTER TABLE transactions ADD COLUMN fee DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER amount`)
      console.log('✅ Added transactions.fee')
    } else {
      console.log('ℹ️ transactions.fee already exists')
    }

    if (!(await columnExists(conn, 'transactions', 'reference'))) {
      await conn.execute(`ALTER TABLE transactions ADD COLUMN reference VARCHAR(120) NULL AFTER status`)
      console.log('✅ Added transactions.reference')
    } else {
      console.log('ℹ️ transactions.reference already exists')
    }

    // Ensure transactions.type supports 'investment' (and aligns with app usage)
    const colType = await getColumnType(conn, 'transactions', 'type')
    if (colType && colType.toLowerCase().startsWith('enum(') && !colType.includes("'investment'")) {
      // Keep existing values and add 'investment'
      const withoutEnum = colType.slice(5, -1) // remove enum( ... )
      const values = withoutEnum
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      values.push("'investment'")
      const enumSql = `ENUM(${Array.from(new Set(values)).join(',')})`
      await conn.execute(`ALTER TABLE transactions MODIFY COLUMN type ${enumSql} NOT NULL`)
      console.log("✅ Added 'investment' to transactions.type enum")
    } else {
      console.log("ℹ️ transactions.type already supports 'investment' (or is not an enum)")
    }

    // 3) investments table: app uses investor_id
    if (!(await columnExists(conn, 'investments', 'investor_id'))) {
      await conn.execute(`ALTER TABLE investments ADD COLUMN investor_id VARCHAR(36) NULL AFTER id`)
      console.log('✅ Added investments.investor_id')
      // Best-effort backfill if old schema used user_id
      if (await columnExists(conn, 'investments', 'user_id')) {
        await conn.execute(`UPDATE investments SET investor_id = user_id WHERE investor_id IS NULL`)
        console.log('✅ Backfilled investments.investor_id from user_id')
      }
      await conn.execute(`CREATE INDEX idx_investments_investor_id ON investments(investor_id)`)
      console.log('✅ Added index investments(investor_id)')
    } else {
      console.log('ℹ️ investments.investor_id already exists')
    }
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error('❌ fix-investments-wallet-schema failed:', e)
  process.exitCode = 1
})

