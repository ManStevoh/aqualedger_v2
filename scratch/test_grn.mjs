import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from '../scripts/lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

// Hardcode DB settings to ensure connection succeeds
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '3306'
process.env.DB_USER = 'root'
process.env.DB_PASSWORD = 'root'
process.env.DB_NAME = 'aquaerp_operating'

import { queryOne, execute, generateId } from '../lib/db'
import { createGoodsReceipt } from '../lib/modules/procurement/service'

async function runTest() {
  console.log('Testing createGoodsReceipt programmatically...\n')
  
  // 1. Get coastfish tenant ID
  const tenant = await queryOne('SELECT id FROM tenants WHERE slug = "coastfish"')
  if (!tenant) {
    console.error('FAIL: coastfish tenant not found in DB')
    process.exit(1)
  }
  const tenantId = tenant.id
  console.log(`Tenant: ${tenantId}`)

  // 2. Get owner user ID
  const owner = await queryOne('SELECT id FROM users WHERE email = "owner-coastfish@demo.aquaerp.local"')
  if (!owner) {
    console.error('FAIL: owner user not found in DB')
    process.exit(1)
  }
  const ownerId = owner.id
  console.log(`Owner: ${ownerId}`)

  // 3. Get an active purchase order
  const po = await queryOne('SELECT id, po_number, status FROM purchase_orders WHERE tenant_id = ? LIMIT 1', [tenantId])
  if (!po) {
    console.error('FAIL: No purchase order found for tenant')
    process.exit(1)
  }
  console.log(`Purchase Order: ${po.po_number} (${po.id}) - Status: ${po.status}`)

  // 4. Try posting a GRN against this PO
  try {
    const input = {
      purchaseOrderId: po.id,
      receivedDate: new Date().toISOString().split('T')[0],
      status: 'posted',
      notes: 'Test programmatic GRN',
    }
    const receipt = await createGoodsReceipt(tenantId, input, ownerId)
    console.log('SUCCESS: Goods receipt created successfully!', receipt)
  } catch (err) {
    console.error('FAIL: Error during createGoodsReceipt:', err)
  }
  
  process.exit(0)
}

runTest().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
