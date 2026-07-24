"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DetailHeaderProps {
  backHref: string
  backLabel?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function DetailHeader({ backHref, backLabel = "Volver", title, subtitle, actions }: DetailHeaderProps) {
  const router = useRouter()
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push(backHref)} className="text-gray-300 hover:text-white">
        <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">{title}</h1>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}
