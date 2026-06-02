"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError } from "@/lib/api"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error)
  }, [error])

  const isApiError = error instanceof ApiError
  const friendlyMessage = isApiError && error.isNetworkError
    ? "No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté disponible."
    : "Ocurrió un error inesperado al procesar tu solicitud."

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Algo salió mal</CardTitle>
              <CardDescription>{friendlyMessage}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isApiError && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">Detalles técnicos</p>
              <p className="text-muted-foreground">
                {error.status === 0 ? "Sin respuesta" : `HTTP ${error.status}`} — {error.message}
              </p>
              <p className="text-muted-foreground">Endpoint: {error.endpoint}</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
              Ir al inicio
            </Button>
            <Button onClick={reset} className="bg-orange-600 hover:bg-orange-700 text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
