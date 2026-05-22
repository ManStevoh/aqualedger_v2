'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/data-table'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { urlInputPlaceholder } from '@/lib/config/urls'
import { BrandPreview } from '@/components/branding/brand-preview'
import { useBrand } from '@/components/branding/brand-provider'
import { Building2, Globe, MapPin, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'

interface Tenant {
  id: string
  slug: string
  name: string
  default_currency: string
  country_code: string
  plan: string
  status: string
  settings?: {
    tax_tin?: string
    vat_number?: string
    branding?: { logo_url?: string; primary_color?: string }
  } | null
  logo_url?: string | null
  primary_color?: string | null
}

interface Subscription {
  plan: string
  label: string
  features: string[]
}

interface Branch {
  id: string
  code: string
  name: string
  type: string
  county: string | null
  status: string
}

export default function OrganizationPage() {
  const meta = useDashboardPageMeta({
    description: 'Tenant profile, subscription, and tax settings',
  })
  const { refresh: refreshBrand } = useBrand()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [taxTin, setTaxTin] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')

  const loadTenant = () => {
    setLoading(true)
    authFetchJson<{
      success: boolean
      data?: { tenant: Tenant; branches: Branch[]; subscription: Subscription }
    }>('/api/v2/tenant')
      .then((res) => {
        if (res.success && res.data) {
          setTenant(res.data.tenant)
          setBranches(res.data.branches)
          setSubscription(res.data.subscription)
          setTaxTin(res.data.tenant.settings?.tax_tin ?? '')
          setVatNumber(res.data.tenant.settings?.vat_number ?? '')
          setLogoUrl(
            res.data.tenant.settings?.branding?.logo_url ?? res.data.tenant.logo_url ?? '',
          )
          setPrimaryColor(
            res.data.tenant.settings?.branding?.primary_color ??
              res.data.tenant.primary_color ??
              '#0ea5e9',
          )
        }
      })
      .catch(() => {
        setTenant(null)
        setBranches([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTenant()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxTin: taxTin.trim() || undefined,
          vatNumber: vatNumber.trim() || undefined,
          branding: {
            logo_url: logoUrl.trim() || undefined,
            primary_color: primaryColor.trim() || undefined,
          },
        }),
      })
      if (!res.success) {
        toast.error(res.error || 'Save failed')
        return
      }
      toast.success('Tenant settings updated')
      loadTenant()
      await refreshBrand()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const activeBranches = branches.filter((b) => b.status === 'active').length

  return (
    <DashboardPageLayout
        title={meta.title}
        description={meta.description}
        breadcrumbs={meta.breadcrumbs}
      >
<StatCardGrid>
        <StatCard
          title="Plan"
          value={subscription?.label ?? tenant?.plan ?? '—'}
          loading={loading}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Branches"
          value={branches.length}
          loading={loading}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active sites"
          value={activeBranches}
          loading={loading}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Currency"
          value={tenant?.default_currency ?? '—'}
          loading={loading}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        />
      </StatCardGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tenant?.name ?? 'Organization'}</CardTitle>
            <CardDescription>Tenant metadata</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="font-medium">{tenant?.slug ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{tenant?.country_code ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={tenant?.status === 'active' ? 'default' : 'secondary'}>
                {tenant?.status ?? 'unknown'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenant ID</p>
              <p className="font-mono text-xs">{tenant?.id ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>{subscription?.plan ?? tenant?.plan} plan features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {(subscription?.features ?? []).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax & branding</CardTitle>
          <CardDescription>
            Logo and primary color apply to your ERP dashboard sidebar and accents. Public storefront branding is
            configured separately under Commerce → Storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tax TIN</Label>
              <Input value={taxTin} onChange={(e) => setTaxTin(e.target.value)} placeholder="P051234567X" />
            </div>
            <div className="space-y-2">
              <Label>VAT number</Label>
              <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="VAT-KE-..." />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder={urlInputPlaceholder('https')} />
            </div>
            <div className="space-y-2">
              <Label>Primary color</Label>
              <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </div>
          </div>
          <BrandPreview
            appName={tenant?.name ?? ''}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
          />
          <Button className="gap-2" onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </CardContent>
      </Card>

      <DataTable
        title="Branches"
        description="Landing sites, cold storage, and offices"
        loading={loading}
        data={branches}
        emptyMessage="No branches configured"
        columns={[
          { key: 'code', header: 'Code' },
          { key: 'name', header: 'Name' },
          {
            key: 'type',
            header: 'Type',
            cell: (row) => <Badge variant="outline">{row.type.replace('_', ' ')}</Badge>,
          },
          {
            key: 'county',
            header: 'County',
            cell: (row) => row.county || '—',
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                {row.status}
              </Badge>
            ),
          },
        ]}
      />
    </DashboardPageLayout>
  )
}


