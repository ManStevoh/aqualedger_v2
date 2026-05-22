'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { UserCircle, Plus } from 'lucide-react'

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<{ id: string; title: string; status: string; applicant_count?: number }[]>([])
  const [applicants, setApplicants] = useState<{ id: string; full_name: string; job_title?: string; stage: string }[]>([])
  const [title, setTitle] = useState('')

  const load = async () => {
    const [j, a] = await Promise.all([
      authFetchJson<{ success: boolean; data?: { jobs: typeof jobs } }>('/api/v2/hr/recruitment'),
      authFetchJson<{ success: boolean; data?: { applicants: typeof applicants } }>('/api/v2/hr/recruitment?view=applicants'),
    ])
    if (j.success && j.data?.jobs) setJobs(j.data.jobs)
    if (a.success && a.data?.applicants) setApplicants(a.data.applicants)
  }

  useEffect(() => {
    load()
  }, [])

  const addJob = async () => {
    const res = await authFetchJson<{ success: boolean }>('/api/v2/hr/recruitment', {
      method: 'POST',
      body: JSON.stringify({ type: 'job', title }),
    })
    if (res.success) {
      toast.success('Job posted')
      setTitle('')
      load()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><UserCircle className="h-8 w-8" />Recruitment</h1>
        <p className="text-muted-foreground">Open roles and applicant pipeline</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Post job</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <div className="flex-1"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <Button className="mt-6" onClick={addJob}><Plus className="h-4 w-4 mr-2" />Post</Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Open positions</CardTitle></CardHeader>
          <CardContent>
            {jobs.map((j) => (
              <div key={j.id} className="flex justify-between border-b py-2">
                <span>{j.title}</span>
                <Badge variant="outline">{j.applicant_count ?? 0} applicants</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Applicants</CardTitle></CardHeader>
          <CardContent>
            {applicants.map((a) => (
              <div key={a.id} className="flex justify-between border-b py-2 text-sm">
                <span>{a.full_name}</span>
                <Badge>{a.stage}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
