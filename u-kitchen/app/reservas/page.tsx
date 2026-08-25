"use client"
import { useState, useEffect, useMemo } from "react"
import { Plus, Filter, MoreHorizontal, Edit, Trash2, Users, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { reservaService } from "@/services/reserva-service"
import { ApiError } from "@/lib/api"
import { reservaEstadoColors, reservaEstadoLabels } from "@/lib/catalogs"
import type { Reserva } from "@/types/reserva.types"
import { ReservaEstado } from "@/types/reserva.types"
import { ReservaFormModal } from "@/components/forms/reserva-form-modal"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { usePagination } from "@/hooks/use-pagination"

function formatDateTime(value: string) {
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

export default function ReservasPage() {
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [fechaFilter, setFechaFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState<Reserva | undefined>()

  useEffect(() => {
    loadReservas()
  }, [])

  const loadReservas = async () => {
    try {
      setLoading(true)
      setReservas(await reservaService.getReservas())
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredReservas = useMemo(() => {
    return reservas
      .filter((reserva) => {
        const matchesEstado = estadoFilter === "all" || reserva.status === estadoFilter
        const matchesFecha = !fechaFilter || reserva.dateTime.slice(0, 10) === fechaFilter
        return matchesEstado && matchesFecha
      })
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  }, [reservas, estadoFilter, fechaFilter])

  const { page, setPage, totalPages, pageItems } = usePagination(filteredReservas)

  const handleDeleteReserva = async (reserva: Reserva) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la reserva del ${formatDateTime(reserva.dateTime)}?`)) {
      return
    }
    try {
      await reservaService.deleteReserva(reserva.id)
      setReservas(reservas.filter((r) => r.id !== reserva.id))
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva",
        variant: "destructive",
      })
    }
  }

  // El PUT exige el objeto completo, así que reenviamos la reserva con el estado nuevo.
  const handleCambiarEstado = async (reserva: Reserva, status: ReservaEstado) => {
    try {
      const updated = await reservaService.updateReserva(reserva.id, {
        dateTime: reserva.dateTime,
        numberOfPeople: reserva.numberOfPeople,
        status,
        client: { id: reserva.client.id },
        table: { id: reserva.table.id },
      })
      setReservas(reservas.map((r) => (r.id === reserva.id ? updated : r)))
      toast({
        title: "Reserva actualizada",
        description: `La reserva ahora está ${reservaEstadoLabels[status].toLowerCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError && error.status === 409
            ? error.message
            : "No se pudo actualizar la reserva",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Reservas</h1>
          <p className="text-gray-600">Administra las reservas de mesas del restaurante</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Reservas</h1>
          <p className="text-gray-600">Administra las reservas de mesas del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setEditingReserva(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.values(ReservaEstado).map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {reservaEstadoLabels[estado]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={fechaFilter} onChange={(e) => setFechaFilter(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{reservas.length}</div>
            <p className="text-xs text-muted-foreground">Total Reservas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {reservas.filter((r) => r.status === ReservaEstado.PENDIENTE).length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {reservas.filter((r) => r.status === ReservaEstado.CONFIRMADA).length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {reservas
                .filter((r) => r.status === ReservaEstado.CONFIRMADA)
                .reduce((sum, r) => sum + r.numberOfPeople, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Personas Confirmadas</p>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>
                    <div className="font-medium text-orange-600">{formatDateTime(reserva.dateTime)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {reserva.client?.user?.fullName ?? "Sin nombre"}
                    </div>
                    <div className="text-xs text-gray-500">DNI {reserva.client?.dni}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{reserva.table?.cod}</div>
                    <div className="text-xs text-gray-500 capitalize">{reserva.table?.sector}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-400" />
                      {reserva.numberOfPeople}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={reservaEstadoColors[reserva.status]}>
                      {reservaEstadoLabels[reserva.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingReserva(reserva)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {reserva.status !== ReservaEstado.CONFIRMADA && (
                          <DropdownMenuItem
                            onClick={() => handleCambiarEstado(reserva, ReservaEstado.CONFIRMADA)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {reserva.status !== ReservaEstado.CANCELADA && (
                          <DropdownMenuItem
                            onClick={() => handleCambiarEstado(reserva, ReservaEstado.CANCELADA)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteReserva(reserva)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredReservas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron reservas</p>
            </div>
          )}

          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
      <ReservaFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reserva={editingReserva}
        onSuccess={loadReservas}
      />
    </div>
  )
}
