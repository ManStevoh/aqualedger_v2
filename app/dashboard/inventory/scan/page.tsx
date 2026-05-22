'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { ScanLine, Camera, CameraOff } from 'lucide-react'
import { toast } from 'sonner'

export default function InventoryScanPage() {
  const meta = useDashboardPageMeta({ title: 'Barcode / QR scan' })

  const [barcode, setBarcode] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setCameraSupported(
      typeof window !== 'undefined' &&
        'BarcodeDetector' in window &&
        !!navigator.mediaDevices?.getUserMedia,
    )
  }, [])

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }, [])

  const lookup = useCallback(async (code: string) => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { batch?: Record<string, unknown>; scanId: string }
      }>('/api/v2/inventory/scan', {
        method: 'POST',
        body: JSON.stringify({ barcode: code.trim(), action: 'lookup' }),
      })
      if (res.success && res.data) {
        setResult(res.data.batch || { recorded: true, scanId: res.data.scanId })
        setBarcode(code.trim())
        toast.success('Barcode scanned')
      }
    } catch {
      toast.error('Scan failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)

      // @ts-expect-error BarcodeDetector is experimental
      const detector = new BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39'],
      })

      scanTimerRef.current = setInterval(async () => {
        if (!videoRef.current) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0 && codes[0].rawValue) {
            stopCamera()
            await lookup(codes[0].rawValue)
          }
        } catch {
          /* ignore frame errors */
        }
      }, 500)
    } catch {
      toast.error('Camera access denied or unavailable')
    }
  }

  useEffect(() => () => stopCamera(), [stopCamera])

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} className="max-w-lg mx-auto">
<Card>
        <CardHeader>
          <CardTitle>Scan inventory</CardTitle>
          <CardDescription>
            GS1-compatible lookup · USB/Bluetooth scanners type into the field · camera when browser
            supports BarcodeDetector
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cameraSupported && (
            <div className="space-y-2">
              {cameraOn ? (
                <>
                  <video ref={videoRef} className="w-full rounded border aspect-video bg-black" muted playsInline />
                  <Button variant="outline" className="w-full gap-2" onClick={stopCamera}>
                    <CameraOff className="h-4 w-4" />
                    Stop camera
                  </Button>
                </>
              ) : (
                <Button variant="secondary" className="w-full gap-2" onClick={startCamera}>
                  <Camera className="h-4 w-4" />
                  Scan with camera
                </Button>
              )}
            </div>
          )}
          <div>
            <Label htmlFor="barcode">Barcode or batch code</Label>
            <Input
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup(barcode)}
              placeholder="Scan or type code"
              className="mt-1 font-mono"
              autoFocus={!cameraOn}
            />
          </div>
          <Button onClick={() => lookup(barcode)} disabled={loading} className="w-full min-h-[44px]">
            {loading ? 'Looking up…' : 'Lookup batch'}
          </Button>
          {result && (
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}

