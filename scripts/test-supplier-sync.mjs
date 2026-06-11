#!/usr/bin/env node
/**
 * Smoke test for procurement suppliers and marketplace vendors sync.
 * Usage: node scripts/test-supplier-sync.mjs
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const base = (
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

function parseCookies(setCookie) {
  if (!setCookie) return ''
  const list = Array.isArray(setCookie) ? setCookie : [setCookie]
  return list.map((c) => c.split(';')[0]).join('; ')
}

async function runTest() {
  console.log(`Supplier-Vendor Sync Test: running against ${base}\n`)

  // 1. Login as owner of coastfish (which is a seeded tenant with both vendors and standard suppliers)
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner-coastfish@demo.aquaerp.local',
      password: 'Demo@123',
    }),
  })
  
  const loginJson = await loginRes.json()
  if (!loginRes.ok || !loginJson.success) {
    console.error('FAIL: Login failed', loginJson)
    process.exit(1)
  }
  
  const cookie = parseCookies(loginRes.headers.getSetCookie?.() ?? loginRes.headers.get('set-cookie'))
  console.log('OK: Logged in successfully.')

  // 2. Fetch suppliers (GET /api/v2/procurement/suppliers)
  const getSuppliers = async (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${base}/api/v2/procurement/suppliers?${qs}`, {
      headers: { Cookie: cookie },
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(`Failed to list suppliers: ${JSON.stringify(json)}`)
    }
    return json.data.suppliers
  }

  // 3. Test filtering by type and verify is_vendor field
  const allSuppliers = await getSuppliers()
  console.log(`OK: Fetched all suppliers (total ${allSuppliers.length}).`)

  const vendorsOnly = await getSuppliers({ type: 'vendor' })
  console.log(`OK: Fetched vendors only (total ${vendorsOnly.length}).`)
  for (const s of vendorsOnly) {
    if (!s.is_vendor) {
      console.error(`FAIL: Supplier ${s.name} is in vendor list but has is_vendor=false.`)
      process.exit(1)
    }
  }

  const standardOnly = await getSuppliers({ type: 'standard' })
  console.log(`OK: Fetched standard suppliers only (total ${standardOnly.length}).`)
  for (const s of standardOnly) {
    if (s.is_vendor) {
      console.error(`FAIL: Supplier ${s.name} is in standard list but has is_vendor=true.`)
      process.exit(1)
    }
  }

  if (vendorsOnly.length + standardOnly.length !== allSuppliers.length) {
    console.error(`FAIL: Sum of vendors (${vendorsOnly.length}) and standard (${standardOnly.length}) does not match total (${allSuppliers.length}).`)
    process.exit(1)
  }
  console.log('OK: Type filtering and classification tests passed.')

  // 4. Update a standard supplier and verify
  const standardSupplier = standardOnly[0]
  if (!standardSupplier) {
    console.error('FAIL: No standard supplier found to test updates.')
    process.exit(1)
  }

  console.log(`Testing edit on Standard Supplier: ${standardSupplier.name} (${standardSupplier.code})`)
  const updatedStandardName = `SyncTest Standard ${Date.now()}`
  const updateStandardRes = await fetch(`${base}/api/v2/procurement/suppliers`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      supplierId: standardSupplier.id,
      name: updatedStandardName,
      contactName: 'SyncTest Contact',
      email: 'synctest-standard@test.com',
      phone: '+254700000001',
      status: 'inactive',
    }),
  })
  
  const updateStandardJson = await updateStandardRes.json()
  if (!updateStandardRes.ok || !updateStandardJson.success) {
    console.error('FAIL: Update standard supplier request failed', updateStandardJson)
    process.exit(1)
  }
  console.log('OK: Standard supplier PATCH request succeeded.')

  // Verify list reflects standard supplier update
  const refetchedSuppliers = await getSuppliers()
  const matchingStandard = refetchedSuppliers.find(s => s.id === standardSupplier.id)
  if (
    !matchingStandard ||
    matchingStandard.name !== updatedStandardName ||
    matchingStandard.status !== 'inactive' ||
    matchingStandard.contact_name !== 'SyncTest Contact'
  ) {
    console.error('FAIL: Standard supplier changes did not persist in listing', matchingStandard)
    process.exit(1)
  }
  console.log('OK: Standard supplier updates verified in list.')

  // 5. Update a fish vendor supplier and verify bidirectional sync
  const vendorSupplier = vendorsOnly[0]
  if (!vendorSupplier) {
    console.error('FAIL: No vendor supplier found to test sync.')
    process.exit(1)
  }

  console.log(`Testing edit on Fish Vendor Supplier: ${vendorSupplier.name} (${vendorSupplier.code})`)
  const updatedVendorShopName = `SyncTest Vendor ${Date.now()}`
  const updateVendorRes = await fetch(`${base}/api/v2/procurement/suppliers`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      supplierId: vendorSupplier.id,
      name: updatedVendorShopName,
      contactName: 'SyncTest VendorContact',
      email: 'synctest-vendor@test.com',
      phone: '+254700000002',
      status: 'blocked',
    }),
  })

  const updateVendorJson = await updateVendorRes.json()
  if (!updateVendorRes.ok || !updateVendorJson.success) {
    console.error('FAIL: Update vendor supplier request failed', updateVendorJson)
    process.exit(1)
  }
  console.log('OK: Fish vendor supplier PATCH request succeeded.')

  // Verify list reflects vendor supplier update
  const refetchedSuppliers2 = await getSuppliers()
  const matchingVendor = refetchedSuppliers2.find(s => s.id === vendorSupplier.id)
  if (
    !matchingVendor ||
    matchingVendor.name !== updatedVendorShopName ||
    matchingVendor.status !== 'blocked' ||
    matchingVendor.contact_name !== 'SyncTest VendorContact'
  ) {
    console.error('FAIL: Vendor supplier changes did not persist in listing', matchingVendor)
    process.exit(1)
  }
  console.log('OK: Vendor supplier updates verified in list.')

  // 6. Verify sync to marketplace_vendors (via /api/v2/commerce/vendors)
  const vendorsListRes = await fetch(`${base}/api/v2/commerce/vendors`, {
    headers: { Cookie: cookie },
  })
  const vendorsListJson = await vendorsListRes.json()
  if (!vendorsListRes.ok || !vendorsListJson.success) {
    console.error('FAIL: Failed to fetch marketplace vendors list', vendorsListJson)
    process.exit(1)
  }

  const matchingMarketplaceVendor = vendorsListJson.data.vendors.find(v => v.id === vendorSupplier.id)
  if (!matchingMarketplaceVendor) {
    console.error(`FAIL: Marketplace vendor matching id ${vendorSupplier.id} not found in vendors list.`)
    process.exit(1)
  }

  // Check shop name, status (blocked -> suspended), contact details (associated user email, first name, last name)
  if (
    matchingMarketplaceVendor.shop_name !== updatedVendorShopName ||
    matchingMarketplaceVendor.status !== 'suspended' ||
    matchingMarketplaceVendor.user_email !== 'synctest-vendor@test.com' ||
    matchingMarketplaceVendor.first_name !== 'SyncTest' ||
    matchingMarketplaceVendor.last_name !== 'VendorContact'
  ) {
    console.error('FAIL: Sync from suppliers to marketplace_vendors or users failed:', matchingMarketplaceVendor)
    process.exit(1)
  }
  
  console.log('OK: Sync from suppliers to marketplace_vendors and users verified successfully.')
  console.log('\nALL INTEGRATION AND SYNC TESTS PASSED SUCCESSFULLY!')
}

runTest().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
