'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CsvRow = Record<string, string | number | boolean | null | undefined>

interface ExportCsvButtonProps {
  data: CsvRow[]
  filename?: string
  columns?: { key: string; label: string }[]
  label?: string
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

function escapeCsvCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowsToCsv(data: CsvRow[], columns?: { key: string; label: string }[]): string {
  if (data.length === 0) return ''

  const keys = columns?.map((c) => c.key) ?? Object.keys(data[0])
  const header = (columns?.map((c) => c.label) ?? keys).map(escapeCsvCell).join(',')
  const rows = data.map((row) => keys.map((key) => escapeCsvCell(row[key])).join(','))
  return [header, ...rows].join('\n')
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ExportCsvButton({
  data,
  filename = 'export',
  columns,
  label = 'Export CSV',
  disabled,
  className,
  variant = 'outline',
  size = 'sm',
}: ExportCsvButtonProps) {
  const handleExport = () => {
    const csv = rowsToCsv(data, columns)
    if (!csv) return
    downloadCsv(csv, filename)
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      disabled={disabled || data.length === 0}
      onClick={handleExport}
    >
      <Download className="h-4 w-4" />
      {label}
    </Button>
  )
}
