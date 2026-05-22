'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Package, Plus, Warehouse, AlertTriangle, ArrowRightLeft, Truck } from 'lucide-react'
import { ExportCsvButton } from '@/components/dashboard/export-csv-button'
import { toast } from 'sonner'

interface InventoryBatch {
  id: string
  sku: string
  product_name: string
  batch_code: string
  quantity_kg: number
  reserved_kg: number
  storage_type: string
  expiry_date: string | null
  status: string
  species_name?: string | null
}

interface InventorySummary {
  total_batches: number
  total_quantity_kg: number
  total_reserved_kg: number
  available_batches: number
}

interface InventoryMovement {
  id: string
  batch_id: string | null
  movement_type: string
  quantity_kg: number
  from_location: string | null
  to_location: string | null
  lot_code: string | null
  created_at: string
}

interface StockTransfer {
  id: string
  transfer_number: string
  from_location: string
  to_location: string
  batch_id: string | null
  batch_code?: string | null
  quantity_kg: number
  status: string
  created_at: string
}

interface InventoryBatchesPanelProps {
  title?: string
  description?: string
  showStats?: boolean
  showMovements?: boolean
  showTransfers?: boolean
  defaultTab?: string
}

function isExpiringSoon(expiryDate: string | null, withinDays = 7) {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + withinDays)
  return expiry <= threshold
}

export function InventoryBatchesPanel({
  title = 'Inventory batches',
  description = 'Tenant-scoped stock batches (FEFO: earliest expiry first)',
  showStats = true,
  showMovements = true,
  showTransfers = false,
  defaultTab = 'batches',
}: InventoryBatchesPanelProps) {
  const [batches, setBatches] = useState<InventoryBatch[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [summary, setSummary] = useState<InventorySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sku, setSku] = useState('')
  const [productName, setProductName] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [quantityKg, setQuantityKg] = useState('')
  const [storageType, setStorageType] = useState('fresh')
  const [expiryDate, setExpiryDate] = useState('')
  const [movBatchId, setMovBatchId] = useState('')
  const [movType, setMovType] = useState('in')
  const [movQty, setMovQty] = useState('')
  const [movNotes, setMovNotes] = useState('')
  const [showMovDialog, setShowMovDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [xferFrom, setXferFrom] = useState('')
  const [xferTo, setXferTo] = useState('')
  const [xferBatchId, setXferBatchId] = useState('')
  const [xferQty, setXferQty] = useState('')

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const expiringBatches = batches.filter(
    (b) => b.status === 'available' && isExpiringSoon(b.expiry_date),
  )

  const fetchMovements = useCallback(async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { movements: InventoryMovement[] }
      }>('/api/v2/inventory/movements?limit=50')
      if (data.success && data.data?.movements) {
        setMovements(data.data.movements)
      }
    } catch {
      setMovements([])
    }
  }, [])

  const fetchTransfers = useCallback(async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { transfers: StockTransfer[] }
      }>('/api/v2/inventory/transfers?limit=50')
      if (data.success && data.data?.transfers) {
        setTransfers(data.data.transfers)
      }
    } catch {
      setTransfers([])
    }
  }, [])

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { batches: InventoryBatch[]; summary: InventorySummary }
      }>('/api/v2/inventory?limit=100')
      if (data.success && data.data) {
        setBatches(data.data.batches)
        setSummary(data.data.summary)
      } else {
        setBatches([])
        setSummary(null)
      }
    } catch {
      setBatches([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBatches()
    if (showMovements) fetchMovements()
    if (showTransfers) fetchTransfers()
  }, [fetchBatches, fetchMovements, fetchTransfers, showMovements, showTransfers])

  const handleCreateTransfer = async () => {
    if (!xferFrom.trim() || !xferTo.trim() || !xferQty) {
      toast.error('From, to, and quantity are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/inventory/transfers',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromLocation: xferFrom.trim(),
            toLocation: xferTo.trim(),
            batchId: xferBatchId || null,
            quantityKg: Number(xferQty),
            status: 'draft',
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to create transfer')
        return
      }
      toast.success('Transfer created')
      setShowTransferDialog(false)
      setXferFrom('')
      setXferTo('')
      setXferBatchId('')
      setXferQty('')
      await fetchTransfers()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTransferStatus = async (id: string, status: string) => {
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/inventory/transfers',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to update transfer')
        return
      }
      toast.success(`Transfer marked ${status.replace('_', ' ')}`)
      await fetchTransfers()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecordMovement = async () => {
    if (!movQty) {
      toast.error('Quantity is required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/inventory/movements',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: movBatchId || null,
            movementType: movType,
            quantityKg: Number(movQty),
            notes: movNotes.trim() || null,
          }),
        },
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to record movement')
        return
      }
      toast.success('Movement recorded')
      setShowMovDialog(false)
      await fetchMovements()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreate = async () => {
    if (!sku.trim() || !productName.trim() || !batchCode.trim() || !quantityKg) {
      toast.error('SKU, product name, batch code, and quantity are required')
      return
    }
    setSubmitting(true)
    try {
      const result = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: sku.trim(),
          productName: productName.trim(),
          batchCode: batchCode.trim(),
          quantityKg: Number(quantityKg),
          storageType,
          expiryDate: expiryDate || null,
        }),
      })
      if (!result.success) {
        toast.error(result.error || 'Failed to create batch')
        return
      }
      toast.success('Inventory batch created')
      setShowDialog(false)
      setSku('')
      setProductName('')
      setBatchCode('')
      setQuantityKg('')
      setExpiryDate('')
      await fetchBatches()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const statusVariant = (status: string) => {
    if (status === 'available') return 'default'
    if (status === 'reserved') return 'secondary'
    if (status === 'spoiled') return 'destructive'
    return 'outline'
  }

  return (
    <div className="space-y-6">
      {showStats && (
        <StatCardGrid>
          <StatCard
            title="Total batches"
            value={summary?.total_batches ?? 0}
            loading={loading}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="On hand (kg)"
            value={Number(summary?.total_quantity_kg ?? 0).toLocaleString()}
            loading={loading}
            icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Reserved (kg)"
            value={Number(summary?.total_reserved_kg ?? 0).toLocaleString()}
            loading={loading}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Available batches"
            value={summary?.available_batches ?? 0}
            loading={loading}
            icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          />
        </StatCardGrid>
      )}

      {expiringBatches.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>FEFO expiry alert</AlertTitle>
          <AlertDescription>
            {expiringBatches.length} batch{expiringBatches.length !== 1 ? 'es' : ''} expiring within 7 days:{' '}
            {expiringBatches.map((b) => b.batch_code).join(', ')}. Pick earliest expiry first.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          {showMovements && <TabsTrigger value="movements">Movements</TabsTrigger>}
          {showTransfers && <TabsTrigger value="transfers">Transfers</TabsTrigger>}
        </TabsList>

        <TabsContent value="batches" className="mt-4">
          <DataTable
            title={title}
            description={description}
            loading={loading}
            data={batches}
            emptyMessage="No inventory batches yet"
            actions={
              <Button className="gap-2" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4" />
                New batch
              </Button>
            }
            columns={[
              { key: 'batch_code', header: 'Batch' },
              { key: 'sku', header: 'SKU' },
              { key: 'product_name', header: 'Product' },
              {
                key: 'species_name',
                header: 'Species',
                cell: (row) => row.species_name || '—',
              },
              {
                key: 'quantity_kg',
                header: 'Qty (kg)',
                cell: (row) => Number(row.quantity_kg).toLocaleString(),
              },
              {
                key: 'reserved_kg',
                header: 'Reserved',
                cell: (row) => Number(row.reserved_kg).toLocaleString(),
              },
              {
                key: 'storage_type',
                header: 'Storage',
                cell: (row) => <Badge variant="outline">{row.storage_type}</Badge>,
              },
              {
                key: 'expiry_date',
                header: 'Expiry (FEFO)',
                cell: (row) => {
                  const exp = row.expiry_date?.split('T')[0] || '—'
                  const warn = isExpiringSoon(row.expiry_date)
                  return warn ? (
                    <span className="font-medium text-destructive">{exp}</span>
                  ) : (
                    exp
                  )
                },
              },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => (
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                ),
              },
            ]}
          />
        </TabsContent>

        {showMovements && (
          <TabsContent value="movements" className="mt-4">
            <DataTable
              title="Stock movements"
              description="Immutable inventory movement ledger"
              loading={loading}
              data={movements}
              emptyMessage="No movements recorded yet"
              actions={
                <Button className="gap-2" onClick={() => setShowMovDialog(true)}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Record movement
                </Button>
              }
              columns={[
                {
                  key: 'created_at',
                  header: 'When',
                  cell: (row) => new Date(row.created_at).toLocaleString(),
                },
                { key: 'movement_type', header: 'Type' },
                {
                  key: 'quantity_kg',
                  header: 'Qty (kg)',
                  cell: (row) => Number(row.quantity_kg).toLocaleString(),
                },
                {
                  key: 'batch_id',
                  header: 'Batch',
                  cell: (row) => row.batch_id?.slice(0, 8) || '—',
                },
                {
                  key: 'lot_code',
                  header: 'Lot',
                  cell: (row) => row.lot_code || '—',
                },
              ]}
            />
          </TabsContent>
        )}

        {showTransfers && (
          <TabsContent value="transfers" className="mt-4">
            <DataTable
              title="Stock transfers"
              description="Inter-location stock movements from `stock_transfers`"
              loading={loading}
              data={transfers}
              emptyMessage="No transfers yet"
              actions={
                <div className="flex gap-2">
                  <ExportCsvButton
                    data={transfers.map((t) => ({
                      transfer_number: t.transfer_number,
                      from_location: t.from_location,
                      to_location: t.to_location,
                      quantity_kg: t.quantity_kg,
                      status: t.status,
                    }))}
                    filename="stock-transfers"
                    columns={[
                      { key: 'transfer_number', label: 'Transfer #' },
                      { key: 'from_location', label: 'From' },
                      { key: 'to_location', label: 'To' },
                      { key: 'quantity_kg', label: 'Qty (kg)' },
                      { key: 'status', label: 'Status' },
                    ]}
                  />
                  <Button className="gap-2" onClick={() => setShowTransferDialog(true)}>
                    <Truck className="h-4 w-4" />
                    New transfer
                  </Button>
                </div>
              }
              columns={[
                { key: 'transfer_number', header: 'Transfer #' },
                { key: 'from_location', header: 'From' },
                { key: 'to_location', header: 'To' },
                {
                  key: 'batch_code',
                  header: 'Batch',
                  cell: (row) => row.batch_code || '—',
                },
                {
                  key: 'quantity_kg',
                  header: 'Qty (kg)',
                  cell: (row) => Number(row.quantity_kg).toLocaleString(),
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (row) => <Badge variant="outline">{row.status.replace('_', ' ')}</Badge>,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  cell: (row) => (
                    <div className="flex gap-1">
                      {row.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={submitting}
                          onClick={() => handleUpdateTransferStatus(row.id, 'in_transit')}
                        >
                          Ship
                        </Button>
                      )}
                      {row.status === 'in_transit' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={submitting}
                          onClick={() => handleUpdateTransferStatus(row.id, 'received')}
                        >
                          Receive
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create stock transfer</DialogTitle>
            <DialogDescription>Move stock between locations</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>From location</Label>
                <Input value={xferFrom} onChange={(e) => setXferFrom(e.target.value)} placeholder="Cold store A" />
              </div>
              <div className="space-y-2">
                <Label>To location</Label>
                <Input value={xferTo} onChange={(e) => setXferTo(e.target.value)} placeholder="Market hub" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Batch (optional)</Label>
              <Select value={xferBatchId} onValueChange={setXferBatchId}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batch_code} — {b.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity (kg)</Label>
              <Input type="number" value={xferQty} onChange={(e) => setXferQty(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTransfer} disabled={submitting}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMovDialog} onOpenChange={setShowMovDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record stock movement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Batch (optional)</Label>
              <Select value={movBatchId} onValueChange={setMovBatchId}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batch_code} — {b.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Movement type</Label>
              <Select value={movType} onValueChange={setMovType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">In</SelectItem>
                  <SelectItem value="out">Out</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="spoilage">Spoilage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity (kg)</Label>
              <Input type="number" value={movQty} onChange={(e) => setMovQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={movNotes} onChange={(e) => setMovNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovDialog(false)}>Cancel</Button>
            <Button onClick={handleRecordMovement} disabled={submitting}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create inventory batch</DialogTitle>
            <DialogDescription>Register a new batch in inventory_batches</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="FSH-TIL-001" />
              </div>
              <div className="space-y-2">
                <Label>Batch code</Label>
                <Input value={batchCode} onChange={(e) => setBatchCode(e.target.value)} placeholder="B-2026-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product name</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity (kg)</Label>
                <Input type="number" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Storage type</Label>
                <Select value={storageType} onValueChange={setStorageType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh">Fresh</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="dried">Dried</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expiry date (optional)</Label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
