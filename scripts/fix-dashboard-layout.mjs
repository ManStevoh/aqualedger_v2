import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'app', 'dashboard')

const priorityFiles = [
  'admin/analytics/page.tsx',
  'admin/audit/page.tsx',
  'admin/billing/page.tsx',
  'admin/health/page.tsx',
  'admin/payments/page.tsx',
  'admin/security/page.tsx',
  'admin/settings/page.tsx',
  'admin/tenants/page.tsx',
  'admin/users/page.tsx',
  'settings/security/page.tsx',
  'analytics/reports/page.tsx',
  'communications/page.tsx',
  'vendor/page.tsx',
  'commerce/storefront/page.tsx',
  'fishing/crew/page.tsx',
  'hr/recruitment/page.tsx',
  'hr/benefits/page.tsx',
  'hr/org-chart/page.tsx',
  'accounting/periods/page.tsx',
  'accounting/tax-returns/page.tsx',
  'accounting/budgets/page.tsx',
  'accounting/bank-reconciliation/page.tsx',
  'accounting/fixed-assets/page.tsx',
  'integrations/devices/page.tsx',
  'integrations/iot/page.tsx',
  'mobile/fisherman/page.tsx',
  'ai/page.tsx',
  'commerce/cart/page.tsx',
  'commerce/wishlist/page.tsx',
]

function ensureClientAndImport(content) {
  let out = content
  if (!out.includes("'use client'") && !out.includes('"use client"')) {
    out = "'use client'\n\n" + out
  }
  if (!out.includes('DashboardPageLayout')) {
    const importLine =
      "import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'\n"
    const m = out.match(/^('use client'[\s\S]*?\n\n)/)
    if (m) {
      out = m[1] + importLine + out.slice(m[1].length)
    } else {
      out = importLine + out
    }
  }
  return out
}

function fixDuplicateLayout(content) {
  return content.replace(
    /<DashboardPageLayout\s+title="([^"]*)"\s+description="([^"]*)"\s*>\s*<DashboardPageLayout\s+title="\1"\s+description="\2"\s*>/g,
    '<DashboardPageLayout title="$1" description="$2">',
  )
}

function fixAiSyntax(content) {
  return content
    .replace(
      /(\s+)<\/div>\s*\n\s*<Card id="brief">/,
      '$1}\n\n      <Card id="brief">',
    )
    .replace(/\s*<\/div>\s*\n\s*\)\s*\n\}/, '\n    </DashboardPageLayout>\n  )\n}')
}

function stripRawHeader(content) {
  // flex header with optional actions - capture button block
  const flexHeader = content.match(
    /<div className="(?:space-y-6|space-y-8)(?:\s+p-6)?">\s*<div className="flex[^"]*"[^>]*>\s*<div>\s*(?:<Button[\s\S]*?<\/Button>\s*)?<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*<\/div>\s*([\s\S]*?)<\/div>/,
  )
  if (flexHeader) {
    const title = flexHeader[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    const description = flexHeader[2].replace(/\s+/g, ' ').trim()
    const actions = flexHeader[3].trim()
    const actionsProp = actions ? ` actions={<>${actions}</>}` : ''
    const rest = content.slice(flexHeader.index + flexHeader[0].length)
    return (
      ensureClientAndImport(content.slice(0, flexHeader.index)) +
      `<DashboardPageLayout title="${title}" description="${description}"${actionsProp}>\n` +
      stripRawHeader(rest)
    )
  }

  // simple div header
  const simple = content.match(
    /<div className="(?:space-y-6|space-y-8)(?:\s+p-6)?">\s*<div>\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>\s*<\/div>/,
  )
  if (simple) {
    const title = simple[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    const description = simple[2].replace(/\s+/g, ' ').trim()
    const rest = content.slice(simple.index + simple[0].length)
    return (
      ensureClientAndImport(content.slice(0, simple.index)) +
      `<DashboardPageLayout title="${title}" description="${description}">\n` +
      stripRawHeader(rest)
    )
  }

  // h1 without wrapping p (vendor style)
  const h1only = content.match(
    /<div className="space-y-8">\s*<h1 className="text-2xl[^"]*"[^>]*>([\s\S]*?)<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>([\s\S]*?)<\/p>/,
  )
  if (h1only) {
    const title = h1only[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    const description = h1only[2].replace(/\s+/g, ' ').trim()
    const rest = content.slice(h1only.index + h1only[0].length)
    return (
      ensureClientAndImport(content.slice(0, h1only.index)) +
      `<DashboardPageLayout title="${title}" description="${description}">\n` +
      stripRawHeader(rest)
    )
  }

  return content
}

function closeLayout(content) {
  // remove duplicate h1 block inside layout
  content = content.replace(
    /\s*<div>\s*<h1 className="text-(?:2xl|3xl)[^"]*"[^>]*>[\s\S]*?<\/h1>\s*<p className="text-muted-foreground[^"]*"[^>]*>[\s\S]*?<\/p>\s*<\/div>\s*/,
    '\n',
  )
  content = fixDuplicateLayout(content)
  // fix trailing </div> before </DashboardPageLayout>
  content = content.replace(/\n\s*<\/div>\s*\n(\s*)<\/DashboardPageLayout>/g, '\n$1</DashboardPageLayout>')
  if (content.includes('<DashboardPageLayout') && !content.includes('</DashboardPageLayout>')) {
    content = content.replace(/\n\s*\)\s*\n\}\s*$/, '\n    </DashboardPageLayout>\n  )\n}\n')
  }
  return content
}

const fixed = []
for (const rel of priorityFiles) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) continue
  let content = fs.readFileSync(file, 'utf8')
  const before = content
  if (rel === 'ai/page.tsx') {
    content = fixAiSyntax(content)
    content = ensureClientAndImport(content)
  } else if (rel === 'mobile/fisherman/page.tsx') {
    if (!content.includes('DashboardPageLayout')) {
      content = ensureClientAndImport(content)
      content = content.replace(
        /<header className="px-4 py-6 border-b border-slate-800">\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<p className="text-sm text-slate-400 mt-1">Works offline · sync when back online<\/p>\s*<\/header>/,
        '',
      )
      content = content.replace(
        /return \(\s*<div className="min-h-screen/,
        'return (\n    <DashboardPageLayout\n      title="Fisherman — Quick log"\n      description="Works offline · sync when back online"\n      hideWorkspaceNav\n    >\n    <div className="min-h-screen',
      )
      content = content.replace(/<\/main>\s*<\/div>\s*\)/, '</main>\n    </div>\n    </DashboardPageLayout>\n  )')
    }
  } else if (content.match(/<h1 className="text-(?:2xl|3xl)/)) {
    content = stripRawHeader(content)
    content = closeLayout(content)
  } else {
    content = closeLayout(content)
  }
  if (content !== before) {
    fs.writeFileSync(file, content)
    fixed.push(rel)
  }
}

console.log('Fixed:', fixed.join('\n'))
