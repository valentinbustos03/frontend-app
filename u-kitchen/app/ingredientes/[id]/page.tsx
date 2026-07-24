"use client"

import { useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, Truck, ChefHat, Package, Globe } from "lucide-react"
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
import { ingredienteService } from "@/services/ingrediente-service"
import type { Ingrediente } from "@/types/ingrediente.types"
import { unidadMedidaLabels } from "@/lib/catalogs"

export default function IngredienteDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const loader = useCallback(() => ingredienteService.getIngredienteById(params.id), [params.id])
  const { data: ingrediente, loading, error } = useResource<Ingrediente>(loader)

  if (loading) {
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

  if (error || !ingrediente) {
    return (
      <div className="space-y-6">
        <DetailHeader backHref="/ingredientes" backLabel="Volver a ingredientes" title="Ingrediente no encontrado" />
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {error?.message ?? "No se encontró el ingrediente solicitado."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const lowStock = ingrediente.stock <= ingrediente.stockLimit
  const stockRatio = ingrediente.stockLimit > 0 ? ingrediente.stock / ingrediente.stockLimit : 1

  const stats: StatItem[] = [
    {
      label: "Stock actual",
      value: `${ingrediente.stock} ${ingrediente.uniteOfMeasure}`,
      icon: Package,
      tone: lowStock ? "danger" : stockRatio > 2 ? "success" : "warning",
    },
    {
      label: "Stock mínimo",
      value: `${ingrediente.stockLimit} ${ingrediente.uniteOfMeasure}`,
      icon: AlertTriangle,
    },
    { label: "Proveedores", value: ingrediente.suppliers?.length ?? 0, icon: Truck },
    { label: "Platos que lo usan", value: ingrediente.dishes?.length ?? 0, icon: ChefHat },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/ingredientes"
        backLabel="Volver a ingredientes"
        title={ingrediente.name}
        subtitle={`Código ${ingrediente.cod}`}
        actions={
          lowStock ? (
            <Badge className="bg-red-500 text-white">
              <AlertTriangle className="h-3 w-3 mr-1" /> Stock crítico
            </Badge>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {ingrediente.description && <p className="text-gray-300">{ingrediente.description}</p>}
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Origen:</span>
              <span className="font-medium">{ingrediente.origin || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Unidad:</span>
              <span className="font-medium">{unidadMedidaLabels[ingrediente.uniteOfMeasure] ?? ingrediente.uniteOfMeasure}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsGrid stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-500" /> Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!ingrediente.suppliers || ingrediente.suppliers.length === 0 ? (
              <EmptyState icon={Truck} title="Sin proveedores" description="No hay proveedores asignados a este ingrediente." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razón social</TableHead>
                    <TableHead>CUIT</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingrediente.suppliers.map((sup) => (
                    <TableRow key={sup.id}>
                      <TableCell className="font-medium">{sup.companyName}</TableCell>
                      <TableCell>{sup.taxId}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/proveedores/${sup.id}`)}>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-orange-500" /> Platos que lo usan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!ingrediente.dishes || ingrediente.dishes.length === 0 ? (
              <EmptyState icon={ChefHat} title="Sin platos" description="Este ingrediente todavía no se usa en ningún plato." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingrediente.dishes.map((dish) => (
                    <TableRow key={dish.id}>
                      <TableCell className="font-mono text-sm">{dish.cod}</TableCell>
                      <TableCell className="font-medium">{dish.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/platos/${dish.id}`)}>
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
      </div>
    </div>
  )
}
