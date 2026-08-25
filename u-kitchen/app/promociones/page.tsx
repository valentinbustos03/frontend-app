"use client"
import { useState, useEffect, useMemo } from "react"
import { Plus, Filter, MoreHorizontal, Edit, Trash2, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { promocionService } from "@/services/promocion-service"
import { estaVigente } from "@/lib/promociones"
import type { Promocion } from "@/types/promocion.types"
import { PromocionFormModal } from "@/components/forms/promocion-form-modal"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { usePagination } from "@/hooks/use-pagination"

function formatDate(value: string) {
  const date = new Date(value)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("es-ES")
}

export default function PromocionesPage() {
  const { toast } = useToast()
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPromocion, setEditingPromocion] = useState<Promocion | undefined>()

  useEffect(() => {
    loadPromociones()
  }, [])

  const loadPromociones = async () => {
    try {
      setLoading(true)
      setPromociones(await promocionService.getPromociones())
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las promociones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPromociones = useMemo(() => {
    return promociones.filter((promocion) => {
      const matchesSearch =
        !searchTerm ||
        promocion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promocion.cod.toLowerCase().includes(searchTerm.toLowerCase())
      const vigente = estaVigente(promocion)
      const matchesEstado =
        estadoFilter === "all" ||
        (estadoFilter === "vigente" && vigente) ||
        (estadoFilter === "programada" && promocion.active && !vigente) ||
        (estadoFilter === "inactiva" && !promocion.active)
      return matchesSearch && matchesEstado
    })
  }, [promociones, searchTerm, estadoFilter])

  const { page, setPage, totalPages, pageItems } = usePagination(filteredPromociones)

  const handleDeletePromocion = async (promocion: Promocion) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la promoción ${promocion.cod}?`)) {
      return
    }
    try {
      await promocionService.deletePromocion(promocion.id)
      setPromociones(promociones.filter((p) => p.id !== promocion.id))
      toast({
        title: "Promoción eliminada",
        description: "La promoción ha sido eliminada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción",
        variant: "destructive",
      })
    }
  }

  const getEstadoBadge = (promocion: Promocion) => {
    if (!promocion.active) {
      return <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
    }
    if (estaVigente(promocion)) {
      return <Badge className="bg-green-100 text-green-800">Vigente</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Fuera de fecha</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Promociones</h1>
          <p className="text-gray-600">Administra los descuentos que se aplican a los platos</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Promociones</h1>
          <p className="text-gray-600">Administra los descuentos que se aplican a los platos</p>
          <p className="text-xs text-gray-500">
            El descuento lo aplica el backend al calcular el subtotal del pedido.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPromocion(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Promoción
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
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="vigente">Vigentes</SelectItem>
                <SelectItem value="programada">Activas fuera de fecha</SelectItem>
                <SelectItem value="inactiva">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{promociones.length}</div>
            <p className="text-xs text-muted-foreground">Total Promociones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {promociones.filter((p) => estaVigente(p)).length}
            </div>
            <p className="text-xs text-muted-foreground">Vigentes Hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {promociones.filter((p) => estaVigente(p)).reduce((max, p) => Math.max(max, p.discountPercentage), 0)}%
            </div>
            <p className="text-xs text-muted-foreground">Mayor Descuento Vigente</p>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Platos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((promocion) => (
                <TableRow key={promocion.id}>
                  <TableCell>
                    <div className="font-medium text-orange-600">{promocion.cod}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{promocion.name}</div>
                    {promocion.description && (
                      <div className="text-xs text-gray-500">{promocion.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-semibold">
                      <Percent className="mr-1 h-4 w-4 text-gray-400" />
                      {promocion.discountPercentage}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(promocion.dateFrom)} — {formatDate(promocion.dateTo)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {promocion.dishes?.length > 0 ? (
                        <div>
                          <div className="font-medium">{promocion.dishes[0].name}</div>
                          {promocion.dishes.length > 1 && (
                            <div className="text-gray-500">+{promocion.dishes.length - 1} más</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin platos</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getEstadoBadge(promocion)}</TableCell>
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
                            setEditingPromocion(promocion)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePromocion(promocion)}
                          className="text-red-600"
                        >
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
          {filteredPromociones.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron promociones</p>
            </div>
          )}

          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
      <PromocionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        promocion={editingPromocion}
        onSuccess={loadPromociones}
      />
    </div>
  )
}
