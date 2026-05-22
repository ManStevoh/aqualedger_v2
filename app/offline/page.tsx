'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle>You are offline</CardTitle>
          <CardDescription>
            AquaERP saved a lightweight dashboard shell for when connectivity is limited at sea or
            on the landing site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Reconnect to Wi‑Fi or mobile data when available.</li>
            <li>Return to the dashboard — cached pages may load immediately.</li>
            <li>Pending catch logs and wallet actions sync once you are back online.</li>
          </ol>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Open dashboard
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => typeof window !== 'undefined' && window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Install AquaERP from your browser menu for faster launch and offline access.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
