'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface KanbanLead {
  id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: string
  estimated_value: number
  created_at: string
}

const STAGE_COLORS: Record<string, string> = {
  new: 'border-blue-200 bg-blue-50/80',
  contacted: 'border-amber-200 bg-amber-50/80',
  qualified: 'border-purple-200 bg-purple-50/80',
  won: 'border-green-200 bg-green-50/80',
  lost: 'border-red-200 bg-red-50/80',
}

interface LeadKanbanProps {
  leads: KanbanLead[]
  stages: readonly string[]
  stageLabel: (s: string) => string
  onStageChange: (leadId: string, stage: string) => Promise<void>
}

export function LeadKanban({ leads, stages, stageLabel, onStageChange }: LeadKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const byStage = useMemo(() => {
    const map: Record<string, KanbanLead[]> = {}
    for (const s of stages) map[s] = []
    for (const lead of leads) {
      const key = stages.includes(lead.stage) ? lead.stage : 'new'
      map[key].push(lead)
    }
    return map
  }, [leads, stages])

  const handleDrop = async (targetStage: string) => {
    if (!draggingId) return
    const lead = leads.find((l) => l.id === draggingId)
    setDraggingId(null)
    if (!lead || lead.stage === targetStage) return
    setBusyId(lead.id)
    try {
      await onStageChange(lead.id, targetStage)
    } finally {
      setBusyId(null)
    }
  }

  const formatKes = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stages.map((stage) => (
        <div
          key={stage}
          className={cn(
            'min-w-[220px] flex-1 rounded-lg border-2 border-dashed p-2 transition-colors',
            STAGE_COLORS[stage] ?? 'border-muted bg-muted/30',
            draggingId ? 'border-primary/40' : '',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDrop={(e) => {
            e.preventDefault()
            void handleDrop(stage)
          }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {stageLabel(stage)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {byStage[stage]?.length ?? 0}
            </Badge>
          </div>
          <div className="space-y-2 min-h-[120px]">
            {(byStage[stage] ?? []).map((lead) => (
              <div
                key={lead.id}
                draggable
                onDragStart={() => setDraggingId(lead.id)}
                onDragEnd={() => setDraggingId(null)}
                className={cn(
                  'cursor-grab rounded-md border bg-card p-3 shadow-sm active:cursor-grabbing',
                  busyId === lead.id && 'opacity-50 pointer-events-none',
                  draggingId === lead.id && 'ring-2 ring-primary',
                )}
              >
                <p className="font-medium text-sm leading-tight">{lead.name}</p>
                {lead.email && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{lead.email}</p>
                )}
                <p className="mt-2 text-xs font-medium text-foreground">{formatKes(Number(lead.estimated_value))}</p>
                {lead.source && (
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">{lead.source}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
