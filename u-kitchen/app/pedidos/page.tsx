"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter, MoreHorizontal, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { pedidoService } from "@/services/pedido-service"
import { type Pedido, PedidoEstado } from "@/types"

type EstadoLabel = Record<PedidoEstado, string>;

const estadoLabels: EstadoLabel = {
  [PedidoEstado.PENDIENTE]: "Pendiente",
  [PedidoEstado.EN_PREPARACION]: "En Preparación",
  [PedidoEstado.LISTO]: "Listo",
  [PedidoEstado.ENTREGADO]: "Entregado",
  [PedidoEstado.CANCELADO]: "Cancelado",
  [PedidoEstado.RECHAZADO]: "Rechazado",
};

const estadoColors = {
  [PedidoEstado.PENDIENTE]: "bg-yellow-100 text-yellow-800",
  [PedidoEstado.EN_PREPARACION]: "bg-blue-100 text-blue-800",
  [PedidoEstado.LISTO]: "bg-green-100 text-green-800",
  [PedidoEstado.ENTREGADO]: "bg-gray-100 text-gray-800",
  [PedidoEstado.CANCELADO]: "bg-red-100 text-red-800",
  [PedidoEstado.RECHAZADO]: "bg-red-100 text-red-800",
}

const estadoIcons = {
  [PedidoEstado.PENDIENTE]: Clock,
  [PedidoEstado.EN_PREPARACION]: AlertCircle,
  [PedidoEstado.LISTO]: CheckCircle,
  [PedidoEstado.ENTREGADO]: CheckCircle,
  [PedidoEstado.CANCELADO]: XCircle,
  [PedidoEstado.RECHAZADO]: XCircle,
}

export default function PedidosPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  useEffect(() => {
    loadPedidos()
  }, [])

  const loadPedidos = async () => {
    try {
      setLoading(true)
      const response = await pedidoService.getPedidos()
      setPedidos(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const matchesEstado = estadoFilter === "all" || pedido.status === estadoFilter

      const matchesFechaDesde = !fechaDesde || new Date(pedido.startTime) >= new Date(fechaDesde)

      const matchesFechaHasta = !fechaHasta || new Date(pedido.startTime) <= new Date(fechaHasta + "T23:59:59")

      return matchesEstado && matchesFechaDesde && matchesFechaHasta
    })
  }, [pedidos, estadoFilter, fechaDesde, fechaHasta])

  const handleUpdateEstado = async (pedido: Pedido, nuevoEstado: PedidoEstado) => { 
    try {
      const newPedido = {pedido, ...{status: nuevoEstado}}
      const updatedPedido = await pedidoService.updatePedido(pedido.orderId, newPedido)
      setPedidos(pedidos.map((p) => (p.orderId === pedido.orderId ? updatedPedido : p)))
      toast({
        title: "Estado actualizado",
        description: `El pedido ${pedido.orderId} ahora está ${estadoLabels[nuevoEstado].toLowerCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el status del pedido",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const getEstadoIcon = (status: PedidoEstado) => {
    const Icon = estadoIcons[status]
    return <Icon className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Pedidos</h1>
          <p className="text-gray-600">Administra todos los pedidos del restaurante</p>
        </div>
      </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Pedidos</h1>
          <p className="text-gray-600">Administra todos los pedidos del restaurante</p>
        </div>
        <Button disabled={true} className="text-white bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(estadoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Fecha desde"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />

            <Input
              type="date"
              placeholder="Fecha hasta"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{pedidos.length}</div>
            <p className="text-xs text-muted-foreground">Total Pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {pedidos.filter((p) => p.status === PedidoEstado.PENDIENTE).length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {pedidos.filter((p) => p.status === PedidoEstado.EN_PREPARACION).length}
            </div>
            <p className="text-xs text-muted-foreground">En Preparación</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {pedidos.filter((p) => p.status === PedidoEstado.LISTO).length}
            </div>
            <p className="text-xs text-muted-foreground">Listos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{formatCurrency(pedidos.reduce((sum, p) => sum + p.subtotal, 0))}</div>
            <p className="text-xs text-muted-foreground">Total Ventas</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Mesero</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPedidos.map((pedido) => (
                <TableRow key={pedido.orderId}>
                  <TableCell>
                    <div className="font-medium text-orange-600">#{pedido.orderId}</div>
                    <div className="text-sm text-gray-500">{pedido.orderItems.length} productos</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{pedido.client?.user?.fullName || "Cliente sin nombre"}</div>
                    <div className="text-sm text-gray-500">{pedido.client?.user?.email || "Sin email"}</div>
                  </TableCell>
                  <TableCell>
                    {pedido.table ? (
                      <Badge variant="outline">{pedido.table.cod}</Badge>
                    ) : (
                      <span className="text-gray-400">Sin mesa</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pedido.waiter ? (
                      <div className="text-sm">{pedido.waiter.user?.fullName || "Mesero sin nombre"}</div>
                    ) : (
                      <span className="text-gray-400">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getEstadoIcon(pedido.status)}
                      <Badge className={`ml-2 ${estadoColors[pedido.status]}`}>{estadoLabels[pedido.status]}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(pedido.subtotal)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(pedido.startTime).toLocaleDateString("es-ES")}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(pedido.startTime).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={true} onClick={() => router.push(`/pedidos/${pedido.orderId}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        {pedido.status === PedidoEstado.PENDIENTE && (
                          <DropdownMenuItem disabled={true} onClick={() => handleUpdateEstado(pedido, PedidoEstado.EN_PREPARACION)}>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Iniciar Preparación
                          </DropdownMenuItem>
                        )}
                        {pedido.status === PedidoEstado.EN_PREPARACION && (
                          <DropdownMenuItem disabled={true} onClick={() => handleUpdateEstado(pedido, PedidoEstado.LISTO)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Listo
                          </DropdownMenuItem>
                        )}
                        {pedido.status === PedidoEstado.LISTO && (
                          <DropdownMenuItem disabled={true} onClick={() => handleUpdateEstado(pedido, PedidoEstado.ENTREGADO)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Entregado
                          </DropdownMenuItem>
                        )}
                        {pedido.status !== PedidoEstado.CANCELADO && pedido.status !== PedidoEstado.ENTREGADO && (
                          <DropdownMenuItem
                            disabled={true}
                            onClick={() => handleUpdateEstado(pedido, PedidoEstado.CANCELADO)}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar Pedido
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPedidos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron pedidos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}