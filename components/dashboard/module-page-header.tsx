import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

export interface BreadcrumbItemDef {
  label: string
  href?: string
}

interface ModulePageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItemDef[]
  actions?: React.ReactNode
  className?: string
}

export function ModulePageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: ModulePageHeaderProps) {
  return (
    <div className={cn('mb-6 space-y-3 sm:mb-8 sm:space-y-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="overflow-x-auto">
          <BreadcrumbList className="flex-nowrap whitespace-nowrap">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <span key={`${crumb.label}-${index}`} className="contents">
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </span>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-primary/40" aria-hidden />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}
