'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

export default function CustomDomainsPage() {
  const [domains, setDomains] = useState<Record<string, unknown>[]>([])
  const [domain, setDomain] = useState('')

  const load = () => {
    authFetchJson<{ success: boolean; data?: { domains: Record<string, unknown>[] } }>(
      '/api/v2/tenant/domains',
    ).then((res) => {
      if (res.success && res.data?.domains) setDomains(res.data.domains)
    })
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const res = await authFetchJson<{ success: boolean; data?: { domain: { verifyToken?: string } } }>(
      '/api/v2/tenant/domains',
      { method: 'POST', body: JSON.stringify({ domain }) },
    )
    if (res.success) {
      toast.success(`Added. DNS TXT: ${res.data?.domain?.verifyToken || 'verify'}`)
      load()
    }
  }

  const verify = async (id: string) => {
    await authFetchJson('/api/v2/tenant/domains', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', domainId: id }),
    })
    toast.success('Domain marked verified')
    load()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Custom domains</h1>
      <Card>
        <CardHeader><CardTitle>Add domain</CardTitle></CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1"><Label>Domain</Label><Input placeholder="shop.yourcompany.com" value={domain} onChange={(e) => setDomain(e.target.value)} /></div>
          <Button onClick={add}>Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Domains</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {domains.map((d) => (
            <div key={String(d.id)} className="flex justify-between py-2 border-b">
              <span>{String(d.domain)} {d.verified ? '✓' : '(pending)'}</span>
              {!d.verified && <Button size="sm" variant="outline" onClick={() => verify(String(d.id))}>Verify</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
