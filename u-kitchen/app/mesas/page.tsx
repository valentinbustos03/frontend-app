"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, Users, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { mesaService } from "@/services/mesa-service"
import type { Mesa } from "@/types"
import { MesaFormModal } from "@/components/forms/mesa-form-modal"

export default function MesasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)
  const [capacidadFilter, setCapacidadFilter] = useState<string>("all")
  const [ocupadaFilter, setOcupadaFilter] = useState<string>("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMesa, setEditingMesa] = useState<Mesa | undefined>()

  useEffect(() => {
    loadMesas()
  }, [])

  const loadMesas = async () => {
    try {
      setLoading(true)
      const response = await mesaService.getMesas()
      setMesas(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las mesas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMesas = useMemo(() => {
    return mesas.filter((mesa) => {
      const matchesCapacidad = capacidadFilter === "all" || mesa.capacity.toString() === capacidadFilter
      const matchesOcupada =
        ocupadaFilter === "all" ||
        (ocupadaFilter === "ocupada" && mesa.occupied) ||
        (ocupadaFilter === "libre" && !mesa.occupied)
      const matchesSector = sectorFilter === "all" || mesa.sector === sectorFilter
      return matchesCapacidad && matchesOcupada && matchesSector
    })
  }, [mesas, capacidadFilter, ocupadaFilter, sectorFilter])

  const handleDeleteMesa = async (mesa: Mesa) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la mesa ${mesa.cod}?`)) {
      try {
        await mesaService.deleteMesa(mesa.id)
        setMesas(mesas.filter((m) => m.id !== mesa.id))
        toast({
          title: "Mesa eliminada",
          description: "La mesa ha sido eliminada exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la mesa",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleOcupada = async (mesa: Mesa) => {
    try {
      const updatedMesa = await mesaService.toggleOcupada(mesa)
      setMesas(mesas.map((m) => (m.id === mesa.id ? updatedMesa.data : m)))
      toast({
        title: "Estado actualizado",
        description: `La mesa ${mesa.cod} ahora está ${updatedMesa.data.occupied ? "ocupada" : "libre"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la mesa",
        variant: "destructive",
      })
    }
  }

  const getCapacidadBadge = (capacity: number) => {
    if (capacity <= 2) {
      return <Badge className="bg-blue-100 text-blue-800">{capacity} personas</Badge>
    } else if (capacity <= 4) {
      return <Badge className="bg-green-100 text-green-800">{capacity} personas</Badge>
    } else {
      return <Badge className="bg-purple-100 text-purple-800">{capacity} personas</Badge>
    }
  }

  const uniqueSectors = useMemo(() => {
    return [...new Set(mesas.map(m => m.sector))]
  }, [mesas])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Mesas</h1>
            <p className="text-gray-600">Administra las mesas del restaurante y su disponibilidad</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Mesas</h1>
          <p className="text-gray-600">Administra las mesas del restaurante y su disponibilidad</p>
        </div>
        <Button
          onClick={() => {
            setEditingMesa(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Mesa
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
            <Select value={capacidadFilter} onValueChange={setCapacidadFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Capacidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las capacidades</SelectItem>
                <SelectItem value="2">2 personas</SelectItem>
                <SelectItem value="4">4 personas</SelectItem>
                <SelectItem value="6">6 personas</SelectItem>
                <SelectItem value="8">8 personas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ocupadaFilter} onValueChange={setOcupadaFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="libre">Mesas libres</SelectItem>
                <SelectItem value="ocupada">Mesas ocupadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {uniqueSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector?.charAt(0)?.toUpperCase() + sector.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mesas.length}</div>
            <p className="text-xs text-muted-foreground">Total Mesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{mesas.filter((m) => !m.occupied).length}</div>
            <p className="text-xs text-muted-foreground">Mesas Libres</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{mesas.filter((m) => m.occupied).length}</div>
            <p className="text-xs text-muted-foreground">Mesas Ocupadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mesas.reduce((sum, m) => sum + m.capacity, 0)}</div>
            <p className="text-xs text-muted-foreground">Capacidad Total</p>
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
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMesas.map((mesa) => (
                <TableRow key={mesa.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium text-orange-600">{mesa.cod}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-400" />
                      {getCapacidadBadge(mesa.capacity)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {mesa.occupied ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          <Badge className="bg-red-100 text-red-800">Ocupada</Badge>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <Badge className="bg-green-100 text-green-800">Libre</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{mesa.description || "Sin descripción"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm capitalize">{mesa.sector}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/mesas/${mesa.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingMesa(mesa)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleOcupada(mesa)}>
                          {mesa.occupied ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Libre
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Marcar como Ocupada
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteMesa(mesa)} className="text-red-600">
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
          {filteredMesas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron mesas</p>
            </div>
          )}
        </CardContent>
      </Card>
      <MesaFormModal open={modalOpen} onOpenChange={setModalOpen} mesa={editingMesa} onSuccess={loadMesas} />
    </div>
  )
}