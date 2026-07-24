"use client"

import { useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertCircle, Mail, Phone, Receipt, ShoppingCart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
import { clienteService } from "@/services/cliente-service"
import { pedidoService } from "@/services/pedido-service"
import type { Cliente } from "@/types/cliente.types"
import type { Pedido } from "@/types/pedido.types"
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function ClienteDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const clienteLoader = useCallback(() => clienteService.getClienteById(params.id), [params.id])
  const ordersLoader = useCallback(() => pedidoService.findAllByClientId(params.id), [params.id])

  const { data: cliente, loading: loadingCliente, error: clienteError } = useResource<Cliente>(clienteLoader)
  const { data: pedidos, loading: loadingPedidos } = useResource<Pedido[]>(ordersLoader)

  if (loadingCliente) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (clienteError || !cliente) {
    return (
      <div className="space-y-6">
        <DetailHeader backHref="/clientes" backLabel="Volver a clientes" title="Cliente no encontrado" />
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {clienteError?.message ?? "No se encontró el cliente solicitado."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName = cliente.user?.fullName || `Cliente ${cliente.dni}`
  const orderList = pedidos ?? []
  const totalGastado = orderList.reduce((sum, p) => sum + (p.subtotal ?? 0), 0)
  const pedidosEntregados = orderList.filter((p) => p.status === "entregado").length

  const stats: StatItem[] = [
    { label: "Pedidos totales", value: orderList.length, icon: ShoppingCart },
    { label: "Entregados", value: pedidosEntregados, tone: "success" },
    { label: "Gastado", value: formatCurrency(totalGastado), icon: Receipt, tone: "info" },
    {
      label: "Penalización",
      value: cliente.penalty,
      icon: AlertCircle,
      tone: cliente.penalty === 0 ? "success" : cliente.penalty > 5 ? "danger" : "warning",
    },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/clientes"
        backLabel="Volver a clientes"
        title={fullName}
        subtitle={`DNI ${cliente.dni}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                {cliente.user?.profilePicture && (
                  <AvatarImage src={cliente.user.profilePicture} alt={fullName} />
                )}
                <AvatarFallback className="bg-orange-500">{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-sm text-gray-400">DNI: {cliente.dni}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{cliente.user?.email ?? "Sin email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{cliente.user?.phoneNumber ?? "Sin teléfono"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsGrid stats={stats} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historial de pedidos</CardTitle>
          {orderList.length > 0 && (
            <span className="text-sm text-gray-400">{orderList.length} pedidos</span>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingPedidos ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : orderList.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Sin pedidos"
              description="Este cliente todavía no realizó pedidos."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList.map((pedido) => (
                  <TableRow key={pedido.orderId}>
                    <TableCell className="font-medium">#{pedido.orderId}</TableCell>
                    <TableCell>{formatDateTime(pedido.startTime)}</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[pedido.status]}>{estadoLabels[pedido.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(pedido.subtotal ?? 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/pedidos/${pedido.orderId}`)}
                      >
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
