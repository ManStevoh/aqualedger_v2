'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CreditCard, DollarSign, TrendingDown, AlertCircle, Plus, Filter } from 'lucide-react'
import { authFetchJson, recordExpense } from '@/lib/api'
import { toast } from 'sonner'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  boat: string
  status: 'approved' | 'pending' | 'rejected'
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<{ category: string; amount: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newCategory, setNewCategory] = useState('fuel')
  const [newDescription, setNewDescription] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: {
          expenses: Record<string, unknown>[]
          byCategory?: Record<string, number>
        }
      }>('/api/v2/expenses?limit=200')
      if (data.success && data.data?.expenses) {
        const mapped: Expense[] = data.data.expenses.map((row) => {
          const cat = (row.category as string) || 'other'
          const uiCat = cat === 'crew_wages' ? 'wages' : cat === 'equipment' ? 'other' : cat
          return {
            id: row.id as string,
            category: uiCat,
            description: (row.description as string) || '',
            amount: Number(row.amount) || 0,
            date: String(row.expense_date || '').split('T')[0],
            boat: (row.boat_name as string) || '—',
            status: (row.status as Expense['status']) || 'pending',
          }
        })
        setExpenses(mapped)
        const bc = data.data.byCategory || {}
        setExpensesByCategory(
          Object.entries(bc).map(([category, amount]) => ({
            category,
            amount: Number(amount) || 0,
          })),
        )
      } else {
        setExpenses([])
        setExpensesByCategory([])
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = expenses.filter(exp =>
    exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const approvedExpenses = expenses
    .filter(exp => exp.status === 'approved')
    .reduce((sum, exp) => sum + exp.amount, 0)
  const pendingExpenses = expenses
    .filter(exp => exp.status === 'pending')
    .reduce((sum, exp) => sum + exp.amount, 0)
  const avgExpense = totalExpenses / (expenses.length || 1)

  const categoryChart =
    expensesByCategory.length > 0
      ? expensesByCategory
      : [{ category: 'none', amount: 0 }]

  const handleAddExpense = async () => {
    if (!newDescription.trim() || !newAmount) {
      toast.error('Description and amount are required')
      return
    }
    const amt = Number(newAmount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      const json = await recordExpense({
        category: newCategory,
        description: newDescription.trim(),
        amount: amt,
        date: newDate,
      })
      if (!json.success) {
        toast.error(json.error || 'Could not save expense')
        return
      }
      toast.success('Expense submitted (pending approval)')
      setAddOpen(false)
      setNewDescription('')
      setNewAmount('')
      setNewDate(new Date().toISOString().split('T')[0])
      await fetchExpenses()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Expenses"
      description="Track and manage operational expenses"
      actions={
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      }
    >
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
            <DialogDescription>Creates a pending row in expenses (same as POST /api/v2/expenses).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="wages">Wages</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="licenses">Licenses</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input type="number" min={1} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Expenses"
          value={`KES ${totalExpenses.toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Approved"
          value={`KES ${approvedExpenses.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Pending Review"
          value={`KES ${pendingExpenses.toLocaleString()}`}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg Expense"
          value={`KES ${avgExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of operational costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `KES ${Number(value).toLocaleString()}`} />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Status</CardTitle>
            <CardDescription>Approval workflow overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['approved', 'pending', 'rejected'] as const).map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <StatusBadge status={status} />
                  <span className="text-2xl font-bold">
                    {expenses.filter((e) => e.status === status).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Manage and review expense submissions</CardDescription>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Boat</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{expense.description}</td>
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4 font-semibold">KES {expense.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{expense.boat}</td>
                    <td className="py-3 px-4 text-muted-foreground">{expense.date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        {expense.status === 'pending' ? 'Review' : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
