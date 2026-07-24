"use client"

import { useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Mail, Phone, ChefHat, Coffee, Star, Wallet, Clock as ClockIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DetailHeader } from "@/components/shared/detail-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid"
import { useResource } from "@/hooks/use-resource"
import { useResourceList } from "@/hooks/use-resource-list"
import { empleadoService } from "@/services/empleado-service"
import { pedidoService } from "@/services/pedido-service"
import type { Empleado } from "@/types/empleado.types"
import { EmployeeRole } from "@/types/empleado.types"
import type { Pedido } from "@/types/pedido.types"
import {
  employeeRoleLabels,
  employeeShiftLabels,
  estadoColors,
  estadoLabels,
} from "@/lib/catalogs"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "ARS" }).format(amount)
}

function formatDateTime(value: Date | string | undefined | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function EmpleadoDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const empleadoLoader = useCallback(() => empleadoService.getEmpleadoById(params.id), [params.id])
  const { data: empleado, loading: loadingEmpleado, error } = useResource<Empleado>(empleadoLoader)

  const pedidosLoader = useCallback(async () => {
    const response = await pedidoService.getPedidos()
    return response.data
  }, [])
  const { items: allPedidos, loading: loadingPedidos } = useResourceList<Pedido>(pedidosLoader)

  const pedidosAtendidos = useMemo(() => {
    if (!empleado) return []
    return allPedidos.filter((pedido) => pedido.waiter?.id === empleado.id)
  }, [allPedidos, empleado])

  if (loadingEmpleado) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !empleado) {
    return (
      <div className="space-y-6">
        <DetailHeader backHref="/employees" backLabel="Volver a empleados" title="Empleado no encontrado" />
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {error?.message ?? "No se encontró el empleado solicitado."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName = empleado.user?.fullName || `Empleado ${empleado.taxId}`
  const isChef = empleado.role === EmployeeRole.CHEF
  const RoleIcon = isChef ? ChefHat : Coffee

  const stats: StatItem[] = isChef
    ? [
        { label: "Platos creados", value: empleado.dishes?.length ?? 0, icon: ChefHat },
        { label: "Horas trabajadas", value: empleado.workedHours, icon: ClockIcon },
        { label: "Precio hora", value: formatCurrency(empleado.priceHour), icon: Wallet, tone: "info" },
        { label: "Salario", value: formatCurrency(empleado.salary ?? 0), tone: "success" },
      ]
    : [
        { label: "Pedidos atendidos", value: pedidosAtendidos.length, icon: Coffee },
        {
          label: "Calificación",
          value: empleado.calification != null ? empleado.calification.toFixed(1) : "—",
          icon: Star,
          tone: "warning",
        },
        { label: "Horas trabajadas", value: empleado.workedHours, icon: ClockIcon },
        { label: "Salario", value: formatCurrency(empleado.salary ?? 0), tone: "success" },
      ]

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/employees"
        backLabel="Volver a empleados"
        title={fullName}
        subtitle={`${employeeRoleLabels[empleado.role]} · CUIT ${empleado.taxId}`}
        actions={
          <Badge className="bg-purple-500 text-white">
            Turno {employeeShiftLabels[empleado.shift as keyof typeof employeeShiftLabels] ?? empleado.shift}
          </Badge>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                {empleado.user?.profilePicture && (
                  <AvatarImage src={empleado.user.profilePicture} alt={fullName} />
                )}
                <AvatarFallback className="bg-orange-500">{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {employeeRoleLabels[empleado.role]}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{empleado.user?.email ?? "Sin email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{empleado.user?.phoneNumber ?? "Sin teléfono"}</span>
              </div>
            </div>
            {isChef && empleado.hierarchy && (
              <>
                <Separator />
                <div className="text-sm">
                  <p className="text-gray-400">Jerarquía</p>
                  <p className="font-medium">{empleado.hierarchy}</p>
                </div>
              </>
            )}
            {isChef && empleado.tag && (
              <div className="text-sm">
                <p className="text-gray-400">Especialidad</p>
                <p className="font-medium">{empleado.tag}</p>
              </div>
            )}
            {!isChef && empleado.sector && (
              <>
                <Separator />
                <div className="text-sm">
                  <p className="text-gray-400">Sector</p>
                  <p className="font-medium">{empleado.sector}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsGrid stats={stats} />
          </CardContent>
        </Card>
      </div>

      {isChef ? (
        <Card>
          <CardHeader>
            <CardTitle>Platos a cargo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {empleado.dishes && empleado.dishes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleado.dishes.map((dish) => (
                    <TableRow key={dish.id}>
                      <TableCell className="font-mono text-sm">{dish.cod}</TableCell>
                      <TableCell className="font-medium">{dish.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dish.tag}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(dish.price)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/platos/${dish.id}`)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={ChefHat} title="Sin platos" description="Este chef todavía no tiene platos asignados." />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos atendidos</CardTitle>
            {!loadingPedidos && pedidosAtendidos.length > 0 && (
              <span className="text-sm text-gray-400">{pedidosAtendidos.length} pedidos</span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loadingPedidos ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : pedidosAtendidos.length === 0 ? (
              <EmptyState
                icon={Coffee}
                title="Sin pedidos"
                description="Este mesero todavía no atendió pedidos."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosAtendidos.map((pedido) => (
                    <TableRow key={pedido.orderId}>
                      <TableCell className="font-medium">#{pedido.orderId}</TableCell>
                      <TableCell>{formatDateTime(pedido.startTime)}</TableCell>
                      <TableCell>
                        <Badge className={estadoColors[pedido.status]}>{estadoLabels[pedido.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(pedido.subtotal ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/pedidos/${pedido.orderId}`)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
