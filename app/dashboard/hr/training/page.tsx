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
import { GraduationCap, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  full_name: string
}

interface TrainingRecord {
  id: string
  title: string
  training_type: string
  employee_name?: string
  completed_at: string | null
  expiry_at: string | null
}

export default function HRTrainingPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [title, setTitle] = useState('')
  const [trainingType, setTrainingType] = useState('safety')
  const [completedAt, setCompletedAt] = useState('')
  const [expiryAt, setExpiryAt] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [empRes, trRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { employees: Employee[] } }>(
          '/api/v2/hr/employees?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { records: TrainingRecord[] } }>(
          '/api/v2/hr/training?limit=100',
        ),
      ])
      if (empRes.success && empRes.data?.employees) setEmployees(empRes.data.employees)
      if (trRes.success && trRes.data?.records) setRecords(trRes.data.records)
    } catch {
      toast.error('Failed to load training records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/hr/training',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: employeeId || undefined,
            title: title.trim(),
            trainingType,
            completedAt: completedAt || undefined,
            expiryAt: expiryAt || undefined,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not save record')
        return
      }
      toast.success('Training record saved')
      setDialogOpen(false)
      setTitle('')
      setEmployeeId('')
      setCompletedAt('')
      setExpiryAt('')
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const expiringSoon = records.filter((r) => {
    if (!r.expiry_at) return false
    const days = (new Date(r.expiry_at).getTime() - Date.now()) / 86400000
    return days >= 0 && days <= 30
  }).length

  return (
    <DashboardPageLayout
      title="Training records"
      description="Safety, HACCP, and compliance certifications"
      actions={
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add record
        </Button>
      }>
      <StatCardGrid>
        <StatCard
          title="Total records"
          value={records.length}
          icon={<GraduationCap className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard title="Expiring (30d)" value={expiringSoon} loading={loading} />
      </StatCardGrid>

      <DataTable
        title="Training log"
        loading={loading}
        data={records}
        emptyMessage="No training records yet"
        columns={[
          { key: 'title', header: 'Title' },
          { key: 'training_type', header: 'Type' },
          { key: 'employee_name', header: 'Employee', cell: (row) => row.employee_name || 'All staff' },
          {
            key: 'completed_at',
            header: 'Completed',
            cell: (row) => (row.completed_at ? String(row.completed_at).slice(0, 10) : '—'),
          },
          {
            key: 'expiry_at',
            header: 'Expiry',
            cell: (row) =>
              row.expiry_at ? (
                <Badge variant="outline">{String(row.expiry_at).slice(0, 10)}</Badge>
              ) : (
                '—'
              ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New training record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. HACCP refresher" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={trainingType} onValueChange={setTrainingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="haccp">HACCP</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee (optional)</Label>
              <Select value={employeeId || 'none'} onValueChange={(v) => setEmployeeId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All staff</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Completed</Label>
                <Input type="date" value={completedAt} onChange={(e) => setCompletedAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input type="date" value={expiryAt} onChange={(e) => setExpiryAt(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
