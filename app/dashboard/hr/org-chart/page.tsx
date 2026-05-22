'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authFetchJson } from '@/lib/api'
import { Building2 } from 'lucide-react'

interface OrgNode {
  id: string
  name: string
  employees: { id: string; full_name: string; job_title: string | null }[]
  children: OrgNode[]
}

function OrgTree({ nodes }: { nodes: OrgNode[] }) {
  return (
    <ul className="ml-4 space-y-2">
      {nodes.map((n) => (
        <li key={n.id}>
          <p className="font-medium">{n.name}</p>
          {n.employees.map((e) => (
            <p key={e.id} className="text-sm text-muted-foreground ml-2">
              {e.full_name}{e.job_title ? ` · ${e.job_title}` : ''}
            </p>
          ))}
          {n.children.length > 0 && <OrgTree nodes={n.children} />}
        </li>
      ))}
    </ul>
  )
}

export default function OrgChartPage() {
  const [tree, setTree] = useState<OrgNode[]>([])

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: { orgChart: OrgNode[] } }>('/api/v2/hr/org-chart?chart=1').then(
      (res) => {
        if (res.success && res.data?.orgChart) setTree(res.data.orgChart)
      },
    )
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="h-8 w-8" />Org Chart</h1>
        <p className="text-muted-foreground">Departments and reporting structure</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
        <CardContent>
          {tree.length > 0 ? <OrgTree nodes={tree} /> : (
            <p className="text-muted-foreground">Create org units via API and assign employees to org_unit_id</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
