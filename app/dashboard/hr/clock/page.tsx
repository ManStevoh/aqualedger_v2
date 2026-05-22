'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Clock } from 'lucide-react'

export default function ClockInPage() {
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: { employees: typeof employees } }>('/api/v2/hr/employees?limit=100').then(
      (res) => {
        if (res.success && res.data?.employees) setEmployees(res.data.employees)
      },
    )
  }, [])

  const clock = async (type: 'in' | 'out') => {
    if (!employeeId) {
      toast.error('Select employee')
      return
    }
    const body =
      type === 'in'
        ? { employeeId, workDate: today, checkIn: now, status: 'present' }
        : { employeeId, workDate: today, checkOut: now, status: 'present' }

    try {
      const res = await authFetchJson<{ success: boolean }>('/api/v2/hr/attendance', { method: 'POST', body: JSON.stringify(body) })
      if (res.success) toast.success(type === 'in' ? 'Clocked in' : 'Clocked out')
    } catch {
      toast.error('Clock failed')
    }
  }

  return (
    <DashboardPageLayout
      title="Clock In / Out"
      description={`${today} · ${now}`}
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-primary mb-2" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Employee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select yourself</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" onClick={() => clock('in')}>
                Clock In
              </Button>
              <Button size="lg" variant="outline" onClick={() => clock('out')}>
                Clock Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
