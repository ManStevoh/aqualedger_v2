/**
 * Add missing `const meta = useDashboardPageMeta()` to dashboard pages.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app', 'dashboard')

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, files)
    else if (name === 'page.tsx') files.push(p)
  }
  return files
}

const HOOK_IMPORT =
  "import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'\n"
const HOOK_LINE = '  const meta = useDashboardPageMeta()\n'

let fixed = 0

for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8')
  if (!/meta\.(title|description|breadcrumbs)/.test(content)) continue
  if (/useDashboardPageMeta\s*\(/.test(content)) continue

  if (!content.includes('use-dashboard-page')) {
    const layoutImport = content.match(
      /import \{ DashboardPageLayout \} from '@\/components\/dashboard\/dashboard-page-layout'\n/,
    )
    if (layoutImport) {
      content = content.replace(layoutImport[0], layoutImport[0] + HOOK_IMPORT)
    } else if (content.includes("'use client'")) {
      content = content.replace(/('use client'\n\n)/, `$1${HOOK_IMPORT}`)
    } else {
      content = `'use client'\n\n${HOOK_IMPORT}${content}`
    }
  }

  const fnMatch = content.match(/export default function \w+\([^)]*\)\s*\{/)
  if (!fnMatch) {
    console.warn('Skip (no default export fn):', file)
    continue
  }

  const insertAt = fnMatch.index + fnMatch[0].length
  content = content.slice(0, insertAt) + '\n' + HOOK_LINE + content.slice(insertAt)

  fs.writeFileSync(file, content)
  fixed++
  console.log('Fixed:', path.relative(root, file))
}

console.log(`\nDone. Fixed ${fixed} file(s).`)
