import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import {
  resolveTenantIdBySlug,
  getGuestCartView,
  addGuestCartItem,
  removeGuestCartItem,
} from '@/lib/modules/commerce/guest-cart'

function sessionFromRequest(request: NextRequest): string {
  const header = request.headers.get('x-guest-session')
  const cookie = request.cookies.get('guest_session')?.value
  return header || cookie || ''
}

function ensureSession(token: string): string {
  if (token && token.length >= 16) return token
  return crypto.randomUUID()
}

const addSchema = z.object({
  productId: z.string().uuid(),
  quantityKg: z.number().positive().default(1),
  sessionToken: z.string().optional(),
})

const removeSchema = z.object({
  itemId: z.string().uuid(),
  sessionToken: z.string().optional(),
})

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const session = ensureSession(sessionFromRequest(request))
  const cart = await getGuestCartView(tenantId, session)
  const res = jsonOk({ cart, sessionToken: session })
  res.cookies.set('guest_session', session, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}, 'public/store/cart')

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const body = addSchema.parse(await request.json())
  const session = ensureSession(body.sessionToken || sessionFromRequest(request))
  const cart = await addGuestCartItem(tenantId, session, body.productId, body.quantityKg)
  const res = jsonOk({ cart, sessionToken: session })
  res.cookies.set('guest_session', session, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}, 'public/store/cart')

export const DELETE = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const { searchParams } = new URL(request.url)
  const body = removeSchema.parse({
    itemId: searchParams.get('itemId'),
    sessionToken: searchParams.get('sessionToken') || undefined,
  })
  const session = ensureSession(body.sessionToken || sessionFromRequest(request))
  const cart = await removeGuestCartItem(tenantId, session, body.itemId)
  return jsonOk({ cart, sessionToken: session })
}, 'public/store/cart')
