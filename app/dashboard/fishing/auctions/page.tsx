'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatCard } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { Gavel, Plus, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface FishAuction {
  id: string
  lot_code: string | null
  species_name: string
  quantity_kg: number
  starting_price: number
  winning_price: number | null
  buyer_name: string | null
  status: string
  auction_date: string
}

interface AuctionBid {
  id: string
  bidder_name: string
  bid_amount: number
  is_winning: number
  created_at: string
}

export default function FishAuctionsPage() {
  const [auctions, setAuctions] = useState<FishAuction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [speciesName, setSpeciesName] = useState('')
  const [lotCode, setLotCode] = useState('')
  const [quantityKg, setQuantityKg] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [auctionDate, setAuctionDate] = useState('')
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<FishAuction | null>(null)
  const [bids, setBids] = useState<AuctionBid[]>([])
  const [bidderName, setBidderName] = useState('')
  const [bidderPhone, setBidderPhone] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [bidding, setBidding] = useState(false)

  const fetchAuctions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { auctions: FishAuction[] }
      }>('/api/v2/fishing-ops/auctions?limit=100')
      if (res.success && res.data?.auctions) {
        setAuctions(res.data.auctions)
      } else {
        setAuctions([])
      }
    } catch {
      setAuctions([])
      toast.error('Failed to load auctions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuctions()
  }, [fetchAuctions])

  const openBidDialog = async (auction: FishAuction) => {
    setSelectedAuction(auction)
    setBidDialogOpen(true)
    setBidderName('')
    setBidderPhone('')
    const min = auction.winning_price ?? auction.starting_price
    setBidAmount(String(Number(min) + 100))
    try {
      const res = await authFetchJson<{ success: boolean; data?: { bids: AuctionBid[] } }>(
        `/api/v2/fishing-ops/auctions/${auction.id}/bids?limit=20`,
      )
      if (res.success && res.data?.bids) setBids(res.data.bids)
      else setBids([])
    } catch {
      setBids([])
    }
  }

  const handlePlaceBid = async () => {
    if (!selectedAuction || !bidderName.trim() || !bidAmount) {
      toast.error('Bidder name and amount are required')
      return
    }
    setBidding(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        `/api/v2/fishing-ops/auctions/${selectedAuction.id}/bids`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bidderName: bidderName.trim(),
            bidderPhone: bidderPhone.trim() || undefined,
            bidAmount: Number(bidAmount),
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Bid rejected')
        return
      }
      toast.success('Bid placed')
      setBidDialogOpen(false)
      await fetchAuctions()
    } catch {
      toast.error('Network error')
    } finally {
      setBidding(false)
    }
  }

  const handleCreate = async () => {
    if (!speciesName.trim() || !quantityKg || !startingPrice || !auctionDate) {
      toast.error('Species, quantity, price, and date are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/fishing-ops/auctions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            speciesName: speciesName.trim(),
            lotCode: lotCode.trim() || undefined,
            quantityKg: Number(quantityKg),
            startingPrice: Number(startingPrice),
            auctionDate,
          }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Could not create auction')
        return
      }
      toast.success('Auction scheduled')
      setShowDialog(false)
      setSpeciesName('')
      setLotCode('')
      setQuantityKg('')
      setStartingPrice('')
      setAuctionDate('')
      await fetchAuctions()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const live = auctions.filter((a) => a.status === 'live').length
  const closed = auctions.filter((a) => a.status === 'closed').length

  return (
    <DashboardPageLayout
      title="Fish auctions"
      description="Landing-site auctions linked to traceability lots"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total" value={auctions.length} loading={loading} icon={<Gavel className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Live" value={live} loading={loading} icon={<Gavel className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Closed" value={closed} loading={loading} icon={<Gavel className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auction records</CardTitle>
          <CardDescription>EU fisheries traceability–ready lot codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Lot</th>
                  <th className="text-left py-3 px-4 font-medium">Species</th>
                  <th className="text-left py-3 px-4 font-medium">Qty (kg)</th>
                  <th className="text-left py-3 px-4 font-medium">Start price</th>
                  <th className="text-left py-3 px-4 font-medium">Auction date</th>
                  <th className="text-left py-3 px-4 font-medium">High bid</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono">{a.lot_code || '—'}</td>
                    <td className="py-3 px-4">{a.species_name}</td>
                    <td className="py-3 px-4">{Number(a.quantity_kg).toLocaleString()}</td>
                    <td className="py-3 px-4">{Number(a.starting_price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {String(a.auction_date).slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      {a.winning_price != null
                        ? `KES ${Number(a.winning_price).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {a.status !== 'closed' && a.status !== 'cancelled' && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openBidDialog(a)}>
                          <TrendingUp className="h-3 w-3" />
                          Bid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {auctions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No auctions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule auction</DialogTitle>
            <DialogDescription>Link a GS1-style lot code for downstream traceability.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Species</Label>
              <Input value={speciesName} onChange={(e) => setSpeciesName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Lot code (optional)</Label>
              <Input value={lotCode} onChange={(e) => setLotCode(e.target.value)} placeholder="LOT-2026-..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity (kg)</Label>
                <Input type="number" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Starting price</Label>
                <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Auction date & time</Label>
              <Input type="datetime-local" value={auctionDate} onChange={(e) => setAuctionDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place bid</DialogTitle>
            <DialogDescription>
              {selectedAuction
                ? `${selectedAuction.species_name} · ${selectedAuction.lot_code || 'no lot'}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {bids.length > 0 && (
            <div className="rounded-md border p-3 text-sm space-y-1 max-h-32 overflow-y-auto">
              <p className="font-medium text-muted-foreground mb-2">Recent bids</p>
              {bids.slice(0, 5).map((b) => (
                <div key={b.id} className="flex justify-between">
                  <span>{b.bidder_name}</span>
                  <span className="font-mono">
                    KES {Number(b.bid_amount).toLocaleString()}
                    {b.is_winning ? ' ★' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Bidder name</Label>
              <Input value={bidderName} onChange={(e) => setBidderName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input value={bidderPhone} onChange={(e) => setBidderPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bid amount (KES)</Label>
              <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceBid} disabled={bidding}>
              {bidding ? 'Placing…' : 'Place bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
