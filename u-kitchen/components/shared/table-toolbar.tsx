"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TableToolbarProps {
  title?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  resultCount?: number
  totalCount?: number
  filters?: React.ReactNode
  className?: string
}

export function TableToolbar({
  title = "Filtros",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  resultCount,
  totalCount,
  filters,
  className,
}: TableToolbarProps) {
  const showSearch = onSearchChange !== undefined
  const showCount = resultCount !== undefined && totalCount !== undefined

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {showCount && (
            <span className="text-xs text-muted-foreground">
              {resultCount} de {totalCount}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", !showSearch && "sm:items-start")}>
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap gap-2">{filters}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
