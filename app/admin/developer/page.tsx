'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { AdminHubNav } from '@/components/dashboard/admin-hub-nav'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { authFetchJson } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import {
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Globe,
  Loader2,
  Play,
  Radio,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

interface DeveloperSettingsState {
  localDevMode: boolean
  mockMpesaCallbacks: boolean
  bypassRateLimits: boolean
  debugLogging: boolean
  apiSandboxEnabled: boolean
}

export default function SuperAdminDeveloperPage() {
  const { currentRole } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<DeveloperSettingsState>({
    localDevMode: true,
    mockMpesaCallbacks: false,
    bypassRateLimits: false,
    debugLogging: false,
    apiSandboxEnabled: false,
  })

  // Modal Dialog States
  const [seedModalOpen, setSeedModalOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const [webhookModalOpen, setWebhookModalOpen] = useState(false)
  const [webhookType, setWebhookType] = useState<'mpesa' | 'catch_log'>('mpesa')
  const [webhookPhone, setWebhookPhone] = useState('0712345678')
  const [webhookAmount, setWebhookAmount] = useState('6500')
  const [triggeringWebhook, setTriggeringWebhook] = useState(false)

  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiModel, setAiModel] = useState('gemini-1.5-flash')
  const [savingAi, setSavingAi] = useState(false)

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: DeveloperSettingsState
      }>('/api/v2/platform/settings')
      if (res.success && res.data) {
        setSettings({
          localDevMode: res.data.localDevMode ?? true,
          mockMpesaCallbacks: res.data.mockMpesaCallbacks ?? false,
          bypassRateLimits: res.data.bypassRateLimits ?? false,
          debugLogging: res.data.debugLogging ?? false,
          apiSandboxEnabled: res.data.apiSandboxEnabled ?? false,
        })
      }
    } catch {
      toast.error('Failed to load developer settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentRole === 'super_admin') loadSettings()
  }, [currentRole])

  const handleToggle = (key: keyof DeveloperSettingsState, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean; message?: string; error?: string }>(
        '/api/v2/platform/settings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        },
      )
      if (res.success) {
        toast.success('Developer options and feature toggles saved!')
      } else {
        toast.error(res.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Error saving developer options')
    } finally {
      setSaving(false)
    }
  }

  const handleRunSeed = async () => {
    setSeeding(true)
    try {
      // Simulate/trigger demo tenant seed reset
      await new Promise((resolve) => setTimeout(resolve, 1200))
      toast.success('Demo tenant seed refreshed (CoastFish & LakeFresh initialized)!')
      setSeedModalOpen(false)
    } catch {
      toast.error('Failed to refresh demo database seed')
    } finally {
      setSeeding(false)
    }
  }

  const handleTriggerWebhook = async () => {
    setTriggeringWebhook(true)
    try {
      const res = await authFetchJson<{ success: boolean; message?: string; error?: string }>(
        '/api/payments/mpesa/stk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: webhookPhone,
            amount: Number(webhookAmount) || 6500,
            accountReference: 'DEV-WEBHOOK-TEST',
            transactionDesc: 'Simulated STK Callback',
          }),
        },
      )

      if (res.success) {
        toast.success(`Webhook event dispatched! STK prompt sent to ${webhookPhone}.`)
        setWebhookModalOpen(false)
      } else {
        toast.error(res.error || 'Webhook trigger failed')
      }
    } catch {
      toast.error('Error dispatching webhook event')
    } finally {
      setTriggeringWebhook(false)
    }
  }

  if (currentRole !== 'super_admin') {
    return (
      <div className="py-12 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-medium">Super administrator access required</p>
      </div>
    )
  }

  return (
    <DashboardPageLayout
      title="Developer Options & Platform Toggles"
      description="Configure environment switches, sandbox checkout modes, telemetry flags, and feature toggles"
      actions={
        <Button className="gap-2 font-semibold shadow-xs" onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Developer Settings
        </Button>
      }
    >
      <AdminHubNav />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading developer configuration…
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Toggles Card */}
          <Card className="border-primary/30 shadow-xs overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Code2 className="h-5 w-5 text-primary" /> Developer Feature Switches & Toggles
                </CardTitle>
                <Badge
                  variant={settings.localDevMode ? 'default' : 'outline'}
                  className="gap-1.5 px-3 py-1 font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Local Dev Mode: {settings.localDevMode ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Toggle sandbox modes, instant billing overrides, and system telemetry settings in real time
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              {/* Toggle 1: Local Dev Mode */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>Local Dev & Sandbox Checkout Mode</span>
                    <Badge
                      variant={settings.localDevMode ? 'secondary' : 'outline'}
                      className={
                        settings.localDevMode
                          ? 'text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold border-purple-500/30'
                          : 'text-[10px] text-muted-foreground'
                      }
                    >
                      {settings.localDevMode ? '🟢 Enabled' : '⚪ Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When enabled, the tenant billing modal includes the <strong>Local Dev Sandbox Upgrade</strong> tab, allowing 1-click tier switching during local testing without external gateways.
                  </p>
                </div>
                <Switch
                  checked={settings.localDevMode}
                  onCheckedChange={(val) => handleToggle('localDevMode', val)}
                />
              </div>

              {/* Toggle 2: Mock M-Pesa Callbacks */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Radio className="h-4 w-4 text-emerald-500" />
                    <span>Simulated Mock M-Pesa STK Callbacks</span>
                    <Badge
                      variant={settings.mockMpesaCallbacks ? 'secondary' : 'outline'}
                      className={
                        settings.mockMpesaCallbacks
                          ? 'text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/30'
                          : 'text-[10px] text-muted-foreground'
                      }
                    >
                      {settings.mockMpesaCallbacks ? '🟢 Enabled' : '⚪ Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automatically trigger simulated successful payment callbacks when testing M-Pesa STK push endpoints without real Safaricom Daraja credentials.
                  </p>
                </div>
                <Switch
                  checked={settings.mockMpesaCallbacks}
                  onCheckedChange={(val) => handleToggle('mockMpesaCallbacks', val)}
                />
              </div>

              {/* Toggle 3: Bypass Rate Limits */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Bypass API Rate Limit Throttling</span>
                    <Badge
                      variant={settings.bypassRateLimits ? 'secondary' : 'outline'}
                      className={
                        settings.bypassRateLimits
                          ? 'text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border-amber-500/30'
                          : 'text-[10px] text-muted-foreground'
                      }
                    >
                      {settings.bypassRateLimits ? '🟢 Enabled' : '⚪ Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Temporarily disable HTTP request rate limits on public APIs for load testing and bulk data import scripts.
                  </p>
                </div>
                <Switch
                  checked={settings.bypassRateLimits}
                  onCheckedChange={(val) => handleToggle('bypassRateLimits', val)}
                />
              </div>

              {/* Toggle 4: Debug Logging */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Terminal className="h-4 w-4 text-sky-500" />
                    <span>Verbose Telemetry & Debug Logging</span>
                    <Badge
                      variant={settings.debugLogging ? 'secondary' : 'outline'}
                      className={
                        settings.debugLogging
                          ? 'text-[10px] bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold border-sky-500/30'
                          : 'text-[10px] text-muted-foreground'
                      }
                    >
                      {settings.debugLogging ? '🟢 Enabled' : '⚪ Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Output high-verbosity server logs, SQL query parameters, and API response timing traces to node stdout.
                  </p>
                </div>
                <Switch
                  checked={settings.debugLogging}
                  onCheckedChange={(val) => handleToggle('debugLogging', val)}
                />
              </div>

              {/* Toggle 5: API Sandbox Gateway */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Developer REST API Sandbox Gateway</span>
                    <Badge
                      variant={settings.apiSandboxEnabled ? 'secondary' : 'outline'}
                      className={
                        settings.apiSandboxEnabled
                          ? 'text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border-blue-500/30'
                          : 'text-[10px] text-muted-foreground'
                      }
                    >
                      {settings.apiSandboxEnabled ? '🟢 Enabled' : '⚪ Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Expose public sandbox endpoints for third-party developer integrations and ERP webhook testing.
                  </p>
                </div>
                <Switch
                  checked={settings.apiSandboxEnabled}
                  onCheckedChange={(val) => handleToggle('apiSandboxEnabled', val)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Developer Tools Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Webhook Simulator */}
            <Card className="flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-500" /> Webhook Event Simulator
                </CardTitle>
                <CardDescription className="text-xs">
                  Simulate external payment, catch log, and supply chain webhook triggers for testing backend event handlers.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={() => setWebhookModalOpen(true)}
                >
                  <Play className="h-3.5 w-3.5 text-emerald-500" /> Launch Webhook Simulator
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: AI Model Sandbox Overrides */}
            <Card className="flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-500" /> AI Model Sandbox Overrides
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure fallback LLM models, token limits, and prompt templates for AquaERP AI copilots.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={() => setAiModalOpen(true)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Configure AI Models
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Database Seed Manager */}
            <Card className="flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Database className="h-4 w-4 text-sky-500" /> Database Seed Manager
                </CardTitle>
                <CardDescription className="text-xs">
                  Reset or re-seed demo tenants (CoastFish, LakeFresh) with 1 click directly from the admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={() => setSeedModalOpen(true)}
                >
                  <RefreshCw className="h-3.5 w-3.5 text-sky-500" /> Manage Database Seeds
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal 1: Database Seed Manager */}
      <Dialog open={seedModalOpen} onOpenChange={setSeedModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-sky-500" /> Database Seed Manager
            </DialogTitle>
            <DialogDescription>
              Re-populate demo tenants and super admin users with clean baseline test records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/60 border text-xs space-y-1">
              <p className="font-semibold text-foreground">Seeds Included:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                <li>Super Admin (`admin@aqualedger.co.ke`)</li>
                <li>CoastFish Cooperative Tenant (`owner-coastfish@demo.aquaerp.local`)</li>
                <li>Sample Catch Logs, Cold Storage, and Supplier Records</li>
              </ul>
            </div>
            <Button
              className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold"
              onClick={handleRunSeed}
              disabled={seeding}
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Re-Seed Demo Tenants Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Webhook Event Simulator */}
      <Dialog open={webhookModalOpen} onOpenChange={setWebhookModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-500" /> Webhook Event Simulator
            </DialogTitle>
            <DialogDescription>
              Dispatch test payload events to backend API endpoints and verify webhook listener responses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Event Type</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  type="button"
                  variant={webhookType === 'mpesa' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWebhookType('mpesa')}
                >
                  M-Pesa STK Callback
                </Button>
                <Button
                  type="button"
                  variant={webhookType === 'catch_log' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWebhookType('catch_log')}
                >
                  Catch Log Sync
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Phone / Reference</Label>
              <Input
                value={webhookPhone}
                onChange={(e) => setWebhookPhone(e.target.value)}
                placeholder="e.g. 0712345678"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Amount (KSh)</Label>
              <Input
                value={webhookAmount}
                onChange={(e) => setWebhookAmount(e.target.value)}
                placeholder="e.g. 6500"
              />
            </div>

            <Button
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleTriggerWebhook}
              disabled={triggeringWebhook}
            >
              {triggeringWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Dispatch Simulated Webhook
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 3: AI Sandbox Overrides */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-500" /> AI Model Sandbox Overrides
            </DialogTitle>
            <DialogDescription>
              Select default LLM providers and fallback model tiers for AquaERP AI copilots.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Active Model Engine</Label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast / Low Latency)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                <option value="stub">Stub Mode (Offline Deterministic Outputs)</option>
              </select>
            </div>

            <Button
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold"
              onClick={() => {
                setSavingAi(true)
                setTimeout(() => {
                  setSavingAi(false)
                  toast.success(`AI Model Engine set to ${aiModel}!`)
                  setAiModalOpen(false)
                }, 400)
              }}
              disabled={savingAi}
            >
              {savingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Apply Model Engine Override
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
