"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Receipt, Clock as ClockIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid"
import { useToast } from "@/hooks/use-toast"
import { useResourceList } from "@/hooks/use-resource-list"
import { useAuth } from "@/hooks/use-auth"
import { pedidoService } from "@/services/pedido-service"
import type { Pedido } from "@/types/pedido.types"
import { PedidoEstado } from "@/types/pedido.types"
import { estadoColors, estadoLabels } from "@/lib/catalogs"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "ARS" }).format(amount)
}

function formatDateTime(value: Date | string | undefined | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const ACTIVE_ESTADOS = new Set<PedidoEstado>([
  PedidoEstado.PENDIENTE,
  PedidoEstado.EN_PREPARACION,
  PedidoEstado.LISTO,
])

export default function MisPedidosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isCliente, loading: loadingAuth } = useAuth()
  const clientId = user?.client?.id

  const loader = useCallback(async () => {
    if (!clientId) return []
    return pedidoService.findAllByClientId(clientId)
  }, [clientId])

  const { items: pedidos, loading } = useResourceList<Pedido>(loader, {
    autoLoad: !!clientId,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar tus pedidos",
        variant: "destructive",
      })
    },
  })

  const stats: StatItem[] = useMemo(() => {
    const activos = pedidos.filter((p) => ACTIVE_ESTADOS.has(p.status)).length
    const entregados = pedidos.filter((p) => p.status === PedidoEstado.ENTREGADO).length
    const gastado = pedidos
      .filter((p) => p.status === PedidoEstado.ENTREGADO)
      .reduce((sum, p) => sum + (p.subtotal ?? 0), 0)
    return [
      { label: "Pedidos totales", value: pedidos.length, icon: ShoppingCart },
      { label: "En curso", value: activos, icon: ClockIcon, tone: activos > 0 ? "warning" : "default" },
      { label: "Entregados", value: entregados, tone: "success" },
      { label: "Gastado", value: formatCurrency(gastado), icon: Receipt, tone: "info" },
    ]
  }, [pedidos])

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    )
  }

  if (!isCliente || !clientId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Mis Pedidos</h1>
          <p className="text-gray-400">Esta sección está disponible para clientes registrados.</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={ShoppingCart}
              title="No estás logueado como cliente"
              description="Iniciá sesión con una cuenta de cliente para ver tus pedidos."
              action={
                <Button onClick={() => router.push("/")} className="bg-orange-600 hover:bg-orange-700">
                  Ir al inicio
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Mis Pedidos</h1>
          <p className="text-gray-400">Hola {user?.fullName}, revisá el estado de tus pedidos.</p>
        </div>
        <Button onClick={() => router.push("/menu")} className="bg-orange-600 hover:bg-orange-700 text-white">
          Hacer un pedido
        </Button>
      </div>

      <StatsGrid stats={stats} />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : pedidos.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Aún no tenés pedidos"
              description="Cuando hagas tu primer pedido, va a aparecer acá."
              action={
                <Button onClick={() => router.push("/menu")} className="bg-orange-600 hover:bg-orange-700">
                  Ver menú
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.orderId}>
                    <TableCell className="font-medium">#{pedido.orderId}</TableCell>
                    <TableCell>{formatDateTime(pedido.startTime)}</TableCell>
                    <TableCell>{pedido.table?.cod ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[pedido.status]}>{estadoLabels[pedido.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(pedido.subtotal ?? 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/pedidos/${pedido.orderId}`)}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
