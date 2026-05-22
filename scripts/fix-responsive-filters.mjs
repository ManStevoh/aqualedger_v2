#!/usr/bin/env node
/** Replace fixed filter widths with mobile-first filter-control class */
import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'app', 'dashboard')

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, acc)
    else if (ent.name.endsWith('.tsx')) acc.push(p)
  }
  return acc
}

// Only standalone w-[Npx], not max-w- or min-w-
const widthRe =
  /\bclassName="([^"]*?)(?<![\w-])w-\[(140|160|180|200|220)px\]([^"]*?)"/g

let changed = 0
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8')
  const orig = content
  content = content.replace(widthRe, (_, before, _px, after) => {
    const parts = [before, 'filter-control', after]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    return `className="${parts}"`
  })
  content = content.replace(
    /\bclassName="([^"]*?)\bh-9 w-\[(160)px\]([^"]*?)"/g,
    'className="$1filter-control h-9$3"',
  )
  content = content.replace(
    /\bmin-w-\[140px\]/g,
    'w-full sm:min-w-[8rem] sm:w-auto',
  )
  if (content !== orig) {
    fs.writeFileSync(file, content)
    changed++
    console.log('  fixed', path.relative(process.cwd(), file))
  }
}
console.log(`\nUpdated ${changed} file(s).`)
