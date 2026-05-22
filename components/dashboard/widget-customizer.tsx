'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { authFetchJson } from '@/lib/api'
import { LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardWidget {
  id: string
  type: string
  position: number
  visible: boolean
}

const WIDGET_LABELS: Record<string, string> = {
  kpis: 'KPI strip',
  quick_actions: 'Quick actions',
  notifications: 'Notifications',
  modules: 'Module grid',
}

export function WidgetCustomizer() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const loadLayout = async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { layout: { widgets: DashboardWidget[] } }
      }>('/api/v2/dashboard/layout')
      if (res.success && res.data?.layout?.widgets) {
        setWidgets(res.data.layout.widgets)
      }
    } catch {
      toast.error('Could not load layout')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadLayout()
  }, [open])

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/dashboard/layout',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widgets }),
        },
      )
      if (res.success) {
        toast.success('Dashboard layout saved')
        setOpen(false)
      } else {
        toast.error(res.error || 'Save failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutGrid className="h-4 w-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dashboard widgets</SheetTitle>
          <SheetDescription>Show or hide sections on your command center</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            widgets.map((w) => (
              <div key={w.id} className="flex items-center justify-between">
                <Label htmlFor={`widget-${w.id}`}>
                  {WIDGET_LABELS[w.id] ?? w.type}
                </Label>
                <Switch
                  id={`widget-${w.id}`}
                  checked={w.visible}
                  onCheckedChange={() => toggleWidget(w.id)}
                />
              </div>
            ))
          )}
          <Button className="w-full" onClick={save} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save layout'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
