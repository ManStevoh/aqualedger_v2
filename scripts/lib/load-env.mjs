import fs from 'fs'
import path from 'path'

/**
 * Load .env.local then .env into process.env (later files do not override earlier keys).
 * @param {string} root - Project root directory
 */
export function loadEnv(root) {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(root, file)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const m = trimmed.match(/^([^#=]+)=(.*)$/)
      if (!m) continue
      const key = m[1].trim()
      if (process.env[key] !== undefined) continue
      process.env[key] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
}
