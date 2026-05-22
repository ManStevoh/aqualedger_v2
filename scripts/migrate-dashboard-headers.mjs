#!/usr/bin/env node
/**
 * Migrates dashboard pages from raw <h1> to DashboardPageLayout shell.
 * Run: node scripts/migrate-dashboard-headers.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dashboardDir = path.join(root, 'app', 'dashboard')

const SKIP = new Set([
  'page.tsx',
  'modules/[moduleId]/page.tsx',
  'onboarding/page.tsx',
])

const ALREADY = /DashboardPageLayout|ModulePageHeader/

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(rel, files)
    else if (ent.name === 'page.tsx') files.push(rel)
  }
  return files
}

function relPath(abs) {
  return path.relative(path.join(root, 'app', 'dashboard'), abs).replace(/\\/g, '/')
}

function extractTitle(content) {
  const m =
    content.match(/<h1[^>]*className="[^"]*text-(?:2xl|3xl)[^"]*"[^>]*>([^<]+)<\/h1>/) ||
    content.match(/<h1[^>]*>([^<]+)<\/h1>/)
  return m ? m[1].trim() : null
}

function extractDescription(content) {
  const m = content.match(
    /<p className="text-muted-foreground"[^>]*>([^<]+)<\/p>/,
  )
  return m ? m[1].trim() : undefined
}

function migrate(file) {
  const rel = relPath(file)
  if (SKIP.has(rel)) return { rel, status: 'skip-listed' }

  let content = fs.readFileSync(file, 'utf8')
  if (ALREADY.test(content)) return { rel, status: 'already' }
  if (!/text-(?:2xl|3xl) font-bold/.test(content) && !/<h1/.test(content)) {
    return { rel, status: 'no-h1' }
  }

  const title = extractTitle(content)
  if (!title) return { rel, status: 'no-title' }

  const description = extractDescription(content)

  const isClient = content.includes("'use client'") || content.includes('"use client"')
  if (!isClient) {
    content = `'use client'\n\n${content}`
  }

  if (!content.includes('DashboardPageLayout')) {
    const layoutImport =
      "import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'\n"
    if (content.includes("'use client'")) {
      content = content.replace(
        /('use client'[\s\S]*?\n\n)/,
        `$1${layoutImport}`,
      )
    } else {
      content = layoutImport + content
    }
  }

  const headerBlockRe =
    /<div className="(?:flex[^"]*|space-y-6)"[^>]*>\s*<div>\s*<h1[^>]*>[^<]+<\/h1>\s*<p className="text-muted-foreground"[^>]*>[^<]*<\/p>\s*<\/div>[\s\S]*?<\/div>\s*\n\s*(?=<div|<Card|<Tabs|{)/

  const simpleHeaderRe =
    /<div>\s*<h1 className="text-(?:2xl|3xl)[^"]*">[^<]+<\/h1>\s*<p className="text-muted-foreground"[^>]*>[^<]*<\/p>\s*<\/div>\s*\n/

  const layoutOpen = `<DashboardPageLayout
      title="${title.replace(/"/g, '\\"')}"${
        description
          ? `\n      description="${description.replace(/"/g, '\\"')}"`
          : ''
      }
    >`

  if (headerBlockRe.test(content)) {
    content = content.replace(headerBlockRe, layoutOpen + '\n      ')
  } else if (simpleHeaderRe.test(content)) {
    content = content.replace(simpleHeaderRe, layoutOpen + '\n      ')
  } else {
    content = content.replace(
      /<h1 className="text-(?:2xl|3xl)[^"]*">[^<]+<\/h1>\s*\n\s*<p className="text-muted-foreground"[^>]*>[^<]*<\/p>\s*\n/,
      layoutOpen + '\n      ',
    )
  }

  if (!content.includes('</DashboardPageLayout>')) {
    const returnMatch = content.match(/return \(\s*\n\s*<div className="space-y-6">/)
    if (returnMatch) {
      content = content.replace(
        /<div className="space-y-6">/,
        layoutOpen,
      )
      content = content.replace(/\n\s*\)\s*\n\}\s*$/, '\n    </DashboardPageLayout>\n  )\n}\n')
    }
  }

  if (content.includes('<DashboardPageLayout') && !content.includes('</DashboardPageLayout>')) {
    content = content.replace(/(\n\s*)\)\s*(\n\})\s*$/, '$1    </DashboardPageLayout>$1)$2')
  }

  fs.writeFileSync(file, content)
  return { rel, status: 'migrated', title }
}

const files = walk(dashboardDir)
const results = files.map(migrate)
const migrated = results.filter((r) => r.status === 'migrated')
console.log(`Migrated ${migrated.length} pages`)
migrated.forEach((r) => console.log(`  ✓ ${r.rel} — ${r.title}`))
const failed = results.filter((r) => r.status === 'no-title' || r.status === 'no-h1')
if (failed.length) console.log(`Skipped ${failed.length} (manual needed)`)
