'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { authFetchJson } from '@/lib/api'
import { Check, ExternalLink, Palette, Save, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface ThemeOption {
  id: string
  name: string
  description: string
  category: string
  previewGradient: string
  standards: string[]
  wcagLevel: string
  heroStyle: string
  productGridCols: number
  cardStyle: string
}

interface StorefrontSettings {
  tenant_id: string
  theme_id: string
  store_name: string | null
  tagline: string | null
  hero_headline: string | null
  hero_subheadline: string | null
  hero_cta_label: string | null
  cookie_banner_text: string | null
  privacy_policy_url: string | null
  terms_url: string | null
  seo_title: string | null
  seo_description: string | null
  show_traceability: number
  show_reviews: number
  published: number
}

export default function StorefrontCustomizerPage() {
  const meta = useDashboardPageMeta()

  const [themes, setThemes] = useState<ThemeOption[]>([])
  const [settings, setSettings] = useState<StorefrontSettings | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [tagline, setTagline] = useState('')
  const [heroHeadline, setHeroHeadline] = useState('')
  const [heroSubheadline, setHeroSubheadline] = useState('')
  const [cookieText, setCookieText] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [showTraceability, setShowTraceability] = useState(true)
  const [showReviews, setShowReviews] = useState(true)
  const [published, setPublished] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState('ocean-classic')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: {
          settings: StorefrontSettings
          themes: ThemeOption[]
          previewUrl: string | null
        }
      }>('/api/v2/commerce/storefront')
      if (data.success && data.data) {
        const s = data.data.settings
        setSettings(s)
        setThemes(data.data.themes)
        setPreviewUrl(data.data.previewUrl)
        setSelectedThemeId(s.theme_id)
        setStoreName(s.store_name || '')
        setTagline(s.tagline || '')
        setHeroHeadline(s.hero_headline || '')
        setHeroSubheadline(s.hero_subheadline || '')
        setCookieText(s.cookie_banner_text || '')
        setSeoTitle(s.seo_title || '')
        setSeoDescription(s.seo_description || '')
        setShowTraceability(Boolean(s.show_traceability))
        setShowReviews(Boolean(s.show_reviews))
        setPublished(Boolean(s.published))
      }
    } catch {
      toast.error('Failed to load storefront settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async (overrides?: { themeId?: string; published?: boolean }) => {
    setSaving(true)
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { previewUrl: string | null; settings: StorefrontSettings }
      }>('/api/v2/commerce/storefront', {
        method: 'PATCH',
        body: JSON.stringify({
          themeId: overrides?.themeId ?? selectedThemeId,
          storeName: storeName || null,
          tagline: tagline || null,
          heroHeadline: heroHeadline || null,
          heroSubheadline: heroSubheadline || null,
          cookieBannerText: cookieText || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          showTraceability,
          showReviews,
          published: overrides?.published ?? published,
        }),
      })
      if (data.success && data.data) {
        setSettings(data.data.settings)
        setPreviewUrl(data.data.previewUrl)
        if (overrides?.themeId) setSelectedThemeId(overrides.themeId)
        if (overrides?.published !== undefined) setPublished(overrides.published)
        toast.success('Storefront saved')
      }
    } catch {
      toast.error('Failed to save storefront')
    } finally {
      setSaving(false)
    }
  }

  const selectTheme = (themeId: string) => {
    setSelectedThemeId(themeId)
    void save({ themeId })
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading storefront themes…</p>
      </div>
    )
  }

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><div className="flex flex-wrap gap-2">
          {previewUrl && (
            <Button variant="outline" asChild>
              <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview store
              </Link>
            </Button>
          )}
          <Button onClick={() => save()} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save settings
          </Button>
        </div></>}>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Publish storefront
          </CardTitle>
          <CardDescription>
            When published, your store is visible at the public URL. Unpublished stores return 404.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">{published ? 'Live' : 'Draft'}</p>
            {previewUrl && (
              <p className="text-sm text-muted-foreground">{previewUrl}</p>
            )}
          </div>
          <Switch
            checked={published}
            onCheckedChange={(v) => save({ published: v })}
            disabled={saving}
            aria-label="Publish storefront"
          />
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-4">Theme gallery ({themes.length} presets)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTheme(t.id)}
              className={`text-left rounded-lg border-2 overflow-hidden transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedThemeId === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <div
                className="h-24 w-full relative"
                style={{ background: t.previewGradient }}
              >
                {selectedThemeId === t.id && (
                  <span className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground p-1">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </div>
              <div className="p-3 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    WCAG {t.wcagLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                  <Badge variant="outline" className="text-[10px]">{t.cardStyle}</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Branding & hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store name</Label>
              <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="heroHeadline">Hero headline</Label>
              <Input id="heroHeadline" value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="heroSub">Hero subheadline</Label>
              <Textarea id="heroSub" value={heroSubheadline} onChange={(e) => setHeroSubheadline(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance & SEO</CardTitle>
            <CardDescription>GDPR cookie banner, WCAG landmarks, search metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cookie">Cookie consent text (GDPR)</Label>
              <Textarea id="cookie" value={cookieText} onChange={(e) => setCookieText(e.target.value)} rows={2} />
            </div>
            <div>
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="seoDesc">SEO description</Label>
              <Textarea id="seoDesc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="trace">Show traceability badges</Label>
              <Switch id="trace" checked={showTraceability} onCheckedChange={setShowTraceability} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reviews">Show reviews trust line</Label>
              <Switch id="reviews" checked={showReviews} onCheckedChange={setShowReviews} />
            </div>
          </CardContent>
        </Card>
      </div>

      {settings && (
        <p className="text-xs text-muted-foreground">
          Active theme: <strong>{selectedThemeId}</strong> · Tenant: {settings.tenant_id}
        </p>
      )}
    </DashboardPageLayout>
  )
}

