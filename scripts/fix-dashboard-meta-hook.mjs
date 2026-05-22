#!/usr/bin/env node
/**
 * Add missing `const meta = useDashboardPageMeta()` to migrated dashboard pages.
 */
import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'app', 'dashboard')

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(rel, acc)
    else if (ent.name === 'page.tsx') acc.push(rel)
  }
  return acc
}

const fixed = []

for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8')
  if (!content.includes('meta.title') && !content.includes('meta.description')) continue
  if (content.includes('const meta = useDashboardPageMeta')) continue
  if (!content.includes('useDashboardPageMeta')) continue

  const idx = content.indexOf('title={meta.title}')
  if (idx < 0) continue

  const before = content.slice(0, idx)
  const fnStart = before.lastIndexOf('function ')
  if (fnStart < 0) continue
  const braceStart = content.indexOf('{', fnStart)
  if (braceStart < 0) continue

  content =
    content.slice(0, braceStart + 1) +
    '\n  const meta = useDashboardPageMeta()\n' +
    content.slice(braceStart + 1)

  fs.writeFileSync(file, content)
  fixed.push(path.relative(process.cwd(), file).replace(/\\/g, '/'))
}

console.log(`Added meta hook to ${fixed.length} files:\n${fixed.join('\n')}`)
