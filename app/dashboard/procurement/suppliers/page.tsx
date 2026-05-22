'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Truck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RatingHistoryEntry {
  rating: number
  recordedAt: string
  note?: string
}

interface Supplier {
  id: string
  code: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  country_code: string
  rating: number
  status: string
  created_at?: string
  ratingHistory?: RatingHistoryEntry[]
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('active')
  const [ratingEditId, setRatingEditId] = useState<string | null>(null)
  const [ratingValue, setRatingValue] = useState('3')
  const [savingRating, setSavingRating] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [minRating, setMinRating] = useState('')
  const [scorecardId, setScorecardId] = useState<string | null>(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())
      if (minRating) params.set('minRating', minRating)
      const res = await fetch(`/api/v2/procurement/suppliers?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success && data.data?.suppliers) {
        setSuppliers(data.data.suppliers)
      } else {
        setSuppliers([])
      }
    } catch {
      setSuppliers([])
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, minRating])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const scorecardSupplier = suppliers.find((s) => s.id === scorecardId)

  const handleCreate = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error('Code and name are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/v2/procurement/suppliers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          contactName: contactName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          status,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to create supplier')
        return
      }
      toast.success('Supplier created')
      setShowDialog(false)
      setCode('')
      setName('')
      setContactName('')
      setEmail('')
      setPhone('')
      setStatus('active')
      await fetchSuppliers()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveRating = async () => {
    if (!ratingEditId) return
    setSavingRating(true)
    try {
      const res = await fetch('/api/v2/procurement/suppliers', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: ratingEditId,
          rating: parseFloat(ratingValue),
        }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to update rating')
        return
      }
      toast.success('Supplier rating updated')
      setRatingEditId(null)
      await fetchSuppliers()
    } catch {
      toast.error('Network error')
    } finally {
      setSavingRating(false)
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'active') return 'default'
    if (s === 'blocked') return 'destructive'
    return 'secondary'
  }

  return (
    <DashboardPageLayout
      title="Suppliers"
      description="Manage procurement suppliers and vendors"
    >
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search name, code, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          min="0"
          max="5"
          step="0.5"
          className="w-28"
          placeholder="Min rating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        />
        <Button variant="outline" onClick={fetchSuppliers}>Apply</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Supplier Directory
          </CardTitle>
          <CardDescription>
            {loading ? 'Loading…' : `${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading suppliers…
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No suppliers yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first supplier to start procurement
              </p>
              <Button className="mt-4 gap-2" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Scorecard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.code}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.contact_name || '—'}</TableCell>
                    <TableCell>{s.email || '—'}</TableCell>
                    <TableCell>{s.phone || '—'}</TableCell>
                    <TableCell>{s.country_code}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => {
                          setRatingEditId(s.id)
                          setRatingValue(String(s.rating))
                        }}
                      >
                        {Number(s.rating).toFixed(1)} ★
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScorecardId(s.id)}
                      >
                        {(s.ratingHistory?.length ?? 0)} entries
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(s.status)}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!scorecardId} onOpenChange={(open) => !open && setScorecardId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supplier scorecard</DialogTitle>
            <DialogDescription>
              {scorecardSupplier?.name} — rating history
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-64 overflow-auto">
            {(scorecardSupplier?.ratingHistory?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No rating history yet. Update rating to record entries.</p>
            ) : (
              scorecardSupplier?.ratingHistory?.map((h, i) => (
                <div key={i} className="flex justify-between text-sm border-b pb-2">
                  <span>{Number(h.rating).toFixed(1)} ★</span>
                  <span className="text-muted-foreground">
                    {new Date(h.recordedAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScorecardId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!ratingEditId} onOpenChange={(open) => !open && setRatingEditId(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit supplier rating</DialogTitle>
            <DialogDescription>Score from 0 to 5 for supplier scorecards</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Rating (0–5)</Label>
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={ratingValue}
              onChange={(e) => setRatingValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingEditId(null)}>Cancel</Button>
            <Button onClick={handleSaveRating} disabled={savingRating}>
              {savingRating ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>Register a new vendor for procurement</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUP-001" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
