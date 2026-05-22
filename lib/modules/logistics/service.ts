import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled'

export interface Delivery {
  id: string
  tenant_id: string
  order_id: string | null
  tracking_code: string
  status: DeliveryStatus
  driver_user_id: string | null
  pickup_address: string | null
  delivery_address: string
  scheduled_at: string | null
  delivered_at: string | null
  proof_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateDeliveryInput {
  orderId?: string
  deliveryAddress: string
  pickupAddress?: string
  scheduledAt?: string
  status?: DeliveryStatus
}

function nextTrackingCode(): string {
  const suffix = Date.now().toString(36).toUpperCase()
  return `DLV-${suffix}`
}

export async function listDeliveries(
  tenantId: string,
  page = 1,
  limit = 50,
  status?: DeliveryStatus,
): Promise<{ deliveries: Delivery[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM deliveries ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const deliveries = await query<Delivery>(
    `SELECT * FROM deliveries ${where}
     ORDER BY created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { deliveries, total }
}

export async function createDelivery(
  tenantId: string,
  input: CreateDeliveryInput,
): Promise<Delivery> {
  const id = generateId()
  const trackingCode = nextTrackingCode()

  await execute(
    `INSERT INTO deliveries
     (id, tenant_id, order_id, tracking_code, status, pickup_address, delivery_address, scheduled_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.orderId ?? null,
      trackingCode,
      input.status ?? 'pending',
      input.pickupAddress ?? null,
      input.deliveryAddress,
      input.scheduledAt ?? null,
    ],
  )

  const delivery = await queryOne<Delivery>(
    `SELECT * FROM deliveries WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!delivery) {
    throw new Error('Failed to create delivery')
  }

  await execute(
    `INSERT INTO delivery_events (id, delivery_id, status, location, notes)
     VALUES (?, ?, ?, NULL, ?)`,
    [generateId(), id, delivery.status, 'Delivery created'],
  )

  return delivery
}

export interface DeliveryEvent {
  id: string
  delivery_id: string
  status: string
  location: string | null
  notes: string | null
  created_at: string
}

export async function getDelivery(
  tenantId: string,
  deliveryId: string,
): Promise<Delivery | null> {
  return queryOne<Delivery>(
    `SELECT * FROM deliveries WHERE id = ? AND ${tenantWhere()}`,
    [deliveryId, tenantId],
  )
}

export async function listDeliveryEvents(
  deliveryId: string,
): Promise<DeliveryEvent[]> {
  return query<DeliveryEvent>(
    `SELECT * FROM delivery_events WHERE delivery_id = ? ORDER BY created_at ASC`,
    [deliveryId],
  )
}

export interface ProofUploadInput {
  fileName: string
  mimeType?: string
  dataUrl?: string
}

export interface UpdateDeliveryInput {
  status?: DeliveryStatus
  location?: string
  proofUrl?: string
  proofUpload?: ProofUploadInput
  proofNotes?: string
}

const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir',
  'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos',
  'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Muranga', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia',
  'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi',
]

function extractCountyFromAddress(address: string): string {
  const normalized = address.trim()
  for (const county of KENYA_COUNTIES) {
    if (normalized.toLowerCase().includes(county.toLowerCase())) {
      return county
    }
  }
  const parts = normalized.split(',').map((p) => p.trim()).filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 1] : 'Unassigned'
}

function resolveProofUrl(input: UpdateDeliveryInput): string | null {
  if (input.proofUrl?.trim()) {
    return input.proofUrl.trim()
  }
  if (input.proofUpload?.dataUrl?.trim()) {
    return input.proofUpload.dataUrl.trim()
  }
  if (input.proofUpload?.fileName?.trim()) {
    const safeName = input.proofUpload.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `/uploads/proof/${safeName}`
  }
  return null
}

export interface CountyRouteGroup {
  county: string
  deliveryCount: number
  deliveries: Delivery[]
}

export async function getDeliveriesGroupedByCounty(
  tenantId: string,
  status?: DeliveryStatus,
): Promise<{ groups: CountyRouteGroup[]; totalDeliveries: number }> {
  const { deliveries } = await listDeliveries(tenantId, 1, 500, status)
  const byCounty = new Map<string, Delivery[]>()

  for (const delivery of deliveries) {
    const county = extractCountyFromAddress(delivery.delivery_address)
    const list = byCounty.get(county) ?? []
    list.push(delivery)
    byCounty.set(county, list)
  }

  const groups = [...byCounty.entries()]
    .map(([county, items]) => ({
      county,
      deliveryCount: items.length,
      deliveries: items,
    }))
    .sort((a, b) => b.deliveryCount - a.deliveryCount || a.county.localeCompare(b.county))

  return { groups, totalDeliveries: deliveries.length }
}

export async function updateDeliveryStatus(
  tenantId: string,
  deliveryId: string,
  input: UpdateDeliveryInput,
): Promise<{ delivery: Delivery; events: DeliveryEvent[] }> {
  const existing = await getDelivery(tenantId, deliveryId)
  if (!existing) {
    throw notFound('Delivery not found')
  }

  const status = input.status ?? existing.status
  const proofUrl = resolveProofUrl(input)
  const deliveredAt =
    status === 'delivered' && existing.status !== 'delivered'
      ? new Date().toISOString().slice(0, 19).replace('T', ' ')
      : null

  const notesParts: string[] = []
  if (proofUrl) notesParts.push(`Proof: ${proofUrl}`)
  if (input.proofUpload?.fileName) {
    notesParts.push(`File: ${input.proofUpload.fileName}`)
  }
  if (input.proofNotes?.trim()) {
    notesParts.push(input.proofNotes.trim())
  }

  await execute(
    `UPDATE deliveries
     SET status = ?, proof_url = COALESCE(?, proof_url), delivered_at = COALESCE(?, delivered_at), updated_at = NOW()
     WHERE id = ? AND ${tenantWhere()}`,
    [status, proofUrl, deliveredAt, deliveryId, tenantId],
  )

  const hasChanges =
    status !== existing.status ||
    proofUrl !== null ||
    input.location ||
    input.proofNotes ||
    input.proofUpload

  if (hasChanges) {
    await execute(
      `INSERT INTO delivery_events (id, delivery_id, status, location, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        generateId(),
        deliveryId,
        status,
        input.location ?? null,
        notesParts.length > 0 ? notesParts.join(' | ') : null,
      ],
    )
  }

  const delivery = await getDelivery(tenantId, deliveryId)
  if (!delivery) {
    throw new Error('Failed to update delivery')
  }

  const events = await listDeliveryEvents(deliveryId)
  return { delivery, events }
}
