import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listJobPostings,
  createJobPosting,
  listApplicants,
  createApplicant,
  updateApplicantStage,
} from '@/lib/modules/hr/recruitment'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.read')
  const jobId = new URL(request.url).searchParams.get('jobId') ?? undefined
  if (jobId || new URL(request.url).searchParams.get('view') === 'applicants') {
    const applicants = await listApplicants(ctx.tenantId, jobId ?? undefined)
    return jsonOk({ applicants })
  }
  const jobs = await listJobPostings(ctx.tenantId)
  return jsonOk({ jobs })
}, 'v2/hr/recruitment')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.write')
  const body = z
    .object({
      type: z.enum(['job', 'applicant']),
      title: z.string().optional(),
      department: z.string().optional(),
      description: z.string().optional(),
      postedAt: z.string().optional(),
      jobId: z.string().optional(),
      fullName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .parse(await request.json())

  if (body.type === 'applicant') {
    const applicant = await createApplicant(ctx.tenantId, {
      jobId: body.jobId!,
      fullName: body.fullName!,
      email: body.email,
      phone: body.phone,
    })
    return jsonOk({ applicant }, 201)
  }

  const job = await createJobPosting(ctx.tenantId, {
    title: body.title!,
    department: body.department,
    description: body.description,
    postedAt: body.postedAt ?? new Date().toISOString().split('T')[0],
  })
  return jsonOk({ job }, 201)
}, 'v2/hr/recruitment')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.write')
  const body = z.object({ applicantId: z.string(), stage: z.string() }).parse(await request.json())
  const applicant = await updateApplicantStage(ctx.tenantId, body.applicantId, body.stage)
  return jsonOk({ applicant })
}, 'v2/hr/recruitment')
