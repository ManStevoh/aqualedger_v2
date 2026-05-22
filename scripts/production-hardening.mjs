#!/usr/bin/env node
/**
 * Production readiness gate: env, DB schema, typecheck, tests, build, smoke, M-Pesa probe.
 * Usage: node scripts/production-hardening.mjs [--skip-build] [--base=http://localhost:3000]
 */
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const skipBuild = process.argv.includes('--skip-build')

function run(cmd, args, opts = {}) {
  const { optional = false } = opts
  console.log(`\n> ${cmd} ${args.join(' ')}\n`)
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true })
  if (r.status !== 0) {
    if (optional) {
      console.warn(`\nOptional step failed (continuing): ${cmd} ${args.join(' ')}\n`)
      return
    }
    process.exit(r.status ?? 1)
  }
}

console.log('AquaERP production hardening\n')

run('node', ['scripts/preflight-env.mjs'])
run('node', ['scripts/env-check.mjs'])
run('npm', ['run', 'db:verify'], { optional: true })

run('npm', ['run', 'typecheck'])
run('npm', ['test'])

if (!skipBuild) {
  run('npm', ['run', 'build'])
}

const baseArg = process.argv.find((a) => a.startsWith('--base='))
const smokeArgs = ['scripts/smoke-platform.mjs']
if (baseArg) smokeArgs.push(baseArg)
run('node', smokeArgs)

run('node', ['scripts/mpesa-sandbox-check.mjs'], { optional: true })

console.log('\nProduction hardening passed.')
