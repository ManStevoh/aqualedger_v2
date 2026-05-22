'use client'

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
import { Star, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  full_name: string
}

interface PerformanceReview {
  id: string
  employee_id: string
  employee_name?: string
  review_period: string
  rating: number
  status: string
  reviewed_at: string | null
}

export default function HRPerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [reviewPeriod, setReviewPeriod] = useState('')
  const [rating, setRating] = useState('3')
  const [goals, setGoals] = useState('')
  const [feedback, setFeedback] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [empRes, revRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { employees: Employee[] } }>(
          '/api/v2/hr/employees?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { reviews: PerformanceReview[] } }>(
          '/api/v2/hr/performance?limit=100',
        ),
      ])
      if (empRes.success && empRes.data?.employees) setEmployees(empRes.data.employees)
      if (revRes.success && revRes.data?.reviews) setReviews(revRes.data.reviews)
    } catch {
      toast.error('Failed to load performance reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!employeeId || !reviewPeriod || !rating) {
      toast.error('Employee, period, and rating are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/hr/performance',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            reviewPeriod,
            rating: Number(rating),
            goals: goals || undefined,
            feedback: feedback || undefined,
            status: 'submitted',
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not save review')
        return
      }
      toast.success('Performance review saved')
      setDialogOpen(false)
      setEmployeeId('')
      setReviewPeriod('')
      setRating('3')
      setGoals('')
      setFeedback('')
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
      : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance reviews</h1>
          <p className="text-muted-foreground">Employee goals, ratings, and feedback</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          New review
        </Button>
      </div>

      <StatCardGrid>
        <StatCard title="Reviews" value={reviews.length} loading={loading} icon={<Star className="h-4 w-4" />} />
        <StatCard title="Avg rating" value={avgRating} loading={loading} icon={<Star className="h-4 w-4" />} />
        <StatCard
          title="Submitted"
          value={reviews.filter((r) => r.status === 'submitted').length}
          loading={loading}
          icon={<Star className="h-4 w-4" />}
        />
      </StatCardGrid>

      <DataTable
        title="Review history"
        loading={loading}
        data={reviews}
        emptyMessage="No performance reviews yet"
        columns={[
          { key: 'employee_name', header: 'Employee' },
          { key: 'review_period', header: 'Period' },
          {
            key: 'rating',
            header: 'Rating',
            cell: (row) => `${Number(row.rating).toFixed(1)} / 5`,
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <Badge variant="outline">{row.status}</Badge>,
          },
          {
            key: 'reviewed_at',
            header: 'Reviewed',
            cell: (row) => row.reviewed_at?.slice(0, 10) ?? '—',
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New performance review</DialogTitle>
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
              <Label>Review period</Label>
              <Input
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                placeholder="Q1 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Rating (0–5)</Label>
              <Input type="number" min={0} max={5} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Goals</Label>
              <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
