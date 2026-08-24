"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  DollarSign,
  ShoppingCart,
  UtensilsCrossed,
  AlertTriangle,
  TrendingUp,
  ChefHat,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid"
import { EmptyState } from "@/components/shared/empty-state"
import { useResourceList } from "@/hooks/use-resource-list"
import { empleadoService } from "@/services/empleado-service"
import { pedidoService } from "@/services/pedido-service"
import { mesaService } from "@/services/mesa-service"
import { ingredienteService } from "@/services/ingrediente-service"
import type { Empleado } from "@/types/empleado.types"
import type { Pedido } from "@/types/pedido.types"
import { PedidoEstado } from "@/types/pedido.types"
import type { Mesa } from "@/types/mesa.types"
import type { Ingrediente } from "@/types/ingrediente.types"
import { estadoLabels } from "@/lib/catalogs"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "ARS" }).format(amount)
}

const ESTADO_PIE_COLORS: Record<PedidoEstado, string> = {
  [PedidoEstado.PENDIENTE]: "#eab308",
  [PedidoEstado.EN_PREPARACION]: "#3b82f6",
  [PedidoEstado.LISTO]: "#22c55e",
  [PedidoEstado.ENTREGADO]: "#6b7280",
  [PedidoEstado.CANCELADO]: "#ef4444",
  [PedidoEstado.RECHAZADO]: "#b91c1c",
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
}

export default function DashboardPage() {
  const router = useRouter()

  const empleadosLoader = useCallback(() => empleadoService.getEmpleados(), [])
  const pedidosLoader = useCallback(() => pedidoService.getPedidos(), [])
  const mesasLoader = useCallback(() => mesaService.getMesas(), [])
  const ingredientesLoader = useCallback(() => ingredienteService.getIngredientes(), [])

  const { items: empleados, loading: loadingEmpleados } = useResourceList<Empleado>(empleadosLoader)
  const { items: pedidos, loading: loadingPedidos } = useResourceList<Pedido>(pedidosLoader)
  const { items: mesas, loading: loadingMesas } = useResourceList<Mesa>(mesasLoader)
  const { items: ingredientes, loading: loadingIngredientes } = useResourceList<Ingrediente>(ingredientesLoader)

  const loading = loadingEmpleados || loadingPedidos || loadingMesas || loadingIngredientes

  const headlineStats = useMemo<StatItem[]>(() => {
    const ingresos = pedidos
      .filter((p) => p.status === PedidoEstado.ENTREGADO)
      .reduce((sum, p) => sum + (p.subtotal ?? 0), 0)
    const ocupadas = mesas.filter((m) => m.occupied).length
    const stockBajo = ingredientes.filter((i) => i.stock <= i.stockLimit).length

    return [
      { label: "Empleados", value: empleados.length, icon: Users },
      { label: "Pedidos totales", value: pedidos.length, icon: ShoppingCart },
      { label: "Ingresos", value: formatCurrency(ingresos), icon: DollarSign, tone: "success" },
      {
        label: "Mesas ocupadas",
        value: `${ocupadas}/${mesas.length}`,
        icon: UtensilsCrossed,
        tone: mesas.length > 0 && ocupadas / mesas.length > 0.8 ? "warning" : "default",
      },
      {
        label: "Ingredientes en alerta",
        value: stockBajo,
        icon: AlertTriangle,
        tone: stockBajo > 0 ? "danger" : "success",
      },
    ]
  }, [empleados, pedidos, mesas, ingredientes])

  const ventasPorDia = useMemo(() => {
    const days: { date: Date; label: string; total: number }[] = []
    const today = startOfDay(new Date())
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days.push({ date: d, label: formatDayLabel(d), total: 0 })
    }
    pedidos
      .filter((p) => p.status === PedidoEstado.ENTREGADO)
      .forEach((pedido) => {
        const startTime = pedido.startTime ? new Date(pedido.startTime) : null
        if (!startTime || isNaN(startTime.getTime())) return
        const day = startOfDay(startTime)
        const target = days.find((d) => d.date.getTime() === day.getTime())
        if (target) target.total += pedido.subtotal ?? 0
      })
    return days.map((d) => ({ day: d.label, total: Math.round(d.total) }))
  }, [pedidos])

  const topPlatos = useMemo(() => {
    const counts = new Map<string, { name: string; quantity: number }>()
    pedidos.forEach((pedido) => {
      pedido.orderItems.forEach((item) => {
        const key = item.dish?.id ?? item.dish?.cod ?? "?"
        const existing = counts.get(key)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          counts.set(key, { name: item.dish?.name ?? "Sin nombre", quantity: item.quantity })
        }
      })
    })
    return Array.from(counts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [pedidos])

  const estadosPie = useMemo(() => {
    const counts = new Map<PedidoEstado, number>()
    pedidos.forEach((p) => counts.set(p.status, (counts.get(p.status) ?? 0) + 1))
    return Array.from(counts.entries()).map(([estado, count]) => ({
      name: estadoLabels[estado],
      value: count,
      color: ESTADO_PIE_COLORS[estado],
    }))
  }, [pedidos])

  const stockCritico = useMemo(
    () => ingredientes.filter((i) => i.stock <= i.stockLimit).slice(0, 5),
    [ingredientes],
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 h-64 bg-muted/30 animate-pulse rounded" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-orange-600">Dashboard</h1>
        <p className="text-gray-400">Resumen general del restaurante</p>
      </div>

      <StatsGrid stats={headlineStats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" /> Ventas últimos 14 días
            </CardTitle>
            <Badge variant="secondary">Pedidos entregados</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasPorDia} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {estadosPie.length === 0 ? (
                <EmptyState icon={ShoppingCart} title="Sin pedidos" description="Todavía no hay pedidos cargados." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={estadosPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {estadosPie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-orange-500" /> Top platos pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {topPlatos.length === 0 ? (
                <EmptyState icon={ChefHat} title="Sin datos" description="Todavía no hay platos pedidos." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPlatos} layout="vertical" margin={{ top: 10, right: 16, left: 32, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                    />
                    <Bar dataKey="quantity" fill="#ea580c" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Stock crítico
            </CardTitle>
            <Button
              variant="link"
              size="sm"
              className="px-0"
              onClick={() => router.push("/ingredientes")}
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {stockCritico.length === 0 ? (
              <p className="text-sm text-gray-400">Todos los ingredientes están sobre el stock mínimo.</p>
            ) : (
              <ul className="space-y-2">
                {stockCritico.map((ing) => (
                  <li
                    key={ing.id}
                    className="flex items-center justify-between rounded-md border border-border bg-background/50 p-2 text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/ingredientes/${ing.id}`)}
                  >
                    <div>
                      <p className="font-medium">{ing.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{ing.cod}</p>
                    </div>
                    <Badge className="bg-red-500 text-white">
                      {ing.stock}/{ing.stockLimit}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
