/**
 * Load schema into database
 */
import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aqualedger32',
  multipleStatements: true,
}

async function loadSchema() {
  const connection = await mysql.createConnection(config)
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSQL = await fs.readFile(schemaPath, 'utf-8')
    
    console.log('📋 Loading schema...')
    await connection.query(schemaSQL)
    console.log('✅ Schema loaded successfully!')
  } catch (error) {
    console.error('❌ Failed to load schema:', error)
    throw error
  } finally {
    await connection.end()
  }
}

loadSchema().catch(console.error)
