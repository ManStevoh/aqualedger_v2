#!/usr/bin/env node
/**
 * Migrate dashboard pages to DashboardPageLayout + useDashboardPageMeta.
 * Run: node scripts/migrate-dashboard-layout.mjs
 */
import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'app', 'dashboard')

const SKIP = new Set([
  'page.tsx', // command center — custom layout via DashboardPageLayout manually
  'onboarding/page.tsx',
  'mobile/delivery/page.tsx',
  'mobile/fisherman/page.tsx', // minimal chrome in dashboard-chrome
  'modules/[moduleId]/page.tsx', // ModuleDashboardShell
  'orders/[id]/page.tsx', // ObjectPageShell detail view
])

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function esc(s) {
  return s.replace(/'/g, "\\'")
}

function addMetaHook(out, title, description) {
  if (out.includes('const meta = useDashboardPageMeta')) return out
  const metaArg = description
    ? `{ title: '${esc(title)}', description: '${esc(description)}' }`
    : `{ title: '${esc(title)}' }`
  return out.replace(
    /((?:export default )?function \w+[^)]*\)\s*\{|function \w+Content\([^)]*\)\s*\{)/,
    `$1\n  const meta = useDashboardPageMeta(${metaArg})\n`,
  )
}

function closeLayout(out) {
  if (out.includes('<DashboardPageLayout') && !out.includes('</DashboardPageLayout>')) {
    return out.replace(/\n(\s*)<\/div>\s*\n(\s*)\)\s*\n\}/, '\n$1</DashboardPageLayout>\n$2)\n}\n')
  }
  return out
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, ent.name).replace(/\\/g, '/')
    const fromRoot = rel.replace(root.replace(/\\/g, '/') + '/', '')
    if (ent.isDirectory()) walk(rel, acc)
    else if (ent.name === 'page.tsx') acc.push(fromRoot)
  }
  return acc
}

function ensureImports(content) {
  let out = content
  if (!out.includes("'use client'")) {
    out = "'use client'\n\n" + out
  }
  if (!out.includes('DashboardPageLayout')) {
    const line =
      "import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'\n"
    const m = out.match(/^('use client'[\s\S]*?\n\n)/)
    out = m ? m[1] + line + out.slice(m[1].length) : line + out
  }
  if (!out.includes('useDashboardPageMeta')) {
    const line = "import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'\n"
    const layoutImport = out.indexOf("dashboard-page-layout")
    if (layoutImport >= 0) {
      const insertAfter = out.indexOf('\n', out.indexOf("dashboard-page-layout'"))
      out = out.slice(0, insertAfter + 1) + line + out.slice(insertAfter + 1)
    } else {
      const m = out.match(/^('use client'[\s\S]*?\n\n)/)
      out = m ? m[1] + line + out.slice(m[1].length) : line + out
    }
  }
  return out
}

function removeImport(content, name) {
  return content
    .replace(
      new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '@/components/dashboard/module-page-header'\\n`),
      '',
    )
    .replace(
      new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '@/components/dashboard/workspace-nav'\\n`),
      '',
    )
    .replace(/,?\s*ModulePageHeader\s*,?/g, (m) => (m.includes(',') ? ',' : ''))
    .replace(/,?\s*WorkspaceNav\s*,?/g, (m) => (m.includes(',') ? ',' : ''))
    .replace(/import \{,\s*/g, 'import { ')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\} from/g, ' } from')
}

/** ModulePageHeader + meta → DashboardPageLayout */
function migrateModulePageHeader(content) {
  if (!content.includes('ModulePageHeader') || content.includes('DashboardPageLayout')) {
    return content
  }
  let out = ensureImports(content)

  if (!out.includes('const meta = useDashboardPageMeta')) {
    out = out.replace(
      /((?:export default )?function \w+\([^)]*\)\s*\{)/,
      '$1\n  const meta = useDashboardPageMeta()\n',
    )
  }

  // Remove standalone WorkspaceNav line (layout provides it)
  out = out.replace(/\s*<WorkspaceNav[^>]*\/>\s*\n/g, '\n')
  out = out.replace(/\s*<WorkspaceNav[\s\S]*?<\/WorkspaceNav>\s*\n/g, '\n')

  // Replace opening wrapper + ModulePageHeader block with DashboardPageLayout
  out = out.replace(
    /<div className="space-y-(?:6|8)[^"]*">\s*<ModulePageHeader([\s\S]*?)\/>\s*/,
    '<DashboardPageLayout$1>\n',
  )

  // Fix self-closing ModulePageHeader variant
  out = out.replace(
    /<div className="space-y-(?:6|8)[^"]*">\s*<ModulePageHeader([\s\S]*?)\/>\s*/,
    '<DashboardPageLayout$1>\n',
  )

  out = removeImport(out, 'ModulePageHeader')
  out = removeImport(out, 'WorkspaceNav')

  // Close: last </div> before ); in default export
  if (out.includes('<DashboardPageLayout') && !out.includes('</DashboardPageLayout>')) {
    out = out.replace(/\n(\s*)<\/div>\s*\n(\s*)\)\s*\n\}/, '\n$1</DashboardPageLayout>\n$2)\n}\n')
  }
  return out
}

/** Simple h1 + p header in space-y-6 */
function migrateSimpleHeader(content, relPath) {
  if (content.includes('DashboardPageLayout') || content.includes('ModulePageHeader')) {
    return content
  }
  const match = content.match(
    /export default function (\w+)\([^)]*\)\s*\{([\s\S]*?)return \(\s*<div className="space-y-(?:6|8)[^"]*">\s*<div>\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*<\/div>/,
  )
  if (!match) return content

  const fnName = match[1]
  const title = match[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  const description = match[4].replace(/\s+/g, ' ').trim()

  let out = ensureImports(content)

  if (!out.includes('useDashboardPageMeta')) {
    out = out.replace(
      new RegExp(`(export default function ${fnName}\\([^)]*\\)\\s*\\{)`),
      `$1\n  const meta = useDashboardPageMeta({ title: '${title.replace(/'/g, "\\'")}', description: '${description.replace(/'/g, "\\'")}' })\n`,
    )
  }

  out = out.replace(
    /return \(\s*<div className="space-y-(?:6|8)[^"]*">\s*<div>\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>[\s\S]*?<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>[\s\S]*?<\/p>\s*<\/div>\s*/,
    'return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>\n',
  )

  if (!out.includes('</DashboardPageLayout>')) {
    out = out.replace(/\n(\s*)<\/div>\s*\n(\s*)\)\s*\n\}/, '\n$1</DashboardPageLayout>\n$2)\n}\n')
  }
  return out
}

/** Flex header with h1 and optional actions */
function migrateFlexHeader(content) {
  if (content.includes('DashboardPageLayout')) return content
  const match = content.match(
    /return \(\s*<div className="space-y-(?:6|8)[^"]*">\s*<div className="flex[^"]*"[^>]*>\s*<div>\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*<\/div>\s*([\s\S]*?)<\/div>\s*/,
  )
  if (!match) return content

  const title = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80)
  const description = match[2].replace(/\s+/g, ' ').trim().slice(0, 200)
  let actions = match[3].trim()
  if (actions.startsWith('<div') && actions.endsWith('</div>')) {
    actions = actions
  } else if (actions) {
    actions = `<>${actions}</>`
  }
  const actionsProp = actions ? ` actions={${actions}}` : ''

  let out = ensureImports(content)
  if (!out.match(/useDashboardPageMeta/)) {
    out = out.replace(
      /(export default function \w+\([^)]*\)\s*\{)/,
      `$1\n  const meta = useDashboardPageMeta({ title: '${title.replace(/'/g, "\\'")}', description: '${description.replace(/'/g, "\\'")}' })\n`,
    )
  }

  out = out.replace(
    match[0],
    `return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}${actionsProp}>\n`,
  )

  if (!out.includes('</DashboardPageLayout>')) {
    out = out.replace(/\n(\s*)<\/div>\s*\n(\s*)\)\s*\n\}/, '\n$1</DashboardPageLayout>\n$2)\n}\n')
  }
  return out
}

/** <div space-y-*><h1>…</h1> optional <p>…</p> */
function migrateLooseHeader(content) {
  if (content.includes('DashboardPageLayout')) return content
  const re =
    /return \(\s*<div className="[^"]*space-y-(?:6|8)[^"]*">\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*(?:<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*)?/
  const match = content.match(re)
  if (!match) return content
  const title = stripHtml(match[1])
  const description = match[2] ? stripHtml(match[2]) : undefined
  let out = ensureImports(content)
  out = addMetaHook(out, title, description)
  out = out.replace(
    re,
    'return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>\n',
  )
  return closeLayout(out)
}

/** flex row with h1 + trailing actions, description in following <p> */
function migrateH1RowWithActions(content) {
  if (content.includes('DashboardPageLayout')) return content
  const re =
    /return \(\s*<div className="space-y-(?:6|8)[^"]*">\s*<div className="flex[^"]*">\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*([\s\S]*?)<\/div>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*/
  const match = content.match(re)
  if (!match) return content
  const title = stripHtml(match[1])
  const description = stripHtml(match[3])
  const actions = match[2].trim()
  const actionsProp = actions ? ` actions={<>${actions}</>}` : ''
  let out = ensureImports(content)
  out = addMetaHook(out, title, description)
  out = out.replace(
    re,
    `return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}${actionsProp}>\n`,
  )
  return closeLayout(out)
}

/** flex justify-between: inner div (optional back link) + h1 + p | actions */
function migrateFlexPageHeader(content) {
  if (content.includes('DashboardPageLayout')) return content
  const re =
    /return \(\s*<div className="space-y-(?:6|8)[^"]*">\s*<div className="flex[^"]*"[^>]*>\s*<div>\s*(?:[\s\S]*?)?<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*<\/div>\s*([\s\S]*?)<\/div>\s*/
  const match = content.match(re)
  if (!match) return content
  const title = stripHtml(match[1])
  const description = stripHtml(match[2])
  let actions = match[3].trim()
  if (actions.startsWith('<div') && actions.endsWith('</div>')) {
    actions = actions
  } else if (actions) {
    actions = `<>${actions}</>`
  }
  const actionsProp = actions ? ` actions={${actions}}` : ''
  let out = ensureImports(content)
  out = addMetaHook(out, title, description)
  out = out.replace(
    re,
    `return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}${actionsProp}>\n`,
  )
  return closeLayout(out)
}

/** centered icon + h1 + p (clock kiosk) */
function migrateCenteredHeader(content) {
  if (content.includes('DashboardPageLayout')) return content
  const re =
    /return \(\s*<div className="space-y-6 max-w-md mx-auto">\s*<div className="text-center">\s*[\s\S]*?<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*<\/div>\s*/
  const match = content.match(re)
  if (!match) return content
  const title = stripHtml(match[1])
  const description = stripHtml(match[2])
  let out = ensureImports(content)
  out = addMetaHook(out, title, description)
  out = out.replace(
    re,
    'return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} className="max-w-md mx-auto">\n',
  )
  return closeLayout(out)
}

/** compact scan / inline h1 with icon */
function migrateInlineH1Header(content) {
  if (content.includes('DashboardPageLayout')) return content
  const re =
    /return \(\s*<div className="[^"]*">\s*<div className="flex items-center gap-2">\s*[\s\S]*?<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<\/div>\s*/
  const match = content.match(re)
  if (!match) return content
  const title = stripHtml(match[1])
  let out = ensureImports(content)
  out = addMetaHook(out, title, undefined)
  out = out.replace(
    re,
    'return (\n    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} className="max-w-lg mx-auto">\n',
  )
  return closeLayout(out)
}

const files = walk(root)
const migrated = []

for (const rel of files) {
  if (SKIP.has(rel)) continue
  const file = path.join(root, rel)
  let content = fs.readFileSync(file, 'utf8')
  if (content.includes('DashboardPageLayout')) continue

  const before = content
  content = migrateModulePageHeader(content)
  content = migrateFlexHeader(content)
  content = migrateSimpleHeader(content, rel)
  content = migrateFlexPageHeader(content)
  content = migrateH1RowWithActions(content)
  content = migrateLooseHeader(content)
  content = migrateCenteredHeader(content)
  content = migrateInlineH1Header(content)

  if (content !== before) {
    fs.writeFileSync(file, content)
    migrated.push(rel)
  }
}

console.log(`Migrated ${migrated.length} pages:\n${migrated.join('\n')}`)
