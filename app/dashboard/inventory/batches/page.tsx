'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { InventoryBatchesPanel } from '@/components/dashboard/inventory-batches-panel'

export default function InventoryBatchesPage() {
  return (
    <DashboardPageLayout
      title="Batch ledger"
      description="Detailed view of inventory_batches"
    >
            <InventoryBatchesPanel
        title="All batches"
        description="Same tenant-scoped batch data as inventory overview"
        showStats={false}
      />
    </DashboardPageLayout>
  )
}
