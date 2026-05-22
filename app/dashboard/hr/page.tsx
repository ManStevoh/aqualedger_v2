'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatCard } from '@/components/dashboard/stat-card'
import { Users, UserPlus, Briefcase, DollarSign } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

interface Employee {
  id: string
  employee_number: string
  full_name: string
  department: string | null
  job_title: string | null
  hire_date: string | null
  salary: number | null
  status: string
}

export default function HRPage() {
  const meta = useDashboardPageMeta()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [salary, setSalary] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { employees: Employee[] }
      }>('/api/v2/hr/employees?limit=100')
      if (data.success && data.data?.employees) {
        setEmployees(data.data.employees)
      }
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/hr/employees',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            department: department.trim() || undefined,
            jobTitle: jobTitle.trim() || undefined,
            hireDate: hireDate || undefined,
            salary: salary ? Number(salary) : undefined,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create employee')
        return
      }
      toast.success('Employee added')
      setAddOpen(false)
      setFullName('')
      setDepartment('')
      setJobTitle('')
      setHireDate('')
      setSalary('')
      await fetchEmployees()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const active = employees.filter((e) => e.status === 'active').length
  const onLeave = employees.filter((e) => e.status === 'on_leave').length
  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0)

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><Button className="gap-2" onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Add Employee
        </Button></>}>
<div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Staff" value={employees.length} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Active" value={active} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="On Leave" value={onLeave} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Monthly Payroll" value={`KES ${totalPayroll.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Tenant-scoped HR records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Number</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Department</th>
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Hire Date</th>
                  <th className="text-left py-3 px-4 font-medium">Salary</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono">{e.employee_number}</td>
                    <td className="py-3 px-4 font-medium">{e.full_name}</td>
                    <td className="py-3 px-4">{e.department || '—'}</td>
                    <td className="py-3 px-4">{e.job_title || '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {e.hire_date ? String(e.hire_date).split('T')[0] : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {e.salary != null ? `KES ${Number(e.salary).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>
                        {e.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No employees yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add employee</DialogTitle>
            <DialogDescription>Creates a new employee record for this tenant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Job title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hire date</Label>
              <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Salary (KES)</Label>
              <Input type="number" min={0} value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}

