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
    status: string
    starting_price: number
    winning_price: number | null
  }>(
    `SELECT id, status, starting_price, winning_price FROM fish_auctions
     WHERE id = ? AND ${tenantWhere()}`,
    [auctionId, tenantId],
  )
  if (!auction) throw new Error('Auction not found')
  if (auction.status === 'closed' || auction.status === 'cancelled') {
    throw new Error('Auction is not accepting bids')
  }

  const currentHigh = await queryOne<{ max_bid: number | null }>(
    `SELECT MAX(bid_amount) as max_bid FROM auction_bids
     WHERE auction_id = ? AND ${tenantWhere()}`,
    [auctionId, tenantId],
  )
  const minBid = Math.max(
    Number(auction.winning_price ?? 0),
    Number(currentHigh?.max_bid ?? 0),
    Number(auction.starting_price),
  )
  if (input.bidAmount <= minBid) {
    throw new Error(`Bid must exceed current high of ${minBid}`)
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
    `UPDATE auction_bids SET is_winning = 0
     WHERE auction_id = ? AND ${tenantWhere()} AND id != ?`,
    [auctionId, tenantId, id],
  )

  await execute(
    `UPDATE fish_auctions
     SET winning_price = ?, buyer_name = ?, status = 'live'
     WHERE id = ? AND ${tenantWhere()}`,
    [input.bidAmount, input.bidderName, auctionId, tenantId],
  )

  const bid = await queryOne<AuctionBid>(
    `SELECT * FROM auction_bids WHERE id = ?`,
    [id],
  )
  if (!bid) throw new Error('Failed to place bid')

  return { bid, auctionUpdated: true }
}
