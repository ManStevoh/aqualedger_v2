import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, jsonOk, ApiError } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import fs from 'fs/promises'
import path from 'path'

export const POST = apiHandler(async (request: NextRequest) => {
  // 1. Authorize: Check write permissions for product catalog
  const ctx = await requirePermission('commerce.catalog.write')
  const tenantId = ctx.tenantId || 'tenant-default-0001'

  // 2. Parse Multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    throw new ApiError('Invalid form data payload', 400, 'BAD_REQUEST')
  }

  const file = formData.get('file') as File | null
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new ApiError('No file uploaded or file is empty', 400, 'FILE_REQUIRED')
  }

  // 3. Define target directories inside public/uploads (statically served by Next.js)
  const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads', 'tenants', tenantId)
  
  // 4. Ensure recursive directory existence
  await fs.mkdir(uploadsBaseDir, { recursive: true })

  // 5. Build safe, unique filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueName = `${Date.now()}-${cleanName}`
  const filePath = path.join(uploadsBaseDir, uniqueName)

  // 6. Write file buffer to local disk
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filePath, buffer)

  // 7. Resolve relative public route path
  const publicUrl = `/uploads/tenants/${tenantId}/${uniqueName}`

  return jsonOk({
    success: true,
    imageUrl: publicUrl,
    fileName: file.name,
    sizeBytes: file.size,
  }, 201)
}, 'v2/commerce/products/upload')
