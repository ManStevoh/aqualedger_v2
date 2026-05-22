#!/usr/bin/env node
/**
 * Verify branding infrastructure is wired.
 * Run: npm run ui:audit:branding
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const passes = []
const issues = []

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

const checks = [
  ['app/dashboard/layout.tsx', (c) => c.includes('TenantBrandProvider'), 'TenantBrandProvider in dashboard layout'],
  ['app/login/layout.tsx', (c) => c.includes('PlatformBrandProvider'), 'PlatformBrandProvider on login'],
  ['components/dashboard/sidebar.tsx', (c) => c.includes('BrandMark'), 'BrandMark in sidebar'],
  ['lib/branding/theme-vars.ts', () => true, 'theme-vars helper'],
  ['docs/BRANDING.md', () => true, 'BRANDING.md documentation'],
  ['database/migrations/20260613_platform_branding.sql', () => true, 'platform branding migration'],
]

for (const [file, test, label] of checks) {
  if (!fs.existsSync(path.join(root, file))) {
    issues.push(`Missing file: ${file} (${label})`)
    continue
  }
  if (test(read(file))) passes.push(`✓ ${label}`)
  else issues.push(`Failed: ${label} (${file})`)
}

const platformSettings = read('lib/platform/platform-settings.ts')
if (platformSettings.includes('branding') && platformSettings.includes('brandingLogoUrl')) {
  passes.push('✓ Platform settings branding fields')
} else {
  issues.push('Platform settings missing branding fields')
}

console.log('\n🎨 Branding audit\n')
for (const p of passes) console.log(`  ${p}`)
if (issues.length) {
  console.log('\nIssues:')
  for (const i of issues) console.log(`  ✗ ${i}`)
  process.exit(1)
}
console.log('\n✅ Branding infrastructure OK.\n')
