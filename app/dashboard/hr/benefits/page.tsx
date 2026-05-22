'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Heart, Plus } from 'lucide-react'

export default function BenefitsPage() {
  const meta = useDashboardPageMeta()

  const [plans, setPlans] = useState<{ id: string; name: string; plan_type: string }[]>([])
  const [enrollments, setEnrollments] = useState<{ employee_name?: string; plan_name?: string; enrolled_at: string }[]>([])
  const [planName, setPlanName] = useState('')

  const load = async () => {
    const [p, e] = await Promise.all([
      authFetchJson<{ success: boolean; data?: { plans: typeof plans } }>('/api/v2/hr/benefits'),
      authFetchJson<{ success: boolean; data?: { enrollments: typeof enrollments } }>('/api/v2/hr/benefits?view=enrollments'),
    ])
    if (p.success && p.data?.plans) setPlans(p.data.plans)
    if (e.success && e.data?.enrollments) setEnrollments(e.data.enrollments)
  }

  useEffect(() => {
    load()
  }, [])

  const addPlan = async () => {
    const res = await authFetchJson<{ success: boolean }>('/api/v2/hr/benefits', {
      method: 'POST',
      body: JSON.stringify({ type: 'plan', name: planName, planType: 'health' }),
    })
    if (res.success) {
      toast.success('Plan created')
      setPlanName('')
      load()
    }
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs}>
<Tabs defaultValue="plans">
        <TabsList><TabsTrigger value="plans">Plans</TabsTrigger><TabsTrigger value="enrollments">Enrollments</TabsTrigger></TabsList>
        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Benefit plans</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1"><Label>Name</Label><Input value={planName} onChange={(e) => setPlanName(e.target.value)} /></div>
                <Button className="mt-6" onClick={addPlan}><Plus className="h-4 w-4 mr-2" />Add plan</Button>
              </div>
              {plans.map((p) => (
                <div key={p.id} className="flex justify-between border-b py-2">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground capitalize">{p.plan_type}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="enrollments" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {enrollments.map((e, i) => (
                <div key={i} className="flex justify-between border-b py-2">
                  <span>{e.employee_name}</span>
                  <span>{e.plan_name} · {String(e.enrolled_at).slice(0, 10)}</span>
                </div>
              ))}
              {enrollments.length === 0 && <p className="text-muted-foreground">No enrollments yet</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  )
}

