"use client"

import { useState, type FormEvent } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api"

interface QuickFindByCodeProps<T> {
  label: string
  placeholder: string
  fetcher: (value: string) => Promise<T>
  onFound: (item: T) => void
  notFoundMessage?: string
}

export function QuickFindByCode<T>({
  label,
  placeholder,
  fetcher,
  onFound,
  notFoundMessage = "No se encontró ningún resultado",
}: QuickFindByCodeProps<T>) {
  const { toast } = useToast()
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const result = await fetcher(trimmed)
      onFound(result)
      setValue("")
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 404
          ? notFoundMessage
          : error instanceof ApiError
            ? error.message
            : notFoundMessage
      toast({ title: "Búsqueda", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="pl-8 w-[220px]"
          aria-label={label}
        />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={loading || !value.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ir"}
      </Button>
    </form>
  )
}
