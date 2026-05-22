/**
 * Full super-admin demo: super admin user + 20 demo tenants + platform admin data.
 *
 *   npm run db:seed:super-admin
 *   npm run db:seed:super-admin:fresh
 */

import { execSync } from 'child_process'
import path from 'path'

const root = path.resolve(__dirname, '..')
const fresh = process.argv.includes('--fresh')

function run(script: string, extraArgs: string[] = []): void {
  const args = [script, ...extraArgs].filter(Boolean).join(' ')
  console.log(`\n▶ npx tsx ${args}\n`)
  execSync(`npx tsx ${args}`, { cwd: root, stdio: 'inherit', env: process.env })
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════')
  console.log('  AquaERP — full super-admin database seed')
  console.log(`  Mode: ${fresh ? 'FRESH (wipe demo + re-platform)' : 'incremental'}`)
  console.log('═══════════════════════════════════════════')

  run('database/seed-admin.ts')

  if (fresh) {
    run('database/seed-demo-tenants.ts', ['--fresh'])
  } else {
    run('database/seed-demo-tenants.ts')
  }

  run('database/seed-super-admin-platform.ts', fresh ? ['--fresh'] : [])

  console.log('\n═══════════════════════════════════════════')
  console.log('  All seeds finished')
  console.log('═══════════════════════════════════════════\n')
}

main().catch((err) => {
  console.error('❌ Full super-admin seed failed:', err)
  process.exit(1)
})
