'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { 
  CloudRain, Wind, Waves, Thermometer, AlertTriangle, 
  CheckCircle2, MapPin, Clock, RefreshCw, Bell
} from 'lucide-react'
import { authFetchJson } from '@/lib/api'

interface ClimateAlert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'danger' | 'critical'
  title: string
  message: string
  region: string
  county: string
  validFrom: string
  validUntil: string
  isActive: boolean
  source: string
  recommendations: string[]
}

interface OceanCondition {
  region: string
  waveHeight: number
  windSpeed: number
  windDirection: string
  temperature: number
  visibility: string
  currentStrength: string
  safetyStatus: 'safe' | 'caution' | 'dangerous'
  lastUpdated: string
}

export default function ClimateAlertsPage() {
  const [alerts, setAlerts] = useState<ClimateAlert[]>([])
  const [conditions, setConditions] = useState<OceanCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')

  useEffect(() => {
    fetchClimateData()
  }, [])

  const fetchClimateData = async () => {
    try {
      const result = await authFetchJson<{
        success: boolean
        data?: { alerts: Record<string, unknown>[] }
      }>('/api/v2/climate?limit=50')
      if (result.success && result.data?.alerts) {
        setAlerts(
          result.data.alerts.map((a) => {
            const sev = (a.severity as string) || 'low'
            const uiSev: ClimateAlert['severity'] =
              sev === 'extreme' || sev === 'high'
                ? 'critical'
                : sev === 'moderate'
                  ? 'warning'
                  : 'info'
            let counties: string[] = []
            const ac = a.affected_counties
            if (Array.isArray(ac)) {
              counties = ac as string[]
            } else if (typeof ac === 'string') {
              try {
                counties = JSON.parse(ac)
              } catch {
                counties = []
              }
            }
            let recommendations: string[] = []
            const rec = a.recommendations
            if (Array.isArray(rec)) {
              recommendations = rec.map(String)
            } else if (typeof rec === 'string') {
              try {
                const p = JSON.parse(rec) as unknown
                recommendations = Array.isArray(p) ? p.map(String) : []
              } catch {
                recommendations = []
              }
            }
            return {
              id: a.id as string,
              type: (a.type as string) || 'weather',
              severity: uiSev,
              title: (a.title as string) || '',
              message: (a.description as string) || '',
              region: counties[0] || 'Coast',
              county: counties[0] || '—',
              validFrom: String(a.start_time || ''),
              validUntil: String(a.end_time || ''),
              isActive: (a.status as string) === 'active',
              source: (a.source as string) || 'AquaLedger',
              recommendations,
            }
          }),
        )
      }
      setConditions([])
    } catch (error) {
      console.error('Failed to fetch climate data:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const severityBorder: Record<string, string> = {
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
    danger: 'border-l-orange-500',
    critical: 'border-l-red-500',
  }

  const getSafetyIcon = (status: string) => {
    if (status === 'safe') return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (status === 'caution') return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    return <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'danger').length
  const safeZones = conditions.filter(c => c.safetyStatus === 'safe').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <DashboardPageLayout
      title="Climate & Ocean Safety"
      description="Real-time weather alerts and ocean conditions for safe fishing"
      actions={
        <Button variant="outline" onClick={fetchClimateData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Active Alerts"
          value={alerts.length}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Critical Warnings"
          value={criticalAlerts}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 1, isPositive: false }}
        />
        <StatCard
          title="Safe Fishing Zones"
          value={safeZones}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 1, isPositive: true }}
        />
        <StatCard
          title="Regions Monitored"
          value={conditions.length}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Critical Alert Banner */}
      {criticalAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Critical Alert Active</h3>
                <p className="text-sm text-red-700">
                  {alerts.find(a => a.severity === 'critical' || a.severity === 'danger')?.title}
                </p>
              </div>
              <Button variant="destructive" size="sm">View Details</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="conditions">
        <TabsList>
          <TabsTrigger value="conditions">Ocean Conditions</TabsTrigger>
          <TabsTrigger value="alerts">Weather Alerts ({alerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {conditions.map((condition) => (
              <Card key={condition.region}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {condition.region}
                    </CardTitle>
                    <StatusBadge status={condition.safetyStatus} label={condition.safetyStatus.toUpperCase()} />
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last updated: {new Date(condition.lastUpdated).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Waves className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Wave Height</div>
                        <div className="font-semibold">{condition.waveHeight}m</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Wind className="h-5 w-5 text-cyan-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Wind Speed</div>
                        <div className="font-semibold">{condition.windSpeed} km/h {condition.windDirection}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Temperature</div>
                        <div className="font-semibold">{condition.temperature}°C</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {getSafetyIcon(condition.safetyStatus)}
                      <div>
                        <div className="text-sm text-muted-foreground">Visibility</div>
                        <div className="font-semibold">{condition.visibility}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current Strength: </span>
                      <span className="font-medium">{condition.currentStrength}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">No Active Alerts</h3>
                <p className="text-muted-foreground">All regions are currently safe for fishing</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${severityBorder[alert.severity] ?? 'border-l-muted'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <StatusBadge status={alert.severity} label={alert.severity.toUpperCase()} />
                      <CardTitle className="mt-2">{alert.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {alert.region}, {alert.county}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Valid until</div>
                      <div className="font-medium">
                        {new Date(alert.validUntil).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{alert.message}</p>
                  
                  {alert.recommendations.length > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Safety Recommendations:</h4>
                      <ul className="space-y-1">
                        {alert.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                    <span>Source: {alert.source}</span>
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Subscribe to Region
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* SMS Alert Signup */}
      <Card>
        <CardHeader>
          <CardTitle>Get Alerts via SMS/WhatsApp</CardTitle>
          <CardDescription>
            Receive critical weather warnings directly on your phone, even without internet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <p className="text-sm text-muted-foreground">
                To subscribe, send <strong>SUBSCRIBE</strong> to <strong>40567</strong> via SMS
                or message us on WhatsApp at <strong>+254 700 123 456</strong>
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">SMS</Badge>
                <Badge variant="outline">USSD *384#</Badge>
                <Badge variant="outline">WhatsApp</Badge>
              </div>
            </div>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
