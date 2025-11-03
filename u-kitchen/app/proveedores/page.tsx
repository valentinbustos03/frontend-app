"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { proveedorService } from "@/services/proveedor-service"
import type { Proveedor } from "@/types/proveedor.types"
import { ProveedorFormModal } from "@/components/forms/proveedor-form-modal"

export default function ProveedoresPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | undefined>()

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      setLoading(true)
      const response = await proveedorService.getProveedores()
      setProveedores(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProveedores = useMemo(() => {
    return proveedores.filter((proveedor) => {
      const matchesSearch =
        searchTerm === "" ||
        proveedor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.bussinessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.typeIngredient.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [proveedores, searchTerm])

  const handleDeleteProveedor = async (proveedor: Proveedor) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${proveedor.companyName}?`)) {
      try {
        await proveedorService.deleteProveedor(proveedor.id)
        setProveedores(proveedores.filter((p) => p.id !== proveedor.id))
        toast({
          title: "Proveedor eliminado",
          description: "El proveedor ha sido eliminado exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el proveedor",
          variant: "destructive",
        })
      }
    }
  }

  const getTipoIngredienteBadge = (tipo: string) => {
    const colors = {
      Carnes: "bg-red-100 text-red-800",
      Verduras: "bg-green-100 text-green-800",
      Lácteos: "bg-blue-100 text-blue-800",
      Cereales: "bg-yellow-100 text-yellow-800",
      Bebidas: "bg-purple-100 text-purple-800",
      Pasta: "bg-pink-100 text-pink-800",
    }
    return <Badge className={colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{tipo}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Proveedores</h1>
            <p className="text-gray-600">Administra todos los proveedores del restaurante</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Proveedores</h1>
          <p className="text-gray-600">Administra todos los proveedores del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setEditingProveedor(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{proveedores.length}</div>
            <p className="text-xs text-muted-foreground">Total Proveedores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{new Set(proveedores.map((p) => p.typeIngredient)).size}</div>
            <p className="text-xs text-muted-foreground">Tipos de Ingredientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{new Set(proveedores.map((p) => p.bussinessName)).size}</div>
            <p className="text-xs text-muted-foreground">Compañías</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{proveedores.filter((p) => p.typeIngredient === "Carnes").length}</div>
            <p className="text-xs text-muted-foreground">Proveedores de Carnes</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo Ingrediente</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>CUIT/CUIL</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                        <Building className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-600">{proveedor.companyName}</div>
                        <div className="text-sm text-gray-500">{proveedor.fullName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-gray-400" />
                        {proveedor.mail}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-gray-400" />
                        {proveedor.phoneNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTipoIngredienteBadge(proveedor.typeIngredient)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{proveedor.bussinessName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{proveedor.taxId}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={true} onClick={() => router.push(`/proveedores/${proveedor.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProveedor(proveedor)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProveedor(proveedor)} className="text-red-600">
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

          {filteredProveedores.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron proveedores</p>
            </div>
          )}
        </CardContent>
      </Card>
      <ProveedorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        proveedor={editingProveedor}
        onSuccess={loadProveedores}
      />
    </div>
  )
}