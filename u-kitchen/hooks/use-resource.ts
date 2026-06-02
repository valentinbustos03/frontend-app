"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/api"

interface UseResourceResult<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  refresh: () => Promise<void>
  setData: (next: T | null) => void
}

function toApiError(value: unknown): ApiError {
  if (value instanceof ApiError) return value
  if (value instanceof Error) return new ApiError(value.message, 0, "", value)
  return new ApiError("Unknown error", 0, "", value)
}

// `loader` puede ser una función inline que cambia en cada render.
// Lo guardamos en una ref para que `refresh` sea estable y disparemos el
// efecto solo cuando el loader pasa de null→fn o viceversa.
export function useResource<T>(
  loader: (() => Promise<T>) | null,
): UseResourceResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!loader)
  const [error, setError] = useState<ApiError | null>(null)

  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const refresh = useCallback(async () => {
    const current = loaderRef.current
    if (!current) return
    setLoading(true)
    setError(null)
    try {
      const result = await current()
      setData(result)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const enabled = loader !== null
  useEffect(() => {
    if (enabled) {
      refresh()
    } else {
      setLoading(false)
    }
  }, [enabled, refresh])

  return { data, loading, error, refresh, setData }
}
