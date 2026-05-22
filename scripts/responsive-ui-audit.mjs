#!/usr/bin/env node
/**
 * Static responsive / mobile-first audit for dashboard UI.
 * Run: npm run ui:audit:responsive
 *
 * Checks (heuristic, not a substitute for manual device testing):
 * - viewport meta export
 * - shell mobile patterns (sidebar default, dvh, safe-area)
 * - shared responsive components exist
 * - risky fixed-width filter patterns in dashboard pages
 */

import fs from 'fs'
import path from 'path'

const root = process.cwd()
const issues = []
const passes = []

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function walk(dir, acc = []) {
  if (!exists(dir)) return acc
  for (const ent of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(ent.name)) walk(rel, acc)
    } else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts')) {
      acc.push(rel)
    }
  }
  return acc
}

// --- Required infrastructure ---
const required = [
  ['app/layout.tsx', (c) => /export const viewport/.test(c), 'viewport export'],
  ['lib/store.ts', (c) => /sidebarOpen:\s*false/.test(c), 'sidebar closed by default'],
  ['components/dashboard/dashboard-chrome.tsx', (c) => /min-h-dvh|h-dvh/.test(c), 'dynamic viewport height'],
  ['components/dashboard/dashboard-chrome.tsx', (c) => /useResponsiveShell/.test(c), 'responsive shell hook'],
  ['components/dashboard/mobile-nav.tsx', (c) => /setSidebarOpen\(true\)/.test(c), 'menu opens sidebar'],
  ['components/dashboard/data-table-shell.tsx', () => true, 'DataTableShell component'],
  ['lib/hooks/use-responsive-shell.ts', () => true, 'useResponsiveShell hook'],
  ['app/globals.css', (c) => /\.touch-target/.test(c) && /\.safe-area-pt/.test(c), 'touch + safe-area utilities'],
]

for (const [file, test, label] of required) {
  if (!exists(file)) {
    issues.push({ severity: 'error', file, message: `Missing: ${label}` })
    continue
  }
  if (test(read(file))) passes.push(`✓ ${label}`)
  else issues.push({ severity: 'error', file, message: `Failed: ${label}` })
}

// --- Scan dashboard pages for fixed filter widths ---
const dashboardPages = walk('app/dashboard').filter((f) => f.endsWith('page.tsx'))
/** Table cell truncation — allowed per RESPONSIVE_UI_STANDARDS.md */
const TABLE_CELL_WIDTH_EXCEPTIONS = new Set(['w-[200px]', 'max-w-[200px]'])

const fixedWidthRe = /\b(?:w|min-w|max-w)-\[(1[4-9]|[2-9]\d)\d*px\]/g
let fixedWidthHits = 0
for (const file of dashboardPages) {
  const content = read(file)
  const matches = content.match(fixedWidthRe)?.filter((m) => !TABLE_CELL_WIDTH_EXCEPTIONS.has(m))
  if (matches?.length) {
    fixedWidthHits += matches.length
    issues.push({
      severity: 'warn',
      file,
      message: `${matches.length} fixed-width control(s) — prefer filter-control or w-full sm:w-auto`,
    })
  }
}

if (fixedWidthHits === 0) {
  passes.push('✓ No fixed pixel widths (w-[140px]+) in dashboard pages')
} else {
  passes.push(`⚠ ${fixedWidthHits} fixed-width control(s) across dashboard (migrate gradually)`)
}

// --- DashboardPageLayout adoption ---
const layoutPages = dashboardPages.filter((f) => read(f).includes('DashboardPageLayout')).length
const adoptionPct = Math.round((layoutPages / Math.max(dashboardPages.length, 1)) * 100)
passes.push(`ℹ DashboardPageLayout on ${layoutPages}/${dashboardPages.length} pages (${adoptionPct}%)`)
if (adoptionPct < 50) {
  issues.push({
    severity: 'warn',
    file: 'app/dashboard',
    message: `Only ${adoptionPct}% pages use DashboardPageLayout — run layout migration for consistency`,
  })
}

// --- Standards checklist (documentation) ---
const standardsDoc = 'docs/RESPONSIVE_UI_STANDARDS.md'
if (exists(standardsDoc)) passes.push('✓ RESPONSIVE_UI_STANDARDS.md present')
else issues.push({ severity: 'warn', file: standardsDoc, message: 'Missing responsive standards doc' })

console.log('\n📱 Responsive UI audit\n')
console.log('Passes:')
for (const p of passes) console.log(`  ${p}`)

const errors = issues.filter((i) => i.severity === 'error')
const warns = issues.filter((i) => i.severity === 'warn')

if (warns.length) {
  console.log('\nWarnings:')
  for (const w of warns.slice(0, 15)) {
    console.log(`  [${w.file}] ${w.message}`)
  }
  if (warns.length > 15) console.log(`  … and ${warns.length - 15} more`)
}

if (errors.length) {
  console.log('\nErrors:')
  for (const e of errors) console.log(`  [${e.file}] ${e.message}`)
  process.exit(1)
}

console.log('\n✅ Core responsive infrastructure passes.')
console.log('Manual checks still required: 320px / 375px / 768px viewports, keyboard nav, screen reader.\n')
process.exit(0)
