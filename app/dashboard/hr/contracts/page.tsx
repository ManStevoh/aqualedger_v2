'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatCard } from '@/components/dashboard/stat-card'
import { FileText, UserPlus, Briefcase, Calendar } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { urlInputPlaceholder } from '@/lib/config/urls'
import { toast } from 'sonner'

interface Contract {
  id: string
  employee_id: string
  employee_name?: string
  employee_number?: string
  contract_type: string
  start_date: string
  end_date: string | null
  salary: number | null
  document_url: string | null
}

interface Employee {
  id: string
  full_name: string
  employee_number: string
}

export default function HRContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [contractType, setContractType] = useState('permanent')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [salary, setSalary] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [contractsRes, employeesRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { contracts: Contract[] } }>(
          '/api/v2/hr/contracts?limit=100',
        ),
        authFetchJson<{ success: boolean; data?: { employees: Employee[] } }>(
          '/api/v2/hr/employees?limit=200',
        ),
      ])
      if (contractsRes.success && contractsRes.data?.contracts) {
        setContracts(contractsRes.data.contracts)
      }
      if (employeesRes.success && employeesRes.data?.employees) {
        setEmployees(employeesRes.data.employees)
      }
    } catch {
      toast.error('Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!employeeId || !startDate) {
      toast.error('Employee and start date are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/hr/contracts',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            contractType,
            startDate,
            endDate: endDate || undefined,
            salary: salary ? Number(salary) : undefined,
            documentUrl: documentUrl.trim() || undefined,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Could not create contract')
        return
      }
      toast.success('Contract created')
      setAddOpen(false)
      setEmployeeId('')
      setContractType('permanent')
      setStartDate('')
      setEndDate('')
      setSalary('')
      setDocumentUrl('')
      await fetchData()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const permanent = contracts.filter((c) => c.contract_type === 'permanent').length
  const expiringSoon = contracts.filter((c) => {
    if (!c.end_date) return false
    const end = new Date(c.end_date)
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + 60)
    return end <= threshold
  }).length

  const typeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'bg-green-100 text-green-800'
      case 'contract': return 'bg-blue-100 text-blue-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employment Contracts</h1>
          <p className="text-muted-foreground">Track contract terms and documents</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4" />
          New Contract
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Contracts" value={contracts.length} icon={<FileText className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Permanent" value={permanent} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Expiring (60d)" value={expiringSoon} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Fixed-term" value={contracts.length - permanent} icon={<FileText className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>All employment agreements for this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Start</th>
                  <th className="text-left py-3 px-4 font-medium">End</th>
                  <th className="text-left py-3 px-4 font-medium">Salary</th>
                  <th className="text-left py-3 px-4 font-medium">Document</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.employee_name}</div>
                      <div className="text-xs text-muted-foreground">{c.employee_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={typeColor(c.contract_type)}>{c.contract_type}</Badge>
                    </td>
                    <td className="py-3 px-4">{c.start_date}</td>
                    <td className="py-3 px-4">{c.end_date || '—'}</td>
                    <td className="py-3 px-4">
                      {c.salary != null ? `KES ${Number(c.salary).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {c.document_url ? (
                        <a href={c.document_url} className="text-primary underline text-xs" target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {contracts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No contracts yet
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
            <DialogTitle>New contract</DialogTitle>
            <DialogDescription>Link a contract to an existing employee record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name} ({e.employee_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contract type</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="contract">Fixed-term</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
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
              <Label>Salary (KES)</Label>
              <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Document URL</Label>
              <Input value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder={urlInputPlaceholder('https')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
