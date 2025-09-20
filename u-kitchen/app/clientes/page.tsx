"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { clienteService } from "@/services/cliente-service"
import type { Cliente } from "@/types"
import { ClienteFormModal } from "@/components/forms/cliente-form-modal"

export default function ClientesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [penalizacionFilter, setPenalizacionFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>()

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const response = await clienteService.getClientes()
      setClientes(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch =
        searchTerm === "" ||
        cliente.dni.toString().includes(searchTerm) ||
        (cliente.user?.fullName && cliente.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.user?.email && cliente.user.email.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesPenalizacion =
        penalizacionFilter === "all" ||
        (() => {
          switch (penalizacionFilter) {
            case "ninguna":
              return cliente.penalty === 0
            case "baja":
              return cliente.penalty > 0 && cliente.penalty <= 2
            case "media":
              return cliente.penalty > 2 && cliente.penalty <= 5
            case "alta":
              return cliente.penalty > 5
            default:
              return true
          }
        })()

      return matchesSearch && matchesPenalizacion
    })
  }, [clientes, searchTerm, penalizacionFilter])

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al cliente con DNI ${cliente.dni}?`)) {
      try {
        await clienteService.deleteCliente(cliente.id)
        setClientes(clientes.filter((c) => c.id !== cliente.id))
        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el cliente",
          variant: "destructive",
        })
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getPenalizacionBadge = (penalty: number) => {
    if (penalty === 0) {
      return <Badge className="bg-green-100 text-green-800">Sin penalización</Badge>
    } else if (penalty <= 2) {
      return <Badge className="bg-yellow-100 text-yellow-800">Baja ({penalty})</Badge>
    } else if (penalty <= 5) {
      return <Badge className="bg-orange-100 text-orange-800">Media ({penalty})</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Alta ({penalty})</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Clientes</h1>
            <p className="text-gray-600">Administra la información de todos los clientes del restaurante</p>
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
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Clientes</h1>
          <p className="text-gray-300">Administra la información de todos los clientes del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setEditingCliente(undefined)
            setModalOpen(true)
          }}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={penalizacionFilter} onValueChange={setPenalizacionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Penalización" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las penalizaciones</SelectItem>
                <SelectItem value="ninguna">Sin penalización</SelectItem>
                <SelectItem value="baja">Penalización baja</SelectItem>
                <SelectItem value="media">Penalización media</SelectItem>
                <SelectItem value="alta">Penalización alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-muted-foreground">Total Clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{clientes.filter((c) => c.penalty === 0).length}</div>
            <p className="text-xs text-muted-foreground">Sin Penalización</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{clientes.filter((c) => c.penalty > 0).length}</div>
            <p className="text-xs text-muted-foreground">Con Penalización</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{clientes.reduce((sum, c) => sum + (c.orderHistory?.length || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Total Pedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Penalización</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className={getAvatarColor(cliente.user?.fullName || `DNI ${cliente.dni}`)}>
                          {getInitials(cliente.user?.fullName || `DNI ${cliente.dni}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-orange-600">
                          {cliente.user?.fullName || `Cliente ${cliente.dni}`}
                        </div>
                        <div className="text-sm text-gray-500">DNI: {cliente.dni}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-gray-400" />
                        {cliente.user?.email || 'Sin email'}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-gray-400" />
                        {cliente.user?.phoneNumber || 'Sin teléfono'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{cliente.orderHistory?.length || 0}</div>
                      <div className="text-xs text-gray-500">pedidos</div>
                    </div>
                  </TableCell>
                  <TableCell>{getPenalizacionBadge(cliente.penalty)}</TableCell>
                  <TableCell>{/*new Date(cliente.createdAt).toLocaleDateString("es-ES")*/}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/clientes/${cliente.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingCliente(cliente)
                            setModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCliente(cliente)} className="text-red-600">
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

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron clientes</p>
            </div>
          )}
        </CardContent>
      </Card>
      <ClienteFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={editingCliente}
        onSuccess={loadClientes}
      />
    </div>
  )
}
