'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Copy, ExternalLink, Globe, Trash2 } from 'lucide-react'

type DomainRow = {
  id: string
  domain: string
  verified: boolean | number
  primary_domain?: boolean | number
  verify_token?: string | null
}

type HostingInfo = {
  slug: string
  tenantName: string
  platformHost: string
  subdomainHost: string
  subdomainUrl: string
  subdomainStoreUrl: string
  subdomainDashboardUrl: string
  platformStoreUrl: string
  cnameTarget: string
  primaryCustomDomain: string | null
}

export default function CustomDomainsPage() {
  const [domains, setDomains] = useState<DomainRow[]>([])
  const [hosting, setHosting] = useState<HostingInfo | null>(null)
  const [domain, setDomain] = useState('')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    authFetchJson<{
      success: boolean
      data?: { domains: DomainRow[]; hosting: HostingInfo | null }
    }>('/api/v2/tenant/domains')
      .then((res) => {
        if (res.success && res.data) {
          setDomains(res.data.domains ?? [])
          setHosting(res.data.hosting ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const add = async () => {
    const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/tenant/domains', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })
    if (res.success) {
      toast.success('Custom domain requested — add DNS records below, then verify')
      setDomain('')
      load()
    } else {
      toast.error(res.error || 'Failed to add domain')
    }
  }

  const verifyDns = async (id: string) => {
    setVerifyingId(id)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { domain: { verified?: boolean; message?: string } }
        error?: string
      }>('/api/v2/tenant/domains', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify-dns', domainId: id }),
      })
      if (res.success && res.data?.domain?.verified) {
        toast.success('DNS verified — domain is active')
        load()
      } else {
        toast.error(res.data?.domain?.message || res.error || 'DNS verification failed')
      }
    } finally {
      setVerifyingId(null)
    }
  }

  const setPrimary = async (id: string) => {
    const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/tenant/domains', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'set-primary', domainId: id }),
    })
    if (res.success) {
      toast.success('Primary custom domain updated')
      load()
    } else {
      toast.error(res.error || 'Failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this custom domain?')) return
    const res = await authFetchJson<{ success: boolean; error?: string }>(
      `/api/v2/tenant/domains?domainId=${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    )
    if (res.success) {
      toast.success('Domain removed')
      load()
    } else {
      toast.error(res.error || 'Failed to remove')
    }
  }

  const isVerified = (d: DomainRow) => d.verified === true || d.verified === 1
  const isPrimary = (d: DomainRow) => d.primary_domain === true || d.primary_domain === 1

  return (
    <DashboardPageLayout
      title="Domains & hosting"
      description="Your free subdomain is ready at signup. Add a custom domain (e.g. shop.yourbrand.com) when you need your own URL."
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Default subdomain (included)
          </CardTitle>
          <CardDescription>
            Every organization gets <strong>{hosting?.subdomainHost ?? 'your-org.platform.com'}</strong>{' '}
            automatically — no DNS setup required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !hosting ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : hosting ? (
            <>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tenant slug</span>
                  <code className="font-mono">{hosting.slug}</code>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">Storefront (subdomain)</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={hosting.subdomainStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline break-all"
                    >
                      {hosting.subdomainHost}
                    </a>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => copy(hosting.subdomainStoreUrl, 'Store URL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8" asChild>
                      <a href={hosting.subdomainStoreUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">Storefront (platform path)</span>
                  <a
                    href={hosting.platformStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline break-all"
                  >
                    {hosting.platformStoreUrl}
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Point your team to the subdomain URL for a branded experience. Custom domains below
                replace the public storefront URL once verified.
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request custom domain</CardTitle>
          <CardDescription>
            Use your own hostname (e.g. <code className="text-xs">shop.acme.co.ke</code>). After adding,
            configure DNS at your registrar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom-domain">Domain</Label>
              <Input
                id="custom-domain"
                placeholder="shop.yourcompany.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <Button onClick={add} disabled={!domain.trim()}>
              Request domain
            </Button>
          </div>
          {hosting && (
            <div className="rounded-md border border-dashed p-3 text-sm space-y-2">
              <p className="font-medium">DNS setup (after request)</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>TXT</strong> (ownership): host{' '}
                  <code className="text-xs">_aquaerp-verify.your-domain</code> — value shown per domain
                </li>
                <li>
                  <strong>CNAME</strong> (routing): point your domain to{' '}
                  <code className="text-xs">{hosting.cnameTarget}</code> or your platform app host
                </li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom domains</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No custom domains yet. Your subdomain above is already live.
            </p>
          ) : (
            domains.map((d) => (
              <div key={d.id} className="py-4 border-b last:border-0 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{d.domain}</span>
                    {isVerified(d) ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Pending DNS</Badge>
                    )}
                    {isPrimary(d) && <Badge variant="outline">Primary</Badge>}
                  </div>
                  <div className="flex gap-2">
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
                    {isVerified(d) && !isPrimary(d) && (
                      <Button size="sm" variant="secondary" onClick={() => setPrimary(d.id)}>
                        Set primary
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!isVerified(d) && d.verify_token && (
                  <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1 font-mono">
                    <p className="font-sans text-muted-foreground font-normal text-xs">
                      TXT record at your DNS provider:
                    </p>
                    <p>
                      <span className="text-muted-foreground">Host:</span> _aquaerp-verify.{d.domain}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Value:</span> {d.verify_token}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Need help? See{' '}
        <Link href="/dashboard/onboarding" className="text-primary hover:underline">
          onboarding
        </Link>{' '}
        or contact your platform administrator.
      </p>
    </DashboardPageLayout>
  )
}
