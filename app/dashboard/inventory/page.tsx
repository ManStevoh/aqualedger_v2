'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { InventoryBatchesPanel } from '@/components/dashboard/inventory-batches-panel'

function InventoryContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') === 'transfers' ? 'transfers' : 'batches'

  return <InventoryBatchesPanel defaultTab={tab} showTransfers />
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Stock levels, batch tracking, and inter-location transfers</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading inventory…</p>}>
        <InventoryContent />
      </Suspense>
    </div>
  )
}
