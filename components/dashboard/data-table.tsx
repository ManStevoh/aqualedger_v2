'use client'

import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/dashboard/empty-state'
import {
  TablePagination,
  paginateItems,
  PAGE_SIZE_OPTIONS,
} from '@/components/dashboard/table-pagination'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell?: (item: T) => React.ReactNode
  className?: string
}

export type TableDensity = 'comfortable' | 'compact'

interface DataTableProps<T extends object> {
  title?: string
  description?: string
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  /** @deprecated Use emptyState props */
  emptyMessage?: string
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  emptyActionHref?: string
  onEmptyAction?: () => void
  actions?: React.ReactNode
  /** Client-side pagination */
  paginate?: boolean
  pageSize?: number
  /** Server-side pagination */
  page?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  density?: TableDensity
  stickyHeader?: boolean
  getRowId?: (item: T, index: number) => string
  onRowClick?: (item: T) => void
}

const SKELETON_ROWS = 8

export function DataTable<T extends object>({
  title,
  description,
  columns,
  data,
  loading = false,
  emptyMessage,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
  onEmptyAction,
  actions,
  paginate = false,
  pageSize: initialPageSize = 25,
  page: controlledPage,
  total: controlledTotal,
  onPageChange,
  onPageSizeChange,
  density = 'comfortable',
  stickyHeader = true,
  getRowId,
  onRowClick,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize)

  const page = controlledPage ?? internalPage
  const pageSize = onPageSizeChange ? initialPageSize : internalPageSize
  const setPage = onPageChange ?? setInternalPage
  const setPageSize = onPageSizeChange ?? setInternalPageSize

  const displayData = useMemo(() => {
    if (!paginate || onPageChange) return data
    return paginateItems(data, page, pageSize)
  }, [data, paginate, page, pageSize, onPageChange])

  const total = controlledTotal ?? data.length
  const rowClass = density === 'compact' ? 'h-10' : undefined
  const cellClass = density === 'compact' ? 'py-2' : undefined

  const emptyTitleResolved = emptyTitle ?? 'No records'
  const emptyDescResolved =
    emptyDescription ?? emptyMessage ?? 'There is nothing to show yet.'

  if (loading) {
    return (
      <Card>
        {title && (
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32" />
              {description && <Skeleton className="mt-1 h-4 w-48" />}
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  const showPagination =
    paginate && total > 0 && (onPageChange || data.length > pageSize)

  return (
    <Card>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          emptyIcon ? (
            <EmptyState
              icon={emptyIcon}
              title={emptyTitleResolved}
              description={emptyDescResolved}
              actionLabel={emptyActionLabel}
              actionHref={emptyActionHref}
              onAction={onEmptyAction}
            />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">{emptyDescResolved}</p>
          )
        ) : (
          <div
            className={cn(
              'rounded-md border',
              stickyHeader && 'max-h-[min(70vh,720px)] overflow-auto',
            )}
          >
            <Table>
              <TableHeader
                className={cn(stickyHeader && 'sticky top-0 z-10 bg-card shadow-sm')}
              >
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item, index) => {
                  const rowKey = getRowId?.(item, index) ?? String(index)
                  return (
                    <TableRow
                      key={rowKey}
                      className={cn(rowClass, onRowClick && 'cursor-pointer hover:bg-muted/50')}
                      onClick={onRowClick ? () => onRowClick(item) : undefined}
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key} className={cn(col.className, cellClass)}>
                          {col.cell
                            ? col.cell(item)
                            : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {showPagination && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export { PAGE_SIZE_OPTIONS }
