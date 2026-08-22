import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface AuctionBid {
  id: string
  tenant_id: string
  auction_id: string
  bidder_name: string
  bidder_phone: string | null
  bid_amount: number
  is_winning: number
  created_at: string
}

export interface PlaceBidInput {
  bidderName: string
  bidderPhone?: string
  bidAmount: number
}

export async function listBids(
  tenantId: string,
  auctionId: string,
  page = 1,
  limit = 50,
): Promise<{ bids: AuctionBid[]; total: number }> {
  const auction = await queryOne<{ id: string }>(
    `SELECT id FROM fish_auctions WHERE id = ? AND ${tenantWhere()}`,
    [auctionId, tenantId],
  )
  if (!auction) throw new Error('Auction not found')

  const pagination = buildPagination(page, limit)

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM auction_bids WHERE auction_id = ? AND ${tenantWhere()}`,
    [auctionId, tenantId],
  )
  const total = countRow?.total ?? 0

  const bids = await query<AuctionBid>(
    `SELECT * FROM auction_bids
     WHERE auction_id = ? AND ${tenantWhere()}
     ORDER BY bid_amount DESC, created_at DESC
     ${pagination.clause}`,
    [auctionId, tenantId],
  )

  return { bids, total }
}

export async function placeBid(
  tenantId: string,
  auctionId: string,
  input: PlaceBidInput,
): Promise<{ bid: AuctionBid; auctionUpdated: boolean }> {
  const auction = await queryOne<{
    id: string
    tenant_id: string
    status: string
    starting_price: number
    winning_price: number | null
    species_name: string
    lot_code: string | null
  }>(
    `SELECT id, tenant_id, status, starting_price, winning_price, species_name, lot_code FROM fish_auctions
     WHERE id = ?`,
    [auctionId],
  )
  if (!auction) throw new Error('Auction not found')
  if (auction.status === 'closed' || auction.status === 'cancelled') {
    throw new Error('Auction is not accepting bids')
  }

  const currentHigh = await queryOne<{ max_bid: number | null }>(
    `SELECT MAX(bid_amount) as max_bid FROM auction_bids WHERE auction_id = ?`,
    [auctionId],
  )
  const minBid = Math.max(
    Number(auction.winning_price ?? 0),
    Number(currentHigh?.max_bid ?? 0),
    Number(auction.starting_price),
  )
  if (input.bidAmount <= minBid) {
    throw new Error(`Bid must exceed current high of KES ${minBid.toLocaleString()}`)
  }

  const id = generateId()
  await execute(
    `INSERT INTO auction_bids
     (id, tenant_id, auction_id, bidder_name, bidder_phone, bid_amount, is_winning)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      id,
      tenantId,
      auctionId,
      input.bidderName,
      input.bidderPhone ?? null,
      input.bidAmount,
    ],
  )

  await execute(
    `UPDATE auction_bids SET is_winning = 0 WHERE auction_id = ? AND id != ?`,
    [auctionId, id],
  )

  await execute(
    `UPDATE fish_auctions
     SET winning_price = ?, buyer_name = ?, status = 'live'
     WHERE id = ?`,
    [input.bidAmount, input.bidderName, auctionId],
  )

  const bid = await queryOne<AuctionBid>(
    `SELECT * FROM auction_bids WHERE id = ?`,
    [id],
  )
  if (!bid) throw new Error('Failed to place bid')

  // Dispatch portal notification to seller tenant and platform users
  await dispatchOutboundBidAlert({
    tenantId: auction.tenant_id,
    bidderTenantId: tenantId,
    auctionId,
    bidderName: input.bidderName,
    bidderPhone: input.bidderPhone ?? null,
    bidAmount: input.bidAmount,
    speciesName: auction.species_name || 'Fish Lot',
    lotCode: auction.lot_code || auctionId.slice(0, 8),
  })

  return { bid, auctionUpdated: true }
}

export async function dispatchOutboundBidAlert(params: {
  tenantId: string
  bidderTenantId?: string
  auctionId: string
  bidderName: string
  bidderPhone: string | null
  bidAmount: number
  speciesName: string
  lotCode: string
}): Promise<{ portalNotified: boolean; smsPayload: string; whatsappPayload: string }> {
  const notifId = generateId()
  const title = `New High Bid: KES ${params.bidAmount.toLocaleString()}`
  const message = `Bidder ${params.bidderName} placed a winning bid of KES ${params.bidAmount.toLocaleString()} on ${params.speciesName} (${params.lotCode}).`
  const actionUrl = `/dashboard/fishing/auctions`

  // 1. Web Portal Notifications (Notifies seller tenant users + bidder tenant users)
  try {
    const targetUsers = await query<{ id: string; tenant_id: string }>(
      `SELECT id, tenant_id FROM users WHERE tenant_id IN (?, ?) LIMIT 10`,
      [params.tenantId, params.bidderTenantId || params.tenantId],
    )
    for (const u of targetUsers) {
      await execute(
        `INSERT INTO notifications (id, tenant_id, user_id, type, title, message, action_url)
         VALUES (?, ?, ?, 'info', ?, ?, ?)`,
        [generateId(), u.tenant_id, u.id, title, message, actionUrl],
      )
    }
  } catch {
    // Non-blocking notification fallback
  }

  // 2. Extensible SMS / WhatsApp Payload (Ready for Twilio / Africa's Talking / WhatsApp API integration)
  const smsPayload = `AquaERP Alert: New high bid KES ${params.bidAmount.toLocaleString()} by ${params.bidderName} for lot ${params.lotCode}.`
  const whatsappPayload = `🌊 *AquaERP Landing Auction Alert*\n\n*Lot:* ${params.lotCode} (${params.speciesName})\n*High Bid:* KES ${params.bidAmount.toLocaleString()}\n*Bidder:* ${params.bidderName}\n*Phone:* ${params.bidderPhone || 'N/A'}\n\n_Track live: https://aqualedger.org${actionUrl}_`

  return {
    portalNotified: true,
    smsPayload,
    whatsappPayload,
  }
}
