'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { authFetchJson } from '@/lib/api'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type DocType =
  | 'certificate_of_origin'
  | 'health_certificate'
  | 'catch_certificate'
  | 'customs_declaration'
  | 'invoice'

interface ExportDocument {
  id: string
  doc_type: DocType
  doc_number: string
  lot_code: string | null
  destination_country: string | null
  hs_code: string | null
  issuing_authority: string | null
  status: string
  issued_at: string | null
  created_at: string
  payload: Record<string, unknown> | null
}

const DOC_LABELS: Record<DocType, string> = {
  certificate_of_origin: 'Certificate of Origin',
  health_certificate: 'Health Certificate',
  catch_certificate: 'Catch Certificate (EU)',
  customs_declaration: 'Customs Declaration',
  invoice: 'Commercial Invoice',
}

const defaultForm = {
  docType: 'certificate_of_origin' as DocType,
  docNumber: '',
  lotCode: '',
  destinationCountry: '',
  hsCode: '',
  issuingAuthority: '',
  vesselName: '',
  species: '',
  quantityKg: '',
  notes: '',
}

export default function ExportDocumentsPage() {
  const [documents, setDocuments] = useState<ExportDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DocType | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...defaultForm })

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (activeTab !== 'all') params.set('docType', activeTab)
      const res = await authFetchJson<{
        success: boolean
        data?: { documents: ExportDocument[] }
      }>(`/api/v2/export/documents?${params}`)
      setDocuments(res.success && res.data?.documents ? res.data.documents : [])
    } catch {
      setDocuments([])
      toast.error('Failed to load export documents')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const openCreate = (docType?: DocType) => {
    setForm({
      ...defaultForm,
      docType: docType || 'certificate_of_origin',
      docNumber: `${(docType || 'CO').slice(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    })
    setDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!form.docNumber.trim()) {
      toast.error('Document number is required')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, string> = {}
      if (form.vesselName) payload.vesselName = form.vesselName
      if (form.species) payload.species = form.species
      if (form.quantityKg) payload.quantityKg = form.quantityKg
      if (form.notes) payload.notes = form.notes

      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/export/documents',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: form.docType,
            docNumber: form.docNumber.trim(),
            lotCode: form.lotCode.trim() || undefined,
            destinationCountry: form.destinationCountry.trim() || undefined,
            hsCode: form.hsCode.trim() || undefined,
            issuingAuthority: form.issuingAuthority.trim() || undefined,
            status: 'draft',
            payload: Object.keys(payload).length ? payload : undefined,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not create document')
        return
      }
      toast.success('Export document created')
      setDialogOpen(false)
      fetchDocuments()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/export/documents?id=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not delete')
        return
      }
      toast.success('Document removed')
      fetchDocuments()
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <DashboardPageLayout
      title="Export compliance documents"
      description="EU seafood export: certificate of origin, health certificate, and catch certificate (IUU)."
      actions={
        <Button className="gap-2" onClick={() => openCreate()}>
          <Plus className="h-4 w-4" />
          New document
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocType | 'all')}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="certificate_of_origin">CO</TabsTrigger>
          <TabsTrigger value="health_certificate">Health</TabsTrigger>
          <TabsTrigger value="catch_certificate">Catch cert</TabsTrigger>
          <TabsTrigger value="customs_declaration">Customs</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {(['certificate_of_origin', 'health_certificate', 'catch_certificate'] as DocType[]).map(
              (t) => (
                <Card key={t} className="cursor-pointer hover:border-primary/50" onClick={() => openCreate(t)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{DOC_LABELS[t]}</CardTitle>
                    <CardDescription>Quick-create draft</CardDescription>
                  </CardHeader>
                </Card>
              ),
            )}
          </div>

          <DataTable
            title="Documents"
            loading={loading}
            data={documents}
            emptyMessage="No export documents yet"
            columns={[
              {
                key: 'doc_type',
                header: 'Type',
                cell: (row) => DOC_LABELS[row.doc_type] || row.doc_type,
              },
              { key: 'doc_number', header: 'Number' },
              { key: 'lot_code', header: 'Lot', cell: (row) => row.lot_code || '—' },
              {
                key: 'destination_country',
                header: 'Dest.',
                cell: (row) => row.destination_country || '—',
              },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => (
                  <StatusBadge status={row.status} />
                ),
              },
              {
                key: 'created_at',
                header: 'Created',
                cell: (row) => new Date(row.created_at).toLocaleDateString(),
              },
              {
                key: 'actions',
                header: '',
                cell: (row) => (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ),
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create {DOC_LABELS[form.docType]}</DialogTitle>
            <DialogDescription>
              Draft document for EU / international seafood export compliance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Document type</Label>
              <Select
                value={form.docType}
                onValueChange={(v) => setForm((f) => ({ ...f, docType: v as DocType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DOC_LABELS) as DocType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {DOC_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Document number</Label>
                <Input
                  value={form.docNumber}
                  onChange={(e) => setForm((f) => ({ ...f, docNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Lot code</Label>
                <Input
                  value={form.lotCode}
                  onChange={(e) => setForm((f) => ({ ...f, lotCode: e.target.value }))}
                  placeholder="TRACE-LOT-…"
                />
              </div>
              <div className="space-y-2">
                <Label>Destination (ISO-2)</Label>
                <Input
                  value={form.destinationCountry}
                  onChange={(e) => setForm((f) => ({ ...f, destinationCountry: e.target.value }))}
                  placeholder="EU"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>HS code</Label>
                <Input
                  value={form.hsCode}
                  onChange={(e) => setForm((f) => ({ ...f, hsCode: e.target.value }))}
                  placeholder="0302.11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Issuing authority</Label>
              <Input
                value={form.issuingAuthority}
                onChange={(e) => setForm((f) => ({ ...f, issuingAuthority: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vessel</Label>
                <Input
                  value={form.vesselName}
                  onChange={(e) => setForm((f) => ({ ...f, vesselName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Species</Label>
                <Input
                  value={form.species}
                  onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity (kg)</Label>
                <Input
                  type="number"
                  value={form.quantityKg}
                  onChange={(e) => setForm((f) => ({ ...f, quantityKg: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
