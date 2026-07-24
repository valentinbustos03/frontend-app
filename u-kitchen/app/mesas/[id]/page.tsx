"use client"

import { useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, MapPin, Circle, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DetailHeader } from "@/components/shared/detail-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid"
import { useResource } from "@/hooks/use-resource"
import { useResourceList } from "@/hooks/use-resource-list"
import { mesaService } from "@/services/mesa-service"
import { pedidoService } from "@/services/pedido-service"
import type { Mesa } from "@/types/mesa.types"
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

export default function MesaDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const mesaLoader = useCallback(() => mesaService.getMesaById(params.id), [params.id])
  const { data: mesa, loading: loadingMesa, error } = useResource<Mesa>(mesaLoader)

  const pedidosLoader = useCallback(async () => {
    const response = await pedidoService.getPedidos()
    return response.data
  }, [])
  const { items: allPedidos, loading: loadingPedidos } = useResourceList<Pedido>(pedidosLoader)

  const pedidosMesa = useMemo(() => {
    if (!mesa) return []
    return allPedidos.filter((pedido) => pedido.table?.id === mesa.id)
  }, [allPedidos, mesa])

  const stats: StatItem[] = useMemo(() => {
    const total = pedidosMesa.length
    const activos = pedidosMesa.filter((p) => ACTIVE_ESTADOS.has(p.status)).length
    const ingresos = pedidosMesa
      .filter((p) => p.status === PedidoEstado.ENTREGADO)
      .reduce((sum, p) => sum + (p.subtotal ?? 0), 0)
    return [
      { label: "Pedidos totales", value: total, icon: ShoppingCart },
      { label: "Activos", value: activos, tone: activos > 0 ? "warning" : "default" },
      { label: "Capacidad", value: mesa?.capacity ?? 0, icon: Users },
      { label: "Ingresos", value: formatCurrency(ingresos), tone: "success" },
    ]
  }, [pedidosMesa, mesa])

  if (loadingMesa) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !mesa) {
    return (
      <div className="space-y-6">
        <DetailHeader backHref="/mesas" backLabel="Volver a mesas" title="Mesa no encontrada" />
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {error?.message ?? "No se encontró la mesa solicitada."}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/mesas"
        backLabel="Volver a mesas"
        title={`Mesa ${mesa.cod}`}
        subtitle={mesa.description || "Sin descripción"}
        actions={
          <Badge className={mesa.occupied ? "bg-red-500 text-white" : "bg-green-500 text-white"}>
            <Circle className="h-2 w-2 mr-1 fill-current" />
            {mesa.occupied ? "Ocupada" : "Libre"}
          </Badge>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" /> Capacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mesa.capacity}</p>
            <p className="text-sm text-gray-400">comensales máximo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" /> Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{mesa.sector}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mesa.occupied ? "Ocupada" : "Disponible"}</p>
            <p className="text-sm text-gray-400">{mesa.occupied ? "Mesa con pedido activo" : "Lista para asignar"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsGrid stats={stats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pedidos asociados</CardTitle>
          {!loadingPedidos && pedidosMesa.length > 0 && (
            <span className="text-sm text-gray-400">{pedidosMesa.length} pedidos</span>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingPedidos ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : pedidosMesa.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Sin pedidos"
              description="Esta mesa todavía no tuvo pedidos."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosMesa.map((pedido) => (
                  <TableRow key={pedido.orderId}>
                    <TableCell className="font-medium">#{pedido.orderId}</TableCell>
                    <TableCell>{pedido.client?.user?.fullName ?? `DNI ${pedido.client?.dni ?? "—"}`}</TableCell>
                    <TableCell>{formatDateTime(pedido.startTime)}</TableCell>
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
