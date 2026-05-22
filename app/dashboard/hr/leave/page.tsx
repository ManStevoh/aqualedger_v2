'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Calendar, Check, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  full_name: string
}

interface LeaveRequest {
  id: string
  employee_id: string
  employee_name?: string
  leave_type: string
  start_date: string
  end_date: string
  days: number
  status: string
  reason: string | null
  created_at: string
}

export default function HRLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [leaveType, setLeaveType] = useState('annual')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [days, setDays] = useState('1')
  const [reason, setReason] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const leaveUrl =
        statusFilter === 'all'
          ? '/api/v2/hr/leave?limit=100'
          : `/api/v2/hr/leave?status=${statusFilter}&limit=100`

      const [empRes, leaveRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { employees: Employee[] } }>(
          '/api/v2/hr/employees?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { requests: LeaveRequest[] } }>(leaveUrl),
      ])

      if (empRes.success && empRes.data?.employees) setEmployees(empRes.data.employees)
      if (leaveRes.success && leaveRes.data?.requests) setRequests(leaveRes.data.requests)
    } catch {
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const handleCreate = async () => {
    if (!employeeId || !startDate || !endDate) {
      toast.error('Fill required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/hr/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          leaveType,
          startDate,
          endDate,
          days: Number(days),
          reason: reason.trim() || undefined,
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Could not create request')
        return
      }
      toast.success('Leave request submitted')
      setDialogOpen(false)
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/hr/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved }),
      })
      if (!res.success) {
        toast.error(res.error || 'Action failed')
        return
      }
      toast.success(approved ? 'Leave approved' : 'Leave rejected')
      await fetchData()
    } catch {
      toast.error('Network error')
    }
  }

  const pending = requests.filter((r) => r.status === 'pending').length
  const approved = requests.filter((r) => r.status === 'approved').length

  return (
    <DashboardPageLayout
      title="Leave management"
      description="Submit and approve employee leave requests"
      actions={
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New request
        </Button>
      }
    >
      <StatCardGrid>
        <StatCard title="Pending" value={pending} icon={<Calendar className="h-4 w-4" />} loading={loading} />
        <StatCard title="Approved" value={approved} loading={loading} />
      </StatCardGrid>

      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        title="Leave requests"
        loading={loading}
        data={requests}
        emptyMessage="No leave requests"
        columns={[
          { key: 'employee_name', header: 'Employee' },
          { key: 'leave_type', header: 'Type' },
          {
            key: 'dates',
            header: 'Dates',
            cell: (row) => `${String(row.start_date).slice(0, 10)} → ${String(row.end_date).slice(0, 10)}`,
          },
          { key: 'days', header: 'Days' },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{row.status}</Badge>,
          },
          {
            key: 'actions',
            header: '',
            cell: (row) =>
              row.status === 'pending' ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleApprove(row.id, true)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleApprove(row.id, false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : null,
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New leave request</DialogTitle>
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
              <Label>Leave type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Days</Label>
              <Input type="number" min={0.5} step={0.5} value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
