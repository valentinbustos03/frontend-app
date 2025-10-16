"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ingredienteService } from "@/services/ingrediente-service"
import { type Ingrediente, UnidadMedida } from "@/types"
import { IngredienteFormModal } from "@/components/forms/ingrediente-form-modal"

const unidadMedidaLabels: { [key in UnidadMedida]: string } = {
  [UnidadMedida.KILOGRAMOS]: "kg",
  [UnidadMedida.GRAMOS]: "g",
  [UnidadMedida.LITROS]: "lt",
  [UnidadMedida.MILILITROS]: "ml",
  [UnidadMedida.UNIDADES]: "unidades",
  [UnidadMedida.PIEZAS]: "piezas",
  [UnidadMedida.ONZAS]: "oz",
  [UnidadMedida.LIBRAS]: "lb",
  [UnidadMedida.GALONES]: "gal",
  [UnidadMedida.CUARTOS]: "qt",
}

export default function IngredientesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stockBajoFilter, setStockBajoFilter] = useState<string>("all")
  const [unidadMedidaFilter, setUnidadMedidaFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | undefined>()

  useEffect(() => {
    loadIngredientes()
  }, [])

  const loadIngredientes = async () => {
    try {
      setLoading(true)
      const response = await ingredienteService.getIngredientes()
      setIngredientes(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los ingredientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredIngredientes = useMemo(() => {
    return ingredientes.filter((ingrediente) => {
      const matchesSearch =
        searchTerm === "" ||
        ingrediente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingrediente.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingrediente.cod.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStockBajo =
        stockBajoFilter === "all" ||
        (stockBajoFilter === "bajo" && ingrediente.stock <= ingrediente.stockLimit) ||
        (stockBajoFilter === "normal" && ingrediente.stock > ingrediente.stockLimit)
      const matchesUnidadMedida = unidadMedidaFilter === "all" || ingrediente.uniteOfMeasure === unidadMedidaFilter
      return matchesSearch && matchesStockBajo && matchesUnidadMedida
    })
  }, [ingredientes, searchTerm, stockBajoFilter, unidadMedidaFilter])

  const handleDeleteIngrediente = async (ingrediente: Ingrediente) => {
    if (confirm(`¿Estás seguro de que deseas eliminar ${ingrediente.name}?`)) {
      try {
        await ingredienteService.deleteIngrediente(ingrediente.id)
        setIngredientes(ingredientes.filter((i) => i.id !== ingrediente.id))
        toast({
          title: "Ingrediente eliminado",
          description: "El ingrediente ha sido eliminado exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el ingrediente",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateStock = async (ingrediente: Ingrediente, nuevoStock: number) => {
    try {
      const updatedIngrediente = await ingredienteService.updateStock(ingrediente.id, nuevoStock)
      setIngredientes(ingredientes.map((i) => (i.id === ingrediente.id ? updatedIngrediente : i)))
      toast({
        title: "Stock actualizado",
        description: `Stock de ${ingrediente.name} actualizado a ${nuevoStock}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive",
      })
    }
  }

  const getStockBadge = (ingrediente: Ingrediente) => {
    if (ingrediente.stock <= ingrediente.stockLimit) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Stock Bajo
        </Badge>
      )
    }
    return <Badge className="bg-green-100 text-green-800">Stock Normal</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Ingredientes</h1>
            <p className="text-gray-600">Administra el inventario de ingredientes del restaurante</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Ingredientes</h1>
          <p className="text-gray-600">Administra el inventario de ingredientes del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setEditingIngrediente(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ingrediente
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
                placeholder="Buscar ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stockBajoFilter} onValueChange={setStockBajoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado del Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los stocks</SelectItem>
                <SelectItem value="bajo">Stock bajo</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={unidadMedidaFilter} onValueChange={setUnidadMedidaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Unidad de Medida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las unidades</SelectItem>
                {Object.entries(unidadMedidaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={label}>
                    {label}
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
            <div className="text-2xl font-bold">{ingredientes.length}</div>
            <p className="text-xs text-muted-foreground">Total Ingredientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {ingredientes.filter((i) => i.stock <= i.stockLimit).length}
            </div>
            <p className="text-xs text-muted-foreground">Stock Bajo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {ingredientes.filter((i) => i.stock > i.stockLimit).length}
            </div>
            <p className="text-xs text-muted-foreground">Stock Normal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {/* <div className="text-2xl font-bold">
              {ingredientes.reduce((sum, i) => sum + i.suppliers.length, 0)}
            </div> */}
            <p className="text-xs text-muted-foreground">Total Proveedores</p>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Proveedores</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredientes.map((ingrediente) => (
                <TableRow key={ingrediente.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-600">{ingrediente.name}</div>
                        <div className="text-sm text-gray-500">{ingrediente.cod}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{ingrediente.stock}</div>
                      <div className="text-xs text-gray-500">Límite: {ingrediente.stockLimit}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ingrediente.uniteOfMeasure}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {/* {ingrediente.suppliers.length > 0 ? (
                        <div>
                          <div className="font-medium">{ingrediente.suppliers[0].companyName}</div>
                          {ingrediente.suppliers.length > 1 && (
                            <div className="text-gray-500">+{ingrediente.suppliers.length - 1} más</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin proveedores</span> 
                      )} */}
                        <span className="text-gray-400">Sin proveedores</span>

                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{ingrediente.origin}</div>
                  </TableCell>
                  <TableCell>{getStockBadge(ingrediente)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/ingredientes/${ingrediente.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingIngrediente(ingrediente)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const nuevoStock = prompt("Nuevo stock:", ingrediente.stock.toString())
                            if (nuevoStock && !isNaN(Number(nuevoStock))) {
                              handleUpdateStock(ingrediente, Number(nuevoStock))
                            }
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Actualizar Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteIngrediente(ingrediente)} className="text-red-600">
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
          {filteredIngredientes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron ingredientes</p>
            </div>
          )}
        </CardContent>
      </Card>
      <IngredienteFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ingrediente={editingIngrediente}
        onSuccess={loadIngredientes}
      />
    </div>
  )
}