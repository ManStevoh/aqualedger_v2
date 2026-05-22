'use client'

import { useState } from 'react'
import { Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { publicApiFetch } from '@/lib/client-api'

interface Props {
  tenantSlug: string
  storeName: string
}

export function TraceabilityVerifier({ tenantSlug, storeName }: Props) {
  const [lot, setLot] = useState('')
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    ok: boolean
    message: string
    details?: Record<string, unknown>
  } | null>(null)

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const params = new URLSearchParams()
      if (hash.trim()) {
        params.set('hash', hash.trim())
      } else if (lot.trim()) {
        params.set('lot', lot.trim())
        params.set('tenant', tenantSlug)
      } else {
        setResult({ ok: false, message: 'Enter a lot code or verification hash.' })
        return
      }
      const res = await publicApiFetch(`/traceability/verify?${params}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setResult({
          ok: false,
          message: data.error || 'Lot not found or not verified.',
        })
        return
      }
      setResult({
        ok: true,
        message: `Verified — ${data.data.lotCode || lot}`,
        details: data.data,
      })
    } catch {
      setResult({ ok: false, message: 'Verification request failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-10 rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-surface)] p-6">
      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--sf-font-heading)' }}>
        <Shield className="h-5 w-5 text-[var(--sf-success)]" aria-hidden />
        Verify your lot
      </h2>
      <p className="mt-2 text-sm text-[var(--sf-text-muted)]">
        Enter the lot code from {storeName} packaging or paste a certificate hash from your receipt.
      </p>
      <form onSubmit={verify} className="mt-4 space-y-3">
        <div>
          <label className="text-sm font-medium" htmlFor="lot-code">
            Lot code
          </label>
          <input
            id="lot-code"
            className="mt-1 w-full rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-bg)] px-3 py-2.5 min-h-[44px]"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            placeholder="e.g. LOT-2026-001"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="verify-hash">
            Or verification hash
          </label>
          <input
            id="verify-hash"
            className="mt-1 w-full rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-bg)] px-3 py-2.5 min-h-[44px] font-mono text-sm"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="64-character hash"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--sf-radius)] px-6 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: 'var(--sf-primary)', color: 'var(--sf-primary-fg)' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          Verify catch chain
        </button>
      </form>
      {result && (
        <div
          className={`mt-4 flex gap-3 rounded-[var(--sf-radius)] border p-4 ${
            result.ok ? 'border-[var(--sf-success)]/40 bg-[var(--sf-success)]/10' : 'border-destructive/40 bg-destructive/10'
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--sf-success)]" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <div className="text-sm">
            <p className="font-medium">{result.message}</p>
            {result.ok && typeof result.details?.tenantName === 'string' && (
              <p className="mt-1 text-[var(--sf-text-muted)]">
                Supplier: {result.details.tenantName}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
