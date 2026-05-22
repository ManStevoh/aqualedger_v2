'use client'

import { useMemo } from 'react'
import { BrandMark } from '@/components/branding/brand-mark'
import { buildBrandIdentity } from '@/lib/branding/build-identity'
import type { BrandIdentity } from '@/lib/branding/types'
import { Button } from '@/components/ui/button'

export function BrandPreview({
  appName,
  logoUrl,
  primaryColor,
}: {
  appName: string
  logoUrl: string
  primaryColor: string
}) {
  const preview = useMemo(
    (): BrandIdentity =>
      buildBrandIdentity({
        appName: appName || 'Your organization',
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
      }),
    [appName, logoUrl, primaryColor],
  )

  return (
    <div
      className="rounded-lg border border-dashed border-border bg-muted/30 p-4"
      style={
        preview.cssVars
          ? (Object.fromEntries(
              Object.entries(preview.cssVars.light).map(([k, v]) => [k, v]),
            ) as React.CSSProperties)
          : undefined
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
        Live preview
      </p>
      <div className="flex items-center gap-3">
        <BrandMark brand={preview} />
        <div className="min-w-0">
          <p className="font-semibold truncate">{preview.appName}</p>
          <p className="text-xs text-muted-foreground">Dashboard sidebar appearance</p>
        </div>
      </div>
      <Button size="sm" className="mt-4 pointer-events-none" type="button">
        Sample primary button
      </Button>
    </div>
  )
}
