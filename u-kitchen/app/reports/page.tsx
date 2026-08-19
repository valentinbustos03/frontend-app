"use client"

import { useCallback, useMemo } from "react"
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  Ban,
  TrendingUp,
  ChefHat,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid"
import { EmptyState } from "@/components/shared/empty-state"
import { useResourceList } from "@/hooks/use-resource-list"
import { useToast } from "@/hooks/use-toast"
import { pedidoService } from "@/services/pedido-service"
import type { Pedido } from "@/types/pedido.types"
import { PedidoEstado } from "@/types/pedido.types"
import { estadoLabels } from "@/lib/catalogs"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "ARS" }).format(amount)
}

const ESTADO_COLORS: Record<PedidoEstado, string> = {
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

export default function ReportsPage() {
  const { toast } = useToast()

  const pedidosLoader = useCallback(async () => {
    const response = await pedidoService.getPedidos()
    return response.data
  }, [])

  const { items: pedidos, loading } = useResourceList<Pedido>(pedidosLoader, {
    onError: () =>
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      }),
  })

  const stats = useMemo<StatItem[]>(() => {
    const entregados = pedidos.filter((p) => p.status === PedidoEstado.ENTREGADO)
    const ingresos = entregados.reduce((sum, p) => sum + (p.subtotal ?? 0), 0)
    const ticketPromedio = entregados.length > 0 ? ingresos / entregados.length : 0
    const cancelados = pedidos.filter((p) => p.status === PedidoEstado.CANCELADO).length
    const tasaCancelacion = pedidos.length > 0 ? (cancelados / pedidos.length) * 100 : 0

    return [
      { label: "Ingresos", value: formatCurrency(ingresos), icon: DollarSign, tone: "success" },
      { label: "Ticket promedio", value: formatCurrency(ticketPromedio), icon: Receipt },
      { label: "Pedidos entregados", value: entregados.length, icon: ShoppingCart },
      {
        label: "Tasa de cancelación",
        value: `${tasaCancelacion.toFixed(1)}%`,
        icon: Ban,
        tone: tasaCancelacion > 15 ? "danger" : "default",
      },
    ]
  }, [pedidos])

  const ingresosPorDia = useMemo(() => {
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

  const pedidosPorEstado = useMemo(() => {
    const counts = new Map<PedidoEstado, number>()
    pedidos.forEach((p) => counts.set(p.status, (counts.get(p.status) ?? 0) + 1))
    return Array.from(counts.entries()).map(([estado, count]) => ({
      name: estadoLabels[estado],
      value: count,
      color: ESTADO_COLORS[estado],
    }))
  }, [pedidos])

  const topPlatos = useMemo(() => {
    const acc = new Map<string, { name: string; quantity: number; revenue: number }>()
    pedidos.forEach((pedido) => {
      pedido.orderItems.forEach((item) => {
        const key = item.dish?.id ?? item.dish?.cod ?? "?"
        const existing = acc.get(key)
        const revenue = (item.dish?.price ?? 0) * item.quantity
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += revenue
        } else {
          acc.set(key, { name: item.dish?.name ?? "Sin nombre", quantity: item.quantity, revenue })
        }
      })
    })
    return Array.from(acc.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [pedidos])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-orange-600">Reportes</h1>
        <p className="text-gray-400">Métricas de ventas y desempeño</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" /> Ingresos últimos 14 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorDia} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  />
                  <Bar dataKey="total" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
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
              {pedidosPorEstado.length === 0 ? (
                <EmptyState icon={ShoppingCart} title="Sin pedidos" description="Todavía no hay pedidos cargados." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pedidosPorEstado} layout="vertical" margin={{ top: 10, right: 16, left: 24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {pedidosPorEstado.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-orange-500" /> Platos con mayor facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topPlatos.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ChefHat} title="Sin datos" description="Todavía no hay platos pedidos." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plato</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Facturación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPlatos.map((plato) => (
                  <TableRow key={plato.name}>
                    <TableCell className="font-medium">{plato.name}</TableCell>
                    <TableCell className="text-right">{plato.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(plato.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
