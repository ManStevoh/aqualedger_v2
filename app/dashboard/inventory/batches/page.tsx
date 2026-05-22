'use client'

import { InventoryBatchesPanel } from '@/components/dashboard/inventory-batches-panel'

export default function InventoryBatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch ledger</h1>
        <p className="text-muted-foreground">Detailed view of inventory_batches</p>
      </div>
      <InventoryBatchesPanel
        title="All batches"
        description="Same tenant-scoped batch data as inventory overview"
        showStats={false}
      />
    </div>
  )
}
