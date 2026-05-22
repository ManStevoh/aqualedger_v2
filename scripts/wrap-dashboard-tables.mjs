#!/usr/bin/env node
/** Wrap shadcn <Table> blocks in DataTableShell for mobile horizontal scroll */
import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'app', 'dashboard')
const importLine =
  "import { DataTableShell } from '@/components/dashboard/data-table-shell'\n"

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, acc)
    else if (ent.name.endsWith('.tsx')) acc.push(p)
  }
  return acc
}

let changed = 0
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8')
  if (!content.includes('<Table') || content.includes('DataTableShell')) continue

  if (!content.includes("data-table-shell")) {
    const tableImport = content.match(/import \{[^}]+\} from '@\/components\/ui\/table'/)
    if (tableImport) {
      content = content.replace(tableImport[0], tableImport[0] + '\n' + importLine.trim())
    } else {
      const firstImport = content.indexOf("import ")
      if (firstImport >= 0) {
        const lineEnd = content.indexOf('\n', firstImport)
        content = content.slice(0, lineEnd + 1) + importLine + content.slice(lineEnd + 1)
      }
    }
  }

  // Wrap standalone <Table>...</Table> not already in DataTableShell
  const wrapped = content.replace(
    /(<(?:CardContent|div[^>]*|TableCell)[^>]*>\s*)(<Table>)/g,
    (match, prefix, table) => {
      if (match.includes('DataTableShell')) return match
      return `${prefix}<DataTableShell>\n                ${table}`
    },
  )

  let out = wrapped
  // Close before </CardContent> following Table - heuristic: </Table>\n            </CardContent>
  out = out.replace(
    /(<\/Table>)(\s*)(<\/CardContent>)/g,
    '$1\n              </DataTableShell>$2$3',
  )
  out = out.replace(
    /(<\/Table>)(\s*)(<\/div>)(\s*)(<\/Card>)/g,
    (m, t, s1, div, card) => {
      if (m.includes('DataTableShell')) return m
      return `${t}\n              </DataTableShell>${s1}${div}${card}`
    },
  )

  if (out !== content) {
    fs.writeFileSync(file, out)
    changed++
    console.log('  wrapped', path.relative(process.cwd(), file))
  }
}

console.log(`\nWrapped tables in ${changed} file(s).`)
