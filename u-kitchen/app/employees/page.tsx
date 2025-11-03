"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Users, Clock, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmpleadoFormModal } from "@/components/forms/empleado-form-modal"
import { Empleado, EmployeeRole, EmployeeShift } from "@/types/empleado.types"
import { empleadoService } from "@/services/empleado-service"

const roleColors = {
  chef: "bg-red-500",
  waiter: "bg-blue-500",
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

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | undefined>()
  const [tipoFilter, setTipoFilter] = useState<EmployeeRole | "all">("all")
  const [turnoFilter, setTurnoFilter] = useState<EmployeeShift | "all">("all")

  useEffect(() => {
    loadEmpleados()
  }, [])

  useEffect(() => {
    filterEmpleados()
  }, [empleados, searchTerm, tipoFilter, turnoFilter])

  const loadEmpleados = async () => {
    try {
      setLoading(true)
      const response = await empleadoService.getEmpleados()
      setEmpleados(response.data)
    } catch (error) {
      console.error("Error loading empleados:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmpleados = () => {
    let filtered = empleados

    // Filtro de búsqueda por texto (dejar como está)
    if (searchTerm) {
      filtered = filtered.filter(
        (empleado) =>
          empleado.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (empleado.user?.fullName && empleado.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtro por tipo (rol)
    if (tipoFilter !== "all") {
      filtered = filtered.filter((empleado) => empleado.role === tipoFilter)
    }

    // Filtro por turno
    if (turnoFilter !== "all") {
      filtered = filtered.filter((empleado) => empleado.shift === turnoFilter)
    }

    setFilteredEmpleados(filtered)
  }

  const handleCreateEmpleado = () => {
    setSelectedEmpleado(undefined)
    setModalOpen(true)
  }

  const handleEditEmpleado = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setModalOpen(true)
  }

  const handleDeleteEmpleado = (id: string) => {
    setEmpleados(empleados.filter((e) => e.id !== id))
  }

  const handleModalSuccess = () => {
    loadEmpleados()
  }

  const totalSueldos = empleados.reduce((sum, empleado) => sum + (empleado.salary || empleado.workedHours * empleado.priceHour || 0), 0)
  const promedioHoras =
    empleados.length > 0 ? empleados.reduce((sum, empleado) => sum + empleado.workedHours, 0) / empleados.length : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Empleados</h1>
          <p className="text-gray-600">Administra la información de todos los empleados del restaurante</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Gestión de Empleados</h1>
          <p className="text-gray-600">Administra la información de todos los empleados del restaurante</p>
        </div>
        <Button
          onClick={handleCreateEmpleado}
          className="text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empleados.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sueldos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSueldos.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioHoras.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empleados.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido o CUIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as EmployeeRole | "all")}>
                <SelectTrigger className="w-[160px] sm:w-[180px]">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value={EmployeeRole.CHEF}>Chef</SelectItem>
                  <SelectItem value={EmployeeRole.WAITER}>Mesero</SelectItem>
                </SelectContent>
              </Select>
              <Select value={turnoFilter} onValueChange={(value) => setTurnoFilter(value as EmployeeShift | "all")}>
                <SelectTrigger className="w-[160px] sm:w-[180px]">
                  <SelectValue placeholder="Todos los turnos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los turnos</SelectItem>
                  <SelectItem value={EmployeeShift.MAÑANA}>Mañana</SelectItem>
                  <SelectItem value={EmployeeShift.TARDE}>Tarde</SelectItem>
                  <SelectItem value={EmployeeShift.NOCHE}>Noche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empleados Grid */}
      <div className="grid gap-4 md:grid-cols-2 grid-cols-3 lg:grid-cols-4">
        {filteredEmpleados.map((empleado) => (
          <Card key={empleado.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    {empleado.user?.profilePicture && (
                      <AvatarImage src={empleado.user.profilePicture} alt={empleado.user.fullName || "Empleado"} />
                    )}
                    <AvatarFallback className={getAvatarColor(empleado.user?.fullName || empleado.taxId)}>
                      {getInitials(empleado.user?.fullName || empleado.taxId)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {empleado.user?.fullName}
                    </CardTitle>
                    <CardDescription>
                      {empleado.taxId}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditEmpleado(empleado)}>
                    <Edit className="h-4 w-4 text-yellow-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEmpleado(empleado.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={`${roleColors[empleado.role as keyof typeof roleColors]} text-white`}>
                    {empleado.role === EmployeeRole.CHEF ? "Chef" : "Mesero"}
                  </Badge>
                  <Badge className="bg-purple-500 text-white">
                    {empleado.shift.charAt(0).toUpperCase() + empleado.shift.slice(1)}
                  </Badge>
                  {empleado.tag && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {empleado.tag.charAt(0).toUpperCase() + empleado.tag.slice(1)}
                    </Badge>
                  )}
                  {empleado.sector && (
                    <Badge variant="outline" className="text-xs">
                      {empleado.sector.charAt(0).toUpperCase() + empleado.sector.slice(1)}
                    </Badge>
                  )}
                </div>
                {empleado.role === EmployeeRole.CHEF && empleado.hierarchy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Jerarquía:</p>
                    <p className="font-medium">{empleado.hierarchy.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                )}
                {empleado.role === EmployeeRole.WAITER && empleado.calification && (
                  <div>
                    <p className="text-sm text-muted-foreground">Calificación:</p>
                    <p className="font-medium">⭐ {empleado.calification}/5</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Horas:</p>
                    <p className="font-medium">{empleado.workedHours}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Por Hora:</p>
                    <p className="font-medium">${empleado.priceHour.toFixed(2)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Sueldo Total:</p>
                  <p className="text-lg font-bold text-primary">${(empleado.workedHours * empleado.priceHour).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmpleados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron empleados</p>
          </CardContent>
        </Card>
      )}

      <EmpleadoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        empleado={selectedEmpleado}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}