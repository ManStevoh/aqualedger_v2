'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

type DomainRow = {
  id: string
  domain: string
  verified: boolean | number
  verify_token?: string | null
}

export default function CustomDomainsPage() {
  const [domains, setDomains] = useState<DomainRow[]>([])
  const [domain, setDomain] = useState('')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const load = () => {
    authFetchJson<{ success: boolean; data?: { domains: DomainRow[] } }>(
      '/api/v2/tenant/domains',
    ).then((res) => {
      if (res.success && res.data?.domains) setDomains(res.data.domains)
    })
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const res = await authFetchJson<{ success: boolean; data?: { domain: { verify_token?: string } } }>(
      '/api/v2/tenant/domains',
      { method: 'POST', body: JSON.stringify({ domain }) },
    )
    if (res.success) {
      toast.success('Domain added — add the DNS TXT record below, then verify')
      setDomain('')
      load()
    }
  }

  const verifyDns = async (id: string) => {
    setVerifyingId(id)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { domain: { verified?: boolean; dnsVerified?: boolean; message?: string } }
      }>('/api/v2/tenant/domains', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify-dns', domainId: id }),
      })
      if (res.success && res.data?.domain?.verified) {
        toast.success('DNS verified — domain is active')
        load()
      } else {
        toast.error(res.data?.domain?.message || 'DNS verification failed — check your TXT record')
      }
    } finally {
      setVerifyingId(null)
    }
  }

  const isVerified = (d: DomainRow) => d.verified === true || d.verified === 1

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Custom domains</h1>
      <Card>
        <CardHeader><CardTitle>Add domain</CardTitle></CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Domain</Label>
            <Input
              placeholder="shop.yourcompany.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <Button onClick={add} disabled={!domain.trim()}>Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Domains</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {domains.length === 0 && (
            <p className="text-sm text-muted-foreground">No custom domains yet.</p>
          )}
          {domains.map((d) => (
            <div key={d.id} className="py-3 border-b space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {d.domain}{' '}
                  {isVerified(d) ? (
                    <span className="text-green-600 text-sm">✓ verified</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">(pending)</span>
                  )}
                </span>
                {!isVerified(d) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={verifyingId === d.id}
                    onClick={() => verifyDns(d.id)}
                  >
                    {verifyingId === d.id ? 'Checking…' : 'Verify DNS'}
                  </Button>
                )}
              </div>
              {!isVerified(d) && d.verify_token && (
                <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1 font-mono">
                  <p className="font-sans text-muted-foreground font-normal">
                    Add this TXT record at your DNS provider:
                  </p>
                  <p><span className="text-muted-foreground">Host:</span> _aquaerp-verify.{d.domain}</p>
                  <p><span className="text-muted-foreground">Value:</span> {d.verify_token}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
