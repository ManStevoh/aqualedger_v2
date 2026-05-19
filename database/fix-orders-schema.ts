/**
 * One-off DB fix: align orders table with API expectations.
 *
 * Run with: npx ts-node database/fix-orders-schema.ts
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

async function columnExists(conn: mysql.Connection, table: string, column: string): Promise<boolean> {
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

async function main() {
  const conn = await mysql.createConnection(config)
  try {
    // seller_id
    if (!(await columnExists(conn, 'orders', 'seller_id'))) {
      await conn.execute(`ALTER TABLE orders ADD COLUMN seller_id VARCHAR(36) NULL AFTER buyer_id`)
      console.log('✅ Added orders.seller_id')
    } else {
      console.log('ℹ️ orders.seller_id already exists')
    }

    // totals
    for (const [col, ddl] of [
      ['subtotal', `ALTER TABLE orders ADD COLUMN subtotal DECIMAL(15,2) NOT NULL DEFAULT 0`],
      ['delivery_fee', `ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(15,2) NOT NULL DEFAULT 0`],
      ['tax', `ALTER TABLE orders ADD COLUMN tax DECIMAL(15,2) NOT NULL DEFAULT 0`],
      ['total', `ALTER TABLE orders ADD COLUMN total DECIMAL(15,2) NOT NULL DEFAULT 0`],
    ] as const) {
      if (!(await columnExists(conn, 'orders', col))) {
        await conn.execute(ddl)
        console.log(`✅ Added orders.${col}`)
      } else {
        console.log(`ℹ️ orders.${col} already exists`)
      }
    }

    // Best-effort backfill for legacy schema (total_amount -> total)
    const hasTotalAmount = await columnExists(conn, 'orders', 'total_amount')
    if (hasTotalAmount) {
      await conn.execute(`UPDATE orders SET total = total_amount WHERE (total IS NULL OR total = 0)`)
      console.log('✅ Backfilled orders.total from orders.total_amount')
    }

    // Try to backfill seller_id from order_items -> fish_listings.seller_id if possible
    const hasOrderItems = (await conn.execute(
      `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'order_items' LIMIT 1`,
      [config.database],
    )) as unknown
    void hasOrderItems

    const hasListingId = await columnExists(conn, 'order_items', 'listing_id')
    const hasFishListings = (await conn.execute(
      `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'fish_listings' LIMIT 1`,
      [config.database],
    )) as unknown
    void hasFishListings

    if (hasListingId && (await columnExists(conn, 'fish_listings', 'seller_id'))) {
      await conn.execute(`
        UPDATE orders o
        JOIN (
          SELECT oi.order_id, MAX(fl.seller_id) AS seller_id
          FROM order_items oi
          JOIN fish_listings fl ON fl.id = oi.listing_id
          GROUP BY oi.order_id
        ) s ON s.order_id = o.id
        SET o.seller_id = COALESCE(o.seller_id, s.seller_id)
      `)
      console.log('✅ Backfilled orders.seller_id from order_items/listings where possible')
    } else {
      console.log('ℹ️ Skipped seller_id backfill (missing order_items.listing_id or fish_listings.seller_id)')
    }
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error('❌ fix-orders-schema failed:', e)
  process.exitCode = 1
})

