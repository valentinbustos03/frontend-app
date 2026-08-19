"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { pedidoService } from "@/services/pedido-service"
import { facturaService } from "@/services/factura-service"
import { type Pedido, PedidoEstado } from "@/types/pedido.types"
import { estadoColors, estadoIcons, estadoLabels } from "@/lib/catalogs"

const PAYMENT_METHODS = ["Efectivo", "Tarjeta de débito", "Tarjeta de crédito", "Transferencia", "Mercado Pago"]

const ALLOWED_TRANSITIONS: Record<PedidoEstado, PedidoEstado[]> = {
  [PedidoEstado.PENDIENTE]: [PedidoEstado.EN_PREPARACION, PedidoEstado.RECHAZADO, PedidoEstado.CANCELADO],
  [PedidoEstado.EN_PREPARACION]: [PedidoEstado.LISTO, PedidoEstado.CANCELADO],
  [PedidoEstado.LISTO]: [PedidoEstado.ENTREGADO, PedidoEstado.CANCELADO],
  [PedidoEstado.ENTREGADO]: [],
  [PedidoEstado.CANCELADO]: [],
  [PedidoEstado.RECHAZADO]: [],
}

const TERMINAL_ESTADOS = new Set<PedidoEstado>([PedidoEstado.CANCELADO, PedidoEstado.RECHAZADO])

const ESTADO_ACTION_LABELS: Record<PedidoEstado, string> = {
  [PedidoEstado.PENDIENTE]: "Marcar como Pendiente",
  [PedidoEstado.EN_PREPARACION]: "Iniciar Preparación",
  [PedidoEstado.LISTO]: "Marcar como Listo",
  [PedidoEstado.ENTREGADO]: "Marcar como Entregado",
  [PedidoEstado.CANCELADO]: "Cancelar Pedido",
  [PedidoEstado.RECHAZADO]: "Rechazar Pedido",
}

const ESTADO_ACTION_ICONS: Record<PedidoEstado, typeof AlertCircle> = {
  [PedidoEstado.PENDIENTE]: AlertCircle,
  [PedidoEstado.EN_PREPARACION]: AlertCircle,
  [PedidoEstado.LISTO]: CheckCircle,
  [PedidoEstado.ENTREGADO]: CheckCircle,
  [PedidoEstado.CANCELADO]: XCircle,
  [PedidoEstado.RECHAZADO]: Ban,
}

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

export default function PedidoDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [pendingTerminal, setPendingTerminal] = useState<PedidoEstado | null>(null)
  const [pendingFactura, setPendingFactura] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const response = await pedidoService.getPedidoById(params.id)
        // Backend devuelve { message, data: Pedido } — ajustamos defensivamente.
        const data = (response as unknown as { data?: Pedido })?.data ?? response
        if (active) setPedido(data as Pedido)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el pedido",
          variant: "destructive",
        })
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [params.id, toast])

  const applyEstado = async (nuevoEstado: PedidoEstado) => {
    if (!pedido) return
    try {
      setUpdating(true)
      const updated = await pedidoService.updatePedidoEstado(pedido, nuevoEstado)
      setPedido(updated)
      toast({
        title: "Estado actualizado",
        description: `El pedido ahora está ${estadoLabels[nuevoEstado].toLowerCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleTransition = (estado: PedidoEstado) => {
    if (TERMINAL_ESTADOS.has(estado)) {
      setPendingTerminal(estado)
    } else {
      applyEstado(estado)
    }
  }

  const confirmTerminal = async () => {
    if (!pendingTerminal) return
    const estado = pendingTerminal
    setPendingTerminal(null)
    await applyEstado(estado)
  }

  const confirmFactura = async () => {
    if (!pedido) return
    try {
      setUpdating(true)
      const factura = await facturaService.createFactura(pedido.orderId, { paymentMethod })
      setPedido({ ...pedido, bill: factura })
      setPendingFactura(false)
      toast({
        title: "Factura generada",
        description: `Se generó la factura del pedido #${pedido.orderId}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la factura",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/pedidos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a pedidos
        </Button>
        <Card>
          <CardContent className="p-12 text-center text-gray-500">No se encontró el pedido solicitado.</CardContent>
        </Card>
      </div>
    )
  }

  const EstadoIcon = estadoIcons[pedido.status]
  const transitions = ALLOWED_TRANSITIONS[pedido.status] ?? []
  const total = pedido.orderItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.push("/pedidos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a pedidos
        </Button>
        {pedido.status === PedidoEstado.ENTREGADO && !pedido.bill && (
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => setPendingFactura(true)}
          >
            <Receipt className="mr-2 h-4 w-4" /> Generar factura
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Pedido #{pedido.orderId}</h1>
          <p className="text-gray-600">Detalle completo del pedido</p>
        </div>
        <div className="flex items-center gap-2">
          <EstadoIcon className="h-5 w-5" />
          <Badge className={estadoColors[pedido.status]}>{estadoLabels[pedido.status]}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{pedido.client?.user?.fullName ?? "Sin nombre"}</p>
            <p className="text-gray-500">{pedido.client?.user?.email ?? "Sin email"}</p>
            <p className="text-gray-500">DNI: {pedido.client?.dni ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mesa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {pedido.table ? (
              <>
                <p className="font-medium">Código {pedido.table.cod}</p>
                <p className="text-gray-500">Capacidad: {pedido.table.capacity}</p>
                <p className="text-gray-500">Sector: {pedido.table.sector}</p>
              </>
            ) : (
              <p className="text-gray-400">Sin mesa asignada</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mesero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {pedido.waiter ? (
              <>
                <p className="font-medium">{pedido.waiter.user?.fullName ?? "Sin nombre"}</p>
                <p className="text-gray-500">Turno: {pedido.waiter.shift}</p>
              </>
            ) : (
              <p className="text-gray-400">Sin asignar</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items del pedido</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plato</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedido.orderItems.map((item) => (
                <TableRow key={item.orderItemId}>
                  <TableCell>
                    <div className="font-medium">{item.dish.name}</div>
                    <div className="text-xs text-gray-500">#{item.dish.cod}</div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.dish.price)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.dish.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <div className="flex flex-col items-end gap-1 p-6">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{formatCurrency(pedido.subtotal || total)}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiempos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Inicio</span>
              <span>{formatDateTime(pedido.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimado</span>
              <span>{formatDateTime(pedido.estimatedEndTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cierre</span>
              <span>{formatDateTime(pedido.endTime)}</span>
            </div>
            {pedido.description && (
              <>
                <Separator className="my-2" />
                <div>
                  <p className="text-gray-500 mb-1">Descripción</p>
                  <p>{pedido.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transitions.length === 0 ? (
              <p className="text-sm text-gray-500">
                Este pedido está en estado terminal ({estadoLabels[pedido.status].toLowerCase()}). No hay transiciones disponibles.
              </p>
            ) : (
              transitions.map((estado) => {
                const Icon = ESTADO_ACTION_ICONS[estado]
                const isTerminal = TERMINAL_ESTADOS.has(estado)
                return (
                  <Button
                    key={estado}
                    variant={isTerminal ? "outline" : "default"}
                    className={
                      isTerminal
                        ? "w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                        : "w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
                    }
                    disabled={updating}
                    onClick={() => handleTransition(estado)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {ESTADO_ACTION_LABELS[estado]}
                  </Button>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingTerminal} onOpenChange={(open) => !open && setPendingTerminal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingTerminal === PedidoEstado.RECHAZADO ? "Rechazar pedido" : "Cancelar pedido"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTerminal
                ? `El pedido #${pedido.orderId} pasará a estado "${estadoLabels[pendingTerminal].toLowerCase()}". Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTerminal}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingFactura} onOpenChange={(open) => !open && setPendingFactura(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generar factura</AlertDialogTitle>
            <AlertDialogDescription>
              Se generará la factura del pedido #{pedido.orderId} por {formatCurrency(pedido.subtotal || total)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFactura}
              disabled={updating}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
