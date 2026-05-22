#!/usr/bin/env node
/**
 * List nav hrefs from lib/platform/modules.ts vs app/dashboard page routes
 * Usage: node scripts/audit-dashboard-nav.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const modulesTs = fs.readFileSync(path.join(root, 'lib/platform/modules.ts'), 'utf8')

const navHrefs = new Set()
for (const m of modulesTs.matchAll(/href:\s*'(\/dashboard[^'?#]*)/g)) {
  navHrefs.add(m[1])
}
for (const m of modulesTs.matchAll(/href:\s*`(\/dashboard\/modules\/[^`]+)`/g)) {
  navHrefs.add(m[1].replace('${mod.id}', '*'))
}

function walk(dir, base = '') {
  const pages = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, ent.name)
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) pages.push(...walk(full, rel))
    else if (ent.name === 'page.tsx') pages.push('/dashboard/' + rel.replace(/\\/g, '/').replace(/\/page\.tsx$/, ''))
  }
  return pages
}

const dashDir = path.join(root, 'app/dashboard')
const pagePaths = new Set(walk(dashDir).map((p) => p.replace(/\/page$/, '') || p))

const missingPages = [...navHrefs].filter((h) => !h.includes('*') && !pagePaths.has(h))
const orphanPages = [...pagePaths].filter((p) => {
  if (p.includes('[')) return false
  if (p === '/dashboard/onboarding') return false
  for (const h of navHrefs) {
    if (h.includes('*')) continue
    if (p === h || p.startsWith(h + '/')) return false
  }
  return true
})

console.log('Nav routes:', navHrefs.size)
console.log('Dashboard pages:', pagePaths.size)
if (missingPages.length) {
  console.log('\nNav links WITHOUT a page:')
  missingPages.forEach((p) => console.log('  -', p))
}
if (orphanPages.length) {
  console.log('\nPages NOT in sidebar nav (may be deep links / legacy):')
  orphanPages.sort().forEach((p) => console.log('  -', p))
}
if (!missingPages.length) console.log('\nAll nav hrefs have matching pages.')
