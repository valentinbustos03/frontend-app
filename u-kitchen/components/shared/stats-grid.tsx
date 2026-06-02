import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatItem {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: string
  tone?: "default" | "warning" | "success" | "danger" | "info"
}

const toneClasses: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "",
  warning: "text-yellow-600",
  success: "text-green-600",
  danger: "text-red-600",
  info: "text-blue-600",
}

interface StatsGridProps {
  stats: StatItem[]
  className?: string
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        stats.length >= 5
          ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={cn("text-2xl font-bold", toneClasses[stat.tone ?? "default"])}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {stat.hint && <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>}
                </div>
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
