"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Users, Clock, DollarSign } from "lucide-react"
import { EmpleadoFormModal } from "@/components/forms/empleado-form-modal"
import { dummyEmpleados } from "@/data/dummy-data"
import { Empleado, EmpleadoTipo, Turno } from "@/types"

const tipoColors = {
  MESERO: "bg-blue-500",
  CHEF: "bg-red-500",
  CAJERO: "bg-green-500",
  ADMINISTRADOR: "bg-purple-500",
  LIMPIEZA: "bg-yellow-500",
}

const turnoColors = {
  MAÑANA: "bg-orange-500",
  TARDE: "bg-blue-500",
  NOCHE: "bg-purple-500",
  COMPLETO: "bg-green-500",
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<EmpleadoTipo>(EmpleadoTipo.MESERO) // Updated default value
  const [turnoFilter, setTurnoFilter] = useState<Turno>(Turno.MAÑANA) // Updated default value
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | undefined>()

  useEffect(() => {
    loadEmpleados()
  }, [])

  useEffect(() => {
    filterEmpleados()
  }, [empleados, searchTerm, tipoFilter, turnoFilter])

  const loadEmpleados = async () => {
    try {
      setLoading(true)
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 500))
      setEmpleados(dummyEmpleados)
    } catch (error) {
      console.error("Error loading empleados:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmpleados = () => {
    let filtered = empleados

    if (searchTerm) {
      filtered = filtered.filter(
        (empleado) =>
          empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empleado.cuitCuil.includes(searchTerm),
      )
    }

    if (tipoFilter) {
      filtered = filtered.filter((empleado) => empleado.tipo === tipoFilter)
    }

    if (turnoFilter) {
      filtered = filtered.filter((empleado) => empleado.turno === turnoFilter)
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

  const totalSueldos = empleados.reduce((sum, empleado) => sum + empleado.sueldo, 0)
  const promedioHoras =
    empleados.length > 0 ? empleados.reduce((sum, empleado) => sum + empleado.horasTrabajadas, 0) / empleados.length : 0

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
          <div className="flex gap-4">
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
            <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as EmpleadoTipo)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MESERO">Mesero</SelectItem>
                <SelectItem value="CHEF">Chef</SelectItem>
                <SelectItem value="CAJERO">Cajero</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="LIMPIEZA">Limpieza</SelectItem>
              </SelectContent>
            </Select>
            <Select value={turnoFilter} onValueChange={(value) => setTurnoFilter(value as Turno)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAÑANA">Mañana</SelectItem>
                <SelectItem value="TARDE">Tarde</SelectItem>
                <SelectItem value="NOCHE">Noche</SelectItem>
                <SelectItem value="COMPLETO">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empleados Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmpleados.map((empleado) => (
          <Card key={empleado.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {empleado.nombre} {empleado.apellido}
                  </CardTitle>
                  <CardDescription>{empleado.cuitCuil}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditEmpleado(empleado)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEmpleado(empleado.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={`${tipoColors[empleado.tipo]} text-white`}>{empleado.tipo}</Badge>
                  <Badge className={`${turnoColors[empleado.turno]} text-white`}>{empleado.turno}</Badge>
                </div>

                {empleado.tipo === "CHEF" && empleado.jerarquia && (
                  <div>
                    <p className="text-sm text-muted-foreground">Jerarquía:</p>
                    <p className="font-medium">{empleado.jerarquia.replace(/_/g, " ")}</p>
                  </div>
                )}

                {empleado.tipo === "MESERO" && empleado.calificacion && (
                  <div>
                    <p className="text-sm text-muted-foreground">Calificación:</p>
                    <p className="font-medium">⭐ {empleado.calificacion}/5</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Horas:</p>
                    <p className="font-medium">{empleado.horasTrabajadas}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Por Hora:</p>
                    <p className="font-medium">${empleado.precioPorHora}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Sueldo Total:</p>
                  <p className="text-lg font-bold text-primary">${empleado.sueldo.toFixed(2)}</p>
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
