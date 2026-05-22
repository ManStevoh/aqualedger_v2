import fs from 'fs'
import path from 'path'

function walk(dir, acc = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else if (f === 'page.tsx') acc.push(p)
  }
  return acc
}

for (const p of walk('app/dashboard')) {
  const c = fs.readFileSync(p, 'utf8')
  const hasH1 = /<h1[^>]*className="[^"]*text-(2xl|3xl)/.test(c)
  const hasLayout = /<DashboardPageLayout/.test(c)
  const hasImport = /DashboardPageLayout/.test(c)
  if (hasH1 && !hasLayout) console.log('H1_NO_LAYOUT', p)
  if (hasImport && !hasLayout) console.log('IMPORT_UNUSED', p)
}
