'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { InventoryBatchesPanel } from '@/components/dashboard/inventory-batches-panel'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'

function InventoryContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') === 'transfers' ? 'transfers' : 'batches'

  return <InventoryBatchesPanel defaultTab={tab} showTransfers />
}

export default function InventoryPage() {
  const meta = useDashboardPageMeta({
    title: 'Inventory',
    description: 'Stock levels, batch tracking, and inter-location transfers',
  })

  return (
    <DashboardPageLayout
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
      >
<Suspense fallback={<p className="text-sm text-muted-foreground">Loading inventory…</p>}>
        <InventoryContent />
      </Suspense>
    </DashboardPageLayout>
  )
}

