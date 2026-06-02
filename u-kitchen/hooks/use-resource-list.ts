"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/api"

interface UseResourceListResult<T> {
  items: T[]
  loading: boolean
  error: ApiError | null
  refresh: () => Promise<void>
  setItems: (updater: T[] | ((prev: T[]) => T[])) => void
}

interface UseResourceListOptions {
  autoLoad?: boolean
  onError?: (error: ApiError) => void
}

function toApiError(value: unknown): ApiError {
  if (value instanceof ApiError) return value
  if (value instanceof Error) return new ApiError(value.message, 0, "", value)
  return new ApiError("Unknown error", 0, "", value)
}

export function useResourceList<T>(
  loader: () => Promise<T[]>,
  options: UseResourceListOptions = {},
): UseResourceListResult<T> {
  const { autoLoad = true, onError } = options

  const [items, setItemsState] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(autoLoad)
  const [error, setError] = useState<ApiError | null>(null)

  // Mantenemos las referencias estables para evitar re-disparos no deseados.
  const loaderRef = useRef(loader)
  const onErrorRef = useRef(onError)
  loaderRef.current = loader
  onErrorRef.current = onError

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loaderRef.current()
      setItemsState(data)
    } catch (err) {
      const apiError = toApiError(err)
      setError(apiError)
      onErrorRef.current?.(apiError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoLoad) {
      refresh()
    }
  }, [autoLoad, refresh])

  return {
    items,
    loading,
    error,
    refresh,
    setItems: setItemsState,
  }
}
