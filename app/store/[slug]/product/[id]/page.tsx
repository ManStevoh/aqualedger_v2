import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { loadPublicStorefront } from '@/lib/modules/commerce/storefront-public'
import { getPublicProductById } from '@/lib/modules/commerce/storefront-catalog'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { ProductDetailActions } from '@/components/storefront/product-detail-actions'
import { ProductReviews } from '@/components/storefront/product-reviews'
import { ArrowLeft, Shield, Fish } from 'lucide-react'
import type { CSSProperties } from 'react'

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, id } = await params
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) return { title: 'Product' }
  try {
    const product = await getPublicProductById(tenantId, id)
    return { title: `${product.name} | ${slug}` }
  } catch {
    return { title: 'Product not found' }
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug, id } = await params
  const store = await loadPublicStorefront(slug)
  if (!store) notFound()

  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) notFound()

  const product = await getPublicProductById(tenantId, id)
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
        <div className="mx-auto max-w-4xl">
          <Link
            href={store.storeBasePath}
            className="inline-flex items-center gap-2 text-sm hover:text-[var(--sf-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to {storeName}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-[var(--sf-radius)] bg-[var(--sf-surface-alt)] overflow-hidden flex items-center justify-center border border-[var(--sf-border)] relative shadow-sm">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-tr from-[var(--sf-surface-alt)] to-[var(--sf-surface)]">
                <Fish className="h-24 w-24 text-[var(--sf-text-muted)] opacity-30" aria-hidden />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.grade && (
                <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--sf-surface-alt)]">
                  Grade {product.grade}
                </span>
              )}
              {store.settings.show_traceability && product.traceable && (
                <span className="text-xs flex items-center gap-1 text-[var(--sf-success)]">
                  <Shield className="h-3.5 w-3.5" /> Traceable lot
                </span>
              )}
              {product.category && (
                <span className="text-xs text-[var(--sf-text-muted)]">{product.category}</span>
              )}
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>
              {product.name}
            </h1>
            {product.sku && (
              <p className="mt-1 text-sm text-[var(--sf-text-muted)] font-mono">SKU {product.sku}</p>
            )}
            <p className="mt-4 text-2xl font-bold text-[var(--sf-primary)]">
              KES {product.price.toLocaleString()}
              <span className="text-base font-normal text-[var(--sf-text-muted)]"> /{product.unit || 'kg'}</span>
            </p>
            {product.description && (
              <p className="mt-4 text-[var(--sf-text-muted)] leading-relaxed">{product.description}</p>
            )}
            {product.lotCode && store.settings.show_traceability && (
              <p className="mt-3 text-sm">
                Lot: <span className="font-mono">{product.lotCode}</span>
                {' · '}
                <Link href={`${store.storeBasePath}/traceability`} className="text-[var(--sf-primary)] hover:underline">
                  Verify chain
                </Link>
              </p>
            )}
            <ProductDetailActions
              storeSlug={slug}
              productId={product.id}
              productName={product.name}
            />
          </div>
        </div>
        {store.settings.show_reviews && (
          <ProductReviews storeSlug={slug} productId={product.id} />
        )}
      </main>
    </div>
  )
}
