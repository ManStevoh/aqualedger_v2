import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const v2Dir = path.join(root, 'app', 'api', 'v2')

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(p))
    else if (e.name === 'route.ts') files.push(p)
  }
  return files
}

for (const file of walk(v2Dir)) {
  let content = fs.readFileSync(file, 'utf8')
  if (content.includes('handleApiError') && content.includes("from '@/lib/api-handler'")) continue
  if (!content.includes('} catch (error)')) continue

  if (!content.includes("from '@/lib/api-handler'")) {
    const idx = content.indexOf('\n', content.indexOf('import '))
    content =
      content.slice(0, idx + 1) +
      "import { handleApiError } from '@/lib/api-handler'\n" +
      content.slice(idx + 1)
  }

  const rel = path.relative(path.join(root, 'app', 'api'), file).replace(/\\/g, '/').replace('/route.ts', '')

  content = content.replace(
    /\} catch \(error\) \{[\s\S]*?\n  \}/g,
    (block) => {
      if (!block.includes('NextResponse.json') && !block.includes('console.error')) return block
      return `} catch (error) {\n    return handleApiError(error, '${rel}')\n  }`
    },
  )

  fs.writeFileSync(file, content)
  console.log('Patched', rel)
}
