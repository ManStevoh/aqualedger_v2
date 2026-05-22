'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { ClipboardList, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  full_name: string
}

interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name?: string
  work_date: string
  check_in: string | null
  check_out: string | null
  hours_worked: number | null
  status: string
}

export default function HRAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0])
  const [checkIn, setCheckIn] = useState('08:00')
  const [checkOut, setCheckOut] = useState('17:00')
  const [status, setStatus] = useState('present')

  const fetchData = async () => {
    setLoading(true)
    try {
      const empUrl = '/api/v2/hr/employees?limit=100'
      const attUrl =
        filterEmployee === 'all'
          ? '/api/v2/hr/attendance?limit=100'
          : `/api/v2/hr/attendance?employeeId=${filterEmployee}&limit=100`

      const [empRes, attRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { employees: Employee[] } }>(empUrl),
        authFetchJson<{ success: boolean; data?: { records: AttendanceRecord[] } }>(attUrl),
      ])

      if (empRes.success && empRes.data?.employees) setEmployees(empRes.data.employees)
      if (attRes.success && attRes.data?.records) setRecords(attRes.data.records)
    } catch {
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterEmployee])

  const handleRecord = async () => {
    if (!employeeId) {
      toast.error('Select an employee')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/hr/attendance',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            workDate,
            checkIn: status === 'absent' ? undefined : checkIn,
            checkOut: status === 'absent' ? undefined : checkOut,
            status,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not record attendance')
        return
      }
      toast.success('Attendance recorded')
      setDialogOpen(false)
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const present = records.filter((r) => r.status === 'present').length
  const late = records.filter((r) => r.status === 'late').length

  return (
    <DashboardPageLayout
      title="Attendance"
      description="Daily check-in records by employee"
      actions={
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Record attendance
        </Button>
      }
    >
      <StatCardGrid>
        <StatCard title="Present" value={present} icon={<ClipboardList className="h-4 w-4" />} loading={loading} />
        <StatCard title="Late" value={late} loading={loading} />
      </StatCardGrid>

      <Select value={filterEmployee} onValueChange={setFilterEmployee}>
        <SelectTrigger className="filter-control">
          <SelectValue placeholder="All employees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All employees</SelectItem>
          {employees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable
        title="Attendance log"
        loading={loading}
        data={records}
        emptyMessage="No attendance records"
        columns={[
          { key: 'employee_name', header: 'Employee' },
          {
            key: 'work_date',
            header: 'Date',
            cell: (row) => String(row.work_date).slice(0, 10),
          },
          { key: 'check_in', header: 'In', cell: (row) => row.check_in || '—' },
          { key: 'check_out', header: 'Out', cell: (row) => row.check_out || '—' },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{row.status}</Badge>,
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
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
            <div className="space-y-2">
              <Label>Work date</Label>
              <Input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half day</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {status !== 'absent' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Check in</Label>
                  <Input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Check out</Label>
                  <Input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecord} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
