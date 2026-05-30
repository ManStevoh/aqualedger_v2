/**
 * AquaLedger V2 - Database Seeder
 * 
 * Run with: npx ts-node database/seed.ts
 * Or add to package.json: "db:seed": "ts-node database/seed.ts"
 */

import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aqualedger32',
}

async function seed() {
  const connection = await mysql.createConnection(config)
  
  console.log('🌱 Starting database seed...')
  
  try {
    // Create test users (Sanitized to comply with the clean 5-user configuration)
    const users = [
      { email: 'owner-coastfish@demo.aquaerp.local', firstName: 'Demo', lastName: 'Owner', role: 'user' },
      { email: 'buyer@demo.aquaerp.local', firstName: 'Jane', lastName: 'Buyer', role: 'user' },
    ]
    
    const passwordHash = await bcrypt.hash('Test@123', 12)
    const adminPasswordHash = await bcrypt.hash('Admin@123', 12)
    
    console.log('Creating test users...')
    for (const user of users) {
      const userId = randomUUID()
      await connection.execute(
        `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
         VALUES (?, ?, ?, ?, ?, ?, 'active', TRUE)`,
        [userId, user.email, passwordHash, user.firstName, user.lastName, user.role]
      )
      
      // Create wallet
      await connection.execute(
        `INSERT IGNORE INTO wallets (id, user_id, balance, currency, status)
         VALUES (?, ?, ?, 'KES', 'active')`,
        [randomUUID(), userId, Math.floor(Math.random() * 100000)]
      )
      
      // Create credit score
      await connection.execute(
        `INSERT IGNORE INTO credit_scores (id, user_id, score, grade)
         VALUES (?, ?, ?, ?)`,
        [randomUUID(), userId, 400 + Math.floor(Math.random() * 300), ['C', 'B', 'A'][Math.floor(Math.random() * 3)]]
      )
    }

    // Create super admin (platform operator)
    console.log('Creating super admin...')
    const adminId = randomUUID()
    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, status, kyc_verified)
       VALUES (?, ?, ?, ?, ?, 'super_admin', 'active', TRUE)`,
      [adminId, 'admin@aqualedger.co.ke', adminPasswordHash, 'Platform', 'Admin']
    )
    await connection.execute(
      `INSERT IGNORE INTO wallets (id, user_id, balance, currency, status)
       VALUES (?, ?, 0, 'KES', 'active')`,
      [randomUUID(), adminId]
    )
    await connection.execute(
      `INSERT IGNORE INTO credit_scores (id, user_id, score, grade)
       VALUES (?, ?, 700, 'A')`,
      [randomUUID(), adminId]
    )
    
    // Get boat owner ID
    const [[boatOwner]] = await connection.execute(
      `SELECT id FROM users WHERE email = 'owner-coastfish@demo.aquaerp.local'`
    ) as [{ id: string }[], unknown]
    
    const [[fisherman]] = await connection.execute(
      `SELECT id FROM users WHERE email = 'owner-coastfish@demo.aquaerp.local'`
    ) as [{ id: string }[], unknown]
    
    // Create landing sites
    console.log('Creating landing sites...')
    const landingSites = [
      { name: 'Shimoni Beach', code: 'SHM', county: 'Kwale', lat: -4.6500, lng: 39.3833 },
      { name: 'Kizingitini Landing', code: 'KZG', county: 'Lamu', lat: -2.0667, lng: 41.0167 },
      { name: 'Malindi Fish Market', code: 'MLN', county: 'Kilifi', lat: -3.2167, lng: 40.1167 },
      { name: 'Kisumu Beach', code: 'KSM', county: 'Kisumu', lat: -0.1000, lng: 34.7500 },
    ]
    
    const landingSiteIds: string[] = []
    for (const site of landingSites) {
      const siteId = randomUUID()
      landingSiteIds.push(siteId)
      await connection.execute(
        `INSERT IGNORE INTO landing_sites (id, name, code, county, latitude, longitude, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [siteId, site.name, site.code, site.county, site.lat, site.lng]
      )
    }
    
    // Create boats
    console.log('Creating boats...')
    const boats = [
      { name: 'Ocean Voyager', regNum: 'KEN-2024-001', type: 'fiber', capacity: 500 },
      { name: 'Sea Hunter', regNum: 'KEN-2024-002', type: 'wooden', capacity: 300 },
      { name: 'Blue Marlin', regNum: 'KEN-2024-003', type: 'steel', capacity: 800 },
    ]
    
    const boatIds: string[] = []
    for (const boat of boats) {
      const boatId = randomUUID()
      boatIds.push(boatId)
      await connection.execute(
        `INSERT IGNORE INTO boats (id, tenant_id, owner_id, registration_number, name, type, capacity_kg, status, gps_enabled)
         VALUES (?, 'tenant-default-0001', ?, ?, ?, ?, ?, 'active', TRUE)`,
        [boatId, boatOwner.id, boat.regNum, boat.name, boat.type, boat.capacity]
      )
    }
    
    // Create fishing trips
    console.log('Creating fishing trips...')
    const [[tilapia]] = await connection.execute(
      `SELECT id FROM fish_species WHERE name = 'Tilapia' LIMIT 1`
    ) as [{ id: string }[], unknown]
    
    const [[nilePurch]] = await connection.execute(
      `SELECT id FROM fish_species WHERE name = 'Nile Perch' LIMIT 1`
    ) as [{ id: string }[], unknown]
    
    for (let i = 0; i < 10; i++) {
      const tripId = randomUUID()
      const boatId = boatIds[Math.floor(Math.random() * boatIds.length)]
      const siteId = landingSiteIds[Math.floor(Math.random() * landingSiteIds.length)]
      const daysAgo = Math.floor(Math.random() * 30)
      const departureTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const returnTime = new Date(departureTime.getTime() + 8 * 60 * 60 * 1000)
      
      await connection.execute(
        `INSERT INTO fishing_trips (id, boat_id, captain_id, landing_site_id, departure_time, return_time, status, fishing_zone, weather_conditions, sea_state, fuel_used_liters, fuel_cost)
         VALUES (?, ?, ?, ?, ?, ?, 'completed', 'Zone A', 'Clear skies', 'calm', ?, ?)`,
        [tripId, boatId, fisherman.id, siteId, departureTime, returnTime, 50 + Math.random() * 100, 5000 + Math.random() * 10000]
      )
      
      // Add catches
      const catchQty = 50 + Math.random() * 200
      const unitPrice = 300 + Math.random() * 200
      await connection.execute(
        `INSERT INTO catches (id, trip_id, species_id, quantity_kg, grade, unit_price, total_value, storage_method, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'iced', ?)`,
        [randomUUID(), tripId, tilapia?.id || nilePurch?.id, catchQty, ['A', 'B', 'C'][Math.floor(Math.random() * 3)], unitPrice, catchQty * unitPrice, fisherman.id]
      )
      
      // Update trip totals
      await connection.execute(
        `UPDATE fishing_trips SET
          total_catch_kg = (SELECT COALESCE(SUM(quantity_kg), 0) FROM catches WHERE trip_id = ?),
          total_revenue = (SELECT COALESCE(SUM(total_value), 0) FROM catches WHERE trip_id = ?)
        WHERE id = ?`,
        [tripId, tripId, tripId]
      )
    }
    
    // Create marketplace listings
    console.log('Creating marketplace listings...')
    const speciesIds = [tilapia?.id, nilePurch?.id].filter(Boolean)
    
    for (let i = 0; i < 15; i++) {
      const listingId = randomUUID()
      const speciesId = speciesIds[Math.floor(Math.random() * speciesIds.length)]
      const qty = 20 + Math.random() * 100
      const price = 300 + Math.random() * 500
      const siteId = landingSiteIds[Math.floor(Math.random() * landingSiteIds.length)]
      
      await connection.execute(
        `INSERT INTO fish_listings (id, seller_id, species_id, fish_type, quantity_kg, available_quantity_kg, grade, price_per_kg, landing_site_id, storage_method, status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'iced', 'available', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [listingId, boatOwner.id, speciesId, i % 2 === 0 ? 'Tilapia' : 'Nile Perch', qty, qty, ['A', 'B'][Math.floor(Math.random() * 2)], price, siteId]
      )
    }
    
    // Create BMUs
    console.log('Creating BMUs...')
    const [[bmuUser]] = await connection.execute(
      `SELECT id FROM users WHERE email = 'owner-coastfish@demo.aquaerp.local'`
    ) as [{ id: string }[], unknown]
    
    const bmus = [
      { name: 'Shimoni BMU', code: 'SHM-BMU', county: 'Kwale' },
      { name: 'Lamu Central BMU', code: 'LMU-BMU', county: 'Lamu' },
      { name: 'Kilifi BMU', code: 'KLF-BMU', county: 'Kilifi' },
    ]
    
    for (const bmu of bmus) {
      await connection.execute(
        `INSERT IGNORE INTO bmu (id, name, code, county, chairman_id, status, total_members, total_boats)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
        [randomUUID(), bmu.name, bmu.code, bmu.county, bmuUser.id, 50 + Math.floor(Math.random() * 100), 10 + Math.floor(Math.random() * 30)]
      )
    }
    
    // Investment packages (once)
    const [[pkgCount]] = (await connection.execute(`SELECT COUNT(*) as c FROM investment_packages`)) as [
      { c: number }[],
      unknown,
    ]
    if (!pkgCount?.c) {
      console.log('Creating investment packages...')
      const packages = [
        {
          name: 'Deep Sea Operations Fund',
          description: 'Finance fuel, ice, and crew for licensed deep-sea vessels.',
          min: 5000,
          rate: 18,
          months: 12,
          risk: 'high',
        },
        {
          name: 'Lake Victoria Tilapia Pool',
          description: 'Seasonal lake fishing and landing-site logistics.',
          min: 3000,
          rate: 14,
          months: 9,
          risk: 'medium',
        },
        {
          name: 'Coastal Cold Chain',
          description: 'Cold storage and transport for high-grade catch.',
          min: 10000,
          rate: 12,
          months: 18,
          risk: 'low',
        },
      ]
      for (const p of packages) {
        await connection.execute(
          `INSERT INTO investment_packages (id, name, description, min_investment, expected_return_rate, duration_months, risk_level, status, total_pool)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 8000000)`,
          [randomUUID(), p.name, p.description, p.min, p.rate, p.months, p.risk]
        )
      }
    }

    // Create climate alerts
    console.log('Creating climate alerts...')
    const alerts = [
      { type: 'advisory', severity: 'moderate', title: 'High Winds Expected', description: 'Wind speeds of 25-35 knots expected along the coast' },
      { type: 'warning', severity: 'high', title: 'Storm Warning', description: 'Tropical storm approaching coastal areas' },
      { type: 'weather', severity: 'low', title: 'Favorable Conditions', description: 'Good fishing conditions expected for the next 3 days' },
    ]
    
    for (const alert of alerts) {
      await connection.execute(
        `INSERT INTO climate_alerts (id, type, severity, title, description, affected_counties, start_time, end_time, status)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 48 HOUR), 'active')`,
        [randomUUID(), alert.type, alert.severity, alert.title, alert.description, JSON.stringify(['Mombasa', 'Kilifi', 'Kwale'])]
      )
    }
    
    // Create storage facilities
    console.log('Creating storage facilities...')
    const facilities = [
      { name: 'Mombasa Cold Storage', code: 'MCS-001', type: 'cold_room', capacity: 10000, county: 'Mombasa' },
      { name: 'Kilifi Ice Plant', code: 'KIP-001', type: 'ice_plant', capacity: 5000, county: 'Kilifi' },
      { name: 'Kisumu Freezer', code: 'KSF-001', type: 'freezer', capacity: 8000, county: 'Kisumu' },
    ]
    
    for (const facility of facilities) {
      await connection.execute(
        `INSERT IGNORE INTO storage_facilities (id, name, code, type, capacity_kg, current_stock_kg, county, status, temperature_min, temperature_max, current_temperature, daily_rate_per_kg)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'operational', -25, -18, -20, 5)`,
        [randomUUID(), facility.name, facility.code, facility.type, facility.capacity, Math.floor(facility.capacity * 0.6), facility.county]
      )
    }
    
    // Create notifications
    console.log('Creating notifications...')
    const notifications = [
      { type: 'success', title: 'Trip Completed', message: 'Your fishing trip has been recorded successfully' },
      { type: 'info', title: 'New Marketplace Listing', message: 'Fresh Tilapia now available at Shimoni Beach' },
      { type: 'warning', title: 'License Expiring', message: 'Your fishing license expires in 30 days' },
    ]
    
    for (const notification of notifications) {
      await connection.execute(
        `INSERT INTO notifications (id, user_id, type, title, message, is_read)
         VALUES (?, ?, ?, ?, ?, FALSE)`,
        [randomUUID(), boatOwner.id, notification.type, notification.title, notification.message]
      )
    }
    
    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('Test accounts (password: Test@123):')
    console.log('  - owner-coastfish@demo.aquaerp.local (Tenant Owner)')
    console.log('  - buyer@demo.aquaerp.local (Fish Buyer)')
    console.log('')
    console.log('Admin account (password: Admin@123):')
    console.log('  - admin@aqualedger.co.ke (Super Admin)')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await connection.end()
  }
}

seed().catch(console.error)
