"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useResourceList } from "@/hooks/use-resource-list"
import { clienteService } from "@/services/cliente-service"
import { ApiError } from "@/lib/api"
import type { Cliente } from "@/types/cliente.types"
import { ClienteFormModal } from "@/components/forms/cliente-form-modal"
import { TableToolbar } from "@/components/shared/table-toolbar"
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid"
import { EmptyState } from "@/components/shared/empty-state"

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string) {
  const index = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getPenalizacionBadge(penalty: number) {
  if (penalty === 0) {
    return <Badge className="bg-green-100 text-green-800">Sin penalización</Badge>
  }
  if (penalty <= 2) {
    return <Badge className="bg-yellow-100 text-yellow-800">Baja ({penalty})</Badge>
  }
  if (penalty <= 5) {
    return <Badge className="bg-orange-100 text-orange-800">Media ({penalty})</Badge>
  }
  return <Badge className="bg-red-100 text-red-800">Alta ({penalty})</Badge>
}

export default function ClientesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [penalizacionFilter, setPenalizacionFilter] = useState<string>("all")
  const [modalState, setModalState] = useState<Cliente | "new" | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)

  const loader = useCallback(async () => {
    const response = await clienteService.getClientes()
    return response.data
  }, [])

  const {
    items: clientes,
    loading,
    refresh,
    setItems,
  } = useResourceList<Cliente>(loader, {
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    },
  })

  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return clientes.filter((cliente) => {
      const matchesSearch =
        term === "" ||
        cliente.dni.toString().includes(term) ||
        cliente.user?.fullName?.toLowerCase().includes(term) ||
        cliente.user?.email?.toLowerCase().includes(term)

      if (!matchesSearch) return false

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
    })
  }, [clientes, searchTerm, penalizacionFilter])

  const stats: StatItem[] = useMemo(
    () => [
      { label: "Total Clientes", value: clientes.length, icon: Users },
      {
        label: "Sin Penalización",
        value: clientes.filter((c) => c.penalty === 0).length,
        tone: "success",
      },
      {
        label: "Con Penalización",
        value: clientes.filter((c) => c.penalty > 0).length,
        tone: "warning",
      },
      {
        label: "Total Pedidos",
        value: clientes.reduce((sum, c) => sum + (c.orderHistory?.length || 0), 0),
      },
    ],
    [clientes],
  )

  const confirmDelete = async () => {
    if (!deletingCliente) return
    const target = deletingCliente
    setDeletingCliente(null)
    try {
      await clienteService.deleteCliente(target.id)
      setItems((prev) => prev.filter((c) => c.id !== target.id))
      toast({ title: "Cliente eliminado", description: `DNI ${target.dni} fue eliminado` })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const placeholderStats: StatItem[] = useMemo(
    () => [
      { label: "Total Clientes", value: "—", icon: Users },
      { label: "Sin Penalización", value: "—" },
      { label: "Con Penalización", value: "—" },
      { label: "Total Pedidos", value: "—" },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Gestión de Clientes</h1>
            <p className="text-gray-600">Administra la información de todos los clientes del restaurante</p>
          </div>
        </div>
        <StatsGrid stats={placeholderStats} />
        <Card>
          <CardContent className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la información de todos los clientes del restaurante</p>
        </div>
        <Button
          onClick={() => setModalState("new")}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por DNI, nombre o email..."
        resultCount={filteredClientes.length}
        totalCount={clientes.length}
        filters={
          <Select value={penalizacionFilter} onValueChange={setPenalizacionFilter}>
            <SelectTrigger className="w-[200px]">
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
        }
      />

      <StatsGrid stats={stats} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Penalización</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {cliente.user?.profilePicture && (
                          <AvatarImage src={cliente.user.profilePicture} alt={cliente.user.fullName || "Cliente"} />
                        )}
                        <AvatarFallback
                          className={getAvatarColor(cliente.user?.fullName || `DNI ${cliente.dni}`)}
                        >
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
                        {cliente.user?.email || "Sin email"}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-gray-400" />
                        {cliente.user?.phoneNumber || "Sin teléfono"}
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label="Acciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled
                          onClick={() => router.push(`/clientes/${cliente.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setModalState(cliente)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingCliente(cliente)}
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

          {filteredClientes.length === 0 && (
            <EmptyState
              icon={Users}
              title="No se encontraron clientes"
              description={
                clientes.length === 0
                  ? "Comenzá creando tu primer cliente."
                  : "Ajustá los filtros para ver más resultados."
              }
            />
          )}
        </CardContent>
      </Card>

      <ClienteFormModal
        open={modalState !== null}
        onOpenChange={(open) => !open && setModalState(null)}
        cliente={modalState === "new" ? undefined : modalState ?? undefined}
        onSuccess={refresh}
      />

      <AlertDialog
        open={!!deletingCliente}
        onOpenChange={(open) => !open && setDeletingCliente(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCliente
                ? `El cliente con DNI ${deletingCliente.dni} será eliminado permanentemente. Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
