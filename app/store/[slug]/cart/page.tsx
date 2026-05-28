import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { loadPublicStorefront } from '@/lib/modules/commerce/storefront-public'
import { getGuestCartView, resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { StorefrontCart } from '@/components/storefront/storefront-cart'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicStoreCartPage({ params }: PageProps) {
  const { slug } = await params
  const store = await loadPublicStorefront(slug)
  if (!store) notFound()

  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) notFound()

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('guest_session')?.value || ''
  
  const cartView = await getGuestCartView(tenantId, sessionToken)

  return (
    <StorefrontCart
      settings={store.settings}
      theme={store.theme}
      cssVars={store.cssVars}
      storeBasePath={store.storeBasePath}
      storeSlug={slug}
      initialCartItems={cartView.items}
      initialSubtotal={cartView.subtotal}
    />
  )
}
