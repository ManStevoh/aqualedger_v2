import Link from 'next/link'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { loadPublicStorefront } from '@/lib/modules/commerce/storefront-public'
import { Shield, Fish, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function TraceabilityPage({ params }: PageProps) {
  const { slug } = await params
  const store = await loadPublicStorefront(slug)
  if (!store) notFound()

  const storeName = store.settings.store_name || store.settings.tenant_name || 'Store'

  return (
    <div
      className="min-h-screen"
      style={{
        ...store.cssVars,
        backgroundColor: 'var(--sf-bg)',
        color: 'var(--sf-text)',
        fontFamily: 'var(--sf-font-body)',
      } as CSSProperties}
    >
      <header className="border-b border-[var(--sf-border)] px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Link
            href={store.storeBasePath}
            className="inline-flex items-center gap-2 text-sm hover:text-[var(--sf-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to {storeName}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-[var(--sf-success)]" aria-hidden />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>
            Catch-to-plate traceability
          </h1>
        </div>
        <p className="mt-4 text-[var(--sf-text-muted)] leading-relaxed">
          Every product sold through {storeName} can be traced from landing site to your door.
          Scan lot codes on packaging or enter them at checkout to view vessel, landing date,
          cold-chain readings, and export certificates where applicable.
        </p>
        <ul className="mt-8 space-y-4">
          <li className="flex gap-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-surface)] p-4">
            <Fish className="h-6 w-6 shrink-0 text-[var(--sf-primary)]" aria-hidden />
            <div>
              <p className="font-semibold">EU fisheries compliance</p>
              <p className="text-sm text-[var(--sf-text-muted)]">Lot codes linked to trip and catch records in AquaERP.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-surface)] p-4">
            <Shield className="h-6 w-6 shrink-0 text-[var(--sf-primary)]" aria-hidden />
            <div>
              <p className="font-semibold">HACCP & cold chain</p>
              <p className="text-sm text-[var(--sf-text-muted)]">Temperature logs from storage through delivery.</p>
            </div>
          </li>
        </ul>
      </main>
    </div>
  )
}
