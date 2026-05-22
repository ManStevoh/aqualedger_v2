import path from 'path'
import fs from 'fs/promises'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getTenantExportById } from '@/lib/modules/platform/scheduled-export'

export const GET = apiHandler(async (_request, context) => {
  await requireSuperAdmin()
  const params = await context?.params
  const id = params?.id
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid export id' }, { status: 400 })
  }

  const row = await getTenantExportById(id)
  if (!row) {
    return NextResponse.json({ success: false, error: 'Export not found' }, { status: 404 })
  }

  if (row.status !== 'completed' || !row.filePath) {
    return NextResponse.json(
      { success: false, error: 'Export not ready for download' },
      { status: 409 },
    )
  }

  const absolutePath = path.join(process.cwd(), row.filePath)
  let body: Buffer
  try {
    body = await fs.readFile(absolutePath)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Export file missing on disk' },
      { status: 404 },
    )
  }

  const fileName = `${row.tenantSlug}-gdpr-${row.id}.json`
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}, 'v2/platform/exports/download')
