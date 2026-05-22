import fs from 'fs'
import path from 'path'

/**
 * Load .env then .env.local (local overrides), matching Next.js precedence.
 */
export function loadEnv(rootDir) {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(rootDir, file)
    if (!fs.existsSync(p)) continue
    const content = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (!m) continue
      let value = m[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[m[1]] = value
    }
  }
}
