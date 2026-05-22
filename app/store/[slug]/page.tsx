import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { loadPublicStorefront } from '@/lib/modules/commerce/storefront-public'
import { StorefrontWithSearch } from '@/components/storefront/storefront-with-search'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const store = await loadPublicStorefront(slug)
  if (!store) return { title: 'Store not found' }
  const name = store.settings.store_name || store.settings.tenant_name || 'Seafood Store'
  return {
    title: store.settings.seo_title || `${name} | Fresh Seafood`,
    description: store.settings.seo_description || store.settings.tagline || undefined,
    openGraph: {
      title: store.settings.seo_title || name,
      description: store.settings.seo_description || store.settings.tagline || undefined,
    },
  }
}

export default async function PublicStorePage({ params }: PageProps) {
  const { slug } = await params
  const store = await loadPublicStorefront(slug)
  if (!store) notFound()

  return (
    <StorefrontWithSearch
      initialProducts={store.products}
      settings={store.settings}
      theme={store.theme}
      cssVars={store.cssVars}
      storeBasePath={store.storeBasePath}
      storeSlug={slug}
    />
  )
}
