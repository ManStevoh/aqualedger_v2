'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { Bell, BarChart3, AlertCircle, CheckCircle2, Plus, Filter } from 'lucide-react'
import { authFetchJson } from '@/lib/api'

interface Notification {
  id: string
  type: 'alert' | 'info' | 'success' | 'warning'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { items: Record<string, unknown>[] }
      }>('/api/v2/notifications?limit=100')
      if (data.success && data.data?.items) {
        setNotifications(
          data.data.items.map((row) => {
            const t = (row.type as string) || 'info'
            const uiType: Notification['type'] =
              t === 'error' || t === 'alert' ? 'alert' : t === 'warning' ? 'warning' : t === 'success' ? 'success' : 'info'
            return {
              id: row.id as string,
              type: uiType,
              title: (row.title as string) || '',
              message: (row.message as string) || '',
              timestamp: String(row.created_at || ''),
              read: Boolean(row.is_read),
            }
          }),
        )
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'alerts') return notif.type === 'alert'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const alertCount = notifications.filter(n => n.type === 'alert').length
  const criticalAlerts = notifications.filter(n => n.type === 'alert' && !n.read).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">System alerts and messages</p>
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Notifications"
          value={notifications.length}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Unread"
          value={unreadCount}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Critical Alerts"
          value={criticalAlerts}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 1, isPositive: false }}
        />
        <StatCard
          title="All Alerts"
          value={alertCount}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>View and manage all system notifications</CardDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'alerts' ? 'default' : 'outline'}
              onClick={() => setFilter('alerts')}
            >
              Alerts ({alertCount})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                  notification.read
                    ? 'bg-muted/30 border-l-gray-300'
                    : 'bg-background border-l-blue-500'
                }`}
              >
                <div className="mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type.toUpperCase()}
                    </Badge>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                </div>
                <Button variant="ghost" size="sm">Dismiss</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
