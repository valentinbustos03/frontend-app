"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { platoService } from "@/services/plato-service"
import type { Plato } from "@/types"
import { PlatoFormModal } from "@/components/forms/plato-form-modal"

export default function PlatosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [platos, setPlatos] = useState<Plato[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [precioMin, setPrecioMin] = useState("")
  const [precioMax, setPrecioMax] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlato, setEditingPlato] = useState<Plato | undefined>()

  useEffect(() => {
    loadPlatos()
  }, [])

  const loadPlatos = async () => {
    try {
      setLoading(true)
      const response = await platoService.getPlatos()
      setPlatos(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los platos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPlatos = useMemo(() => {
    return platos.filter((plato) => {
      const matchesSearch =
        searchTerm === "" ||
        plato.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plato.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plato.cod.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrecioMin = !precioMin || plato.price >= Number(precioMin)
      const matchesPrecioMax = !precioMax || plato.price <= Number(precioMax)
      return matchesSearch && matchesPrecioMin && matchesPrecioMax
    })
  }, [platos, searchTerm, precioMin, precioMax])

  const handleDeletePlato = async (plato: Plato) => {
    if (confirm(`¿Estás seguro de que deseas eliminar ${plato.name}?`)) {
      try {
        await platoService.deletePlato(plato.id)
        setPlatos(platos.filter((p) => p.id !== plato.id))
        toast({
          title: "Plato eliminado",
          description: "El plato ha sido eliminado exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el plato",
          variant: "destructive",
        })
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const getCalificacionStars = (calification: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(calification) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Platos</h1>
            <p className="text-gray-600">Administra el menú y platos del restaurante</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Platos</h1>
          <p className="text-gray-600">Administra el menú y platos del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setEditingPlato(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Plato
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="number"
              placeholder="Precio mínimo"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Precio máximo"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{platos.length}</div>
            <p className="text-xs text-muted-foreground">Total Platos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(platos.reduce((sum, p) => sum + p.price, 0) / platos.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Precio Promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {(platos.reduce((sum, p) => sum + (p.calification || 0), 0) / platos.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Calificación Promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{platos.filter((p) => (p.calification || 0) >= 4).length}</div>
            <p className="text-xs text-muted-foreground">Platos 4+ Estrellas</p>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plato</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Ingredientes</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlatos.map((plato) => (
                <TableRow key={plato.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={plato.picture || "/placeholder.svg?height=40&width=40"}
                        alt={plato.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-orange-600">{plato.name}</div>
                        <div className="text-sm text-gray-500">{plato.cod}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">{formatCurrency(plato.price)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getCalificacionStars(plato.calification || 0)}
                      <span className="ml-2 text-sm text-gray-600">({plato.calification || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plato.ingredients.length > 0 ? (
                        <div>
                          <div className="font-medium">{plato.ingredients[0].name}</div>
                          {plato.ingredients.length > 1 && (
                            <div className="text-gray-500">+{plato.ingredients.length - 1} más</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin ingredientes</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm capitalize">{plato.tag}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={true} onClick={() => router.push(`/platos/${plato.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingPlato(plato)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePlato(plato)} className="text-red-600">
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
          {filteredPlatos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron platos</p>
            </div>
          )}
        </CardContent>
      </Card>
      <PlatoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        plato={editingPlato}
        onSuccess={loadPlatos}
      />
    </div>
  )
}