"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { empleadoService } from "@/services/empleado-service"

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  averageSalary: number
  newHiresThisMonth: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    averageSalary: 0,
    newHiresThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await empleadoService.getEmpleados()
      const employees = response.data

      const totalEmployees = employees.length
      const activeEmployees = employees.length
      const averageSalary = employees.reduce((sum, emp) => sum + emp.sueldo, 0) / totalEmployees

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const newHiresThisMonth = employees.filter((emp) => {
        const hireDate = new Date(emp.createdAt)
        return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear
      }).length

      setStats({
        totalEmployees,
        activeEmployees,
        averageSalary,
        newHiresThisMonth,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-orange-600">Dashboard</h1>
        <p className="text-gray-300">Resumen general del restaurante</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">{stats.activeEmployees} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageSalary)}</div>
            <p className="text-xs text-muted-foreground">Por empleado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Contrataciones</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newHiresThisMonth}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Sistema de Gestión del Restaurante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Este sistema te permite gestionar todos los aspectos de tu restaurante de manera eficiente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-orange-600 mb-2">Gestión de Empleados</h3>
                <p className="text-sm text-gray-300">
                  Administra la información de tu personal, controla horarios y gestiona nóminas.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-orange-600 mb-2">Control de Inventario</h3>
                <p className="text-sm text-gray-300">Mantén un registro detallado de ingredientes y suministros.</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-orange-600 mb-2">Gestión de Órdenes</h3>
                <p className="text-sm text-gray-300">
                  Procesa pedidos de manera eficiente y mantén a tus clientes satisfechos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
