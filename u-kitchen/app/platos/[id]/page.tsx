"use client"

import { useCallback } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { ChefHat, Star, AlertTriangle, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useResource } from "@/hooks/use-resource"
import { useResourceList } from "@/hooks/use-resource-list"
import { platoService } from "@/services/plato-service"
import { empleadoService } from "@/services/empleado-service"
import type { Plato } from "@/types/plato.types"
import type { Empleado } from "@/types/empleado.types"
import { unidadMedidaLabels } from "@/lib/catalogs"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "ARS" }).format(amount)
}

export default function PlatoDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const platoLoader = useCallback(() => platoService.getPlatoById(params.id), [params.id])
  const { data: plato, loading, error } = useResource<Plato>(platoLoader)

  const empleadosLoader = useCallback(() => empleadoService.getEmpleados(), [])
  const { items: empleados } = useResourceList<Empleado>(empleadosLoader)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="h-40 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !plato) {
    return (
      <div className="space-y-6">
        <DetailHeader backHref="/platos" backLabel="Volver a platos" title="Plato no encontrado" />
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {error?.message ?? "No se encontró el plato solicitado."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const chefData = empleados.find((emp) => emp.id === plato.chef)
  const chefName = chefData?.user?.fullName ?? "Chef no asignado"

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/platos"
        backLabel="Volver a platos"
        title={plato.name}
        subtitle={`Código ${plato.cod}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base">
              <Tag className="h-3 w-3 mr-1" />
              {plato.tag}
            </Badge>
            <Badge className="bg-orange-600 text-white text-base">{formatCurrency(plato.price)}</Badge>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
              {plato.picture ? (
                <Image
                  src={plato.picture}
                  alt={plato.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Sin imagen</div>
              )}
            </div>
            {plato.calification != null && (
              <div className="mt-4 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{plato.calification.toFixed(1)}</span>
                <span className="text-gray-400">de calificación</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-gray-300">{plato.description || "Sin descripción"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background/50 p-3">
                <p className="text-gray-400 text-xs">Chef responsable</p>
                <div className="flex items-center gap-2 mt-1">
                  <ChefHat className="h-4 w-4 text-orange-500" />
                  <p className="font-medium">{chefName}</p>
                </div>
                {chefData && (
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 mt-1 h-auto"
                    onClick={() => router.push(`/employees/${chefData.id}`)}
                  >
                    Ver perfil
                  </Button>
                )}
              </div>
              <div className="rounded-md border border-border bg-background/50 p-3">
                <p className="text-gray-400 text-xs">Ingredientes</p>
                <p className="font-medium mt-1">{plato.ingredients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {plato.ingredients.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Sin ingredientes"
              description="Este plato no tiene ingredientes asignados."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Stock actual</TableHead>
                  <TableHead className="text-right">Stock límite</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {plato.ingredients.map((ing) => {
                  const lowStock = ing.stock <= ing.stockLimit
                  return (
                    <TableRow key={ing.id}>
                      <TableCell className="font-mono text-sm">{ing.cod}</TableCell>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell>{unidadMedidaLabels[ing.uniteOfMeasure] ?? ing.uniteOfMeasure}</TableCell>
                      <TableCell className="text-right">
                        <span className={lowStock ? "text-red-500 font-semibold" : ""}>{ing.stock}</span>
                        {lowStock && <AlertTriangle className="inline ml-1 h-3 w-3 text-red-500" />}
                      </TableCell>
                      <TableCell className="text-right text-gray-400">{ing.stockLimit}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/ingredientes/${ing.id}`)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
