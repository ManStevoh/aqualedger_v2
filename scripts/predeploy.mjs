#!/usr/bin/env node
/**
 * Pre-production gate: typecheck, tests, DB verify, production build.
 * Usage: node scripts/predeploy.mjs
 */
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(' ')}\n`)
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('npm', ['run', 'typecheck'])
run('npm', ['test'])
run('npm', ['run', 'db:verify'])
run('npm', ['run', 'env:check'])
run('npm', ['run', 'build'])
console.log('\nPredeploy checks passed.')
