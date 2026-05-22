'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { ModulePageHeader, type BreadcrumbItemDef } from '@/components/dashboard/module-page-header'
import { WorkspaceNav } from '@/components/dashboard/workspace-nav'
import type { WorkspaceNavItem } from '@/components/dashboard/workspace-nav'

export interface ObjectPageTab {
  id: string
  label: string
  content: React.ReactNode
}

interface ObjectPageShellProps {
  title: string
  subtitle?: string
  status?: string
  breadcrumbs: BreadcrumbItemDef[]
  backHref: string
  actions?: React.ReactNode
  workspaceNav?: WorkspaceNavItem[] | null
  tabs: ObjectPageTab[]
  defaultTab?: string
  footer?: React.ReactNode
}

export function ObjectPageShell({
  title,
  subtitle,
  status,
  breadcrumbs,
  backHref,
  actions,
  workspaceNav,
  tabs,
  defaultTab,
  footer,
}: ObjectPageShellProps) {
  const initialTab = defaultTab ?? tabs[0]?.id

  return (
    <div className="space-y-6">
      {workspaceNav && workspaceNav.length > 0 && <WorkspaceNav items={workspaceNav} />}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <ModulePageHeader
        title={title}
        description={subtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {status && <StatusBadge status={status} />}
            {actions}
          </div>
        }
      />

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="rounded-md">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {footer}
    </div>
  )
}
