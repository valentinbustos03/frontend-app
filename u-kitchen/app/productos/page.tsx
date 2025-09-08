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
import { productoService } from "@/services/producto-service"
import type { Producto } from "@/types"
import { ProductoFormModal } from "@/components/forms/producto-form-modal"

export default function ProductosPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [precioMin, setPrecioMin] = useState("")
  const [precioMax, setPrecioMax] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>()

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const response = await productoService.getProductos()
      setProductos(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProductos = useMemo(() => {
    return productos.filter((producto) => {
      const matchesSearch =
        searchTerm === "" ||
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrecioMin = !precioMin || producto.precio >= Number(precioMin)
      const matchesPrecioMax = !precioMax || producto.precio <= Number(precioMax)

      return matchesSearch && matchesPrecioMin && matchesPrecioMax
    })
  }, [productos, searchTerm, precioMin, precioMax])

  const handleDeleteProducto = async (producto: Producto) => {
    if (confirm(`¿Estás seguro de que deseas eliminar ${producto.nombre}?`)) {
      try {
        await productoService.deleteProducto(producto.id)
        setProductos(productos.filter((p) => p.id !== producto.id))
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const getCalificacionStars = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(calificacion) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Productos</h1>
            <p className="text-gray-600">Administra el menú y productos del restaurante</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el menú y productos del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setEditingProducto(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
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
                placeholder="Buscar productos..."
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
            <div className="text-2xl font-bold">{productos.length}</div>
            <p className="text-xs text-muted-foreground">Total Productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(productos.reduce((sum, p) => sum + p.precio, 0) / productos.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Precio Promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {(productos.reduce((sum, p) => sum + p.calificacion, 0) / productos.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Calificación Promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{productos.filter((p) => p.calificacion >= 4).length}</div>
            <p className="text-xs text-muted-foreground">Productos 4+ Estrellas</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Ingredientes</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto) => (
                <TableRow key={producto.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={producto.imagen || "/placeholder.svg?height=40&width=40"}
                        alt={producto.nombre}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-orange-600">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">{producto.codigo}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">{formatCurrency(producto.precio)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getCalificacionStars(producto.calificacion)}
                      <span className="ml-2 text-sm text-gray-600">({producto.calificacion})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {producto.ingredientes.length > 0 ? (
                        <div>
                          <div className="font-medium">{producto.ingredientes[0].nombre}</div>
                          {producto.ingredientes.length > 1 && (
                            <div className="text-gray-500">+{producto.ingredientes.length - 1} más</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin ingredientes</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(producto.createdAt).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/productos/${producto.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProducto(producto)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProducto(producto)} className="text-red-600">
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

          {filteredProductos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </CardContent>
      </Card>
      <ProductoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        producto={editingProducto}
        onSuccess={loadProductos}
      />
    </div>
  )
}
