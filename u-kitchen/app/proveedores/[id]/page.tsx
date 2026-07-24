"use client"

import { useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Mail, Phone, Building2, Tag, Wheat } from "lucide-react"
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
import { useResource } from "@/hooks/use-resource"
import { useResourceList } from "@/hooks/use-resource-list"
import { proveedorService } from "@/services/proveedor-service"
import { ingredienteService } from "@/services/ingrediente-service"
import type { Proveedor } from "@/types/proveedor.types"
import type { Ingrediente } from "@/types/ingrediente.types"

export default function ProveedorDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const loader = useCallback(() => proveedorService.getProveedorById(params.id), [params.id])
  const { data: proveedor, loading, error } = useResource<Proveedor>(loader)

  const ingredientesLoader = useCallback(async () => {
    const response = await ingredienteService.getIngredientes()
    return response.data
  }, [])
  const { items: allIngredientes, loading: loadingIngredientes } = useResourceList<Ingrediente>(ingredientesLoader)

  const ingredientesAsociados = useMemo(() => {
    if (!proveedor) return []
    return allIngredientes.filter((ing) => ing.suppliers?.some((s) => s.id === proveedor.id))
  }, [allIngredientes, proveedor])

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

  if (error || !proveedor) {
    return (
      <div className="space-y-6">
        <DetailHeader backHref="/proveedores" backLabel="Volver a proveedores" title="Proveedor no encontrado" />
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            {error?.message ?? "No se encontró el proveedor solicitado."}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/proveedores"
        backLabel="Volver a proveedores"
        title={proveedor.companyName}
        subtitle={`CUIT ${proveedor.taxId}`}
        actions={
          <Badge variant="secondary">
            <Tag className="h-3 w-3 mr-1" />
            {proveedor.typeIngredient}
          </Badge>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de la empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Razón social:</span>
              <span className="font-medium">{proveedor.companyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Nombre comercial:</span>
              <span className="font-medium">{proveedor.bussinessName}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <span className="text-gray-400 min-w-20">Contacto:</span>
              <span className="font-medium">{proveedor.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{proveedor.mail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{proveedor.phoneNumber}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Tipo de ingrediente</p>
              <p className="text-2xl font-bold capitalize">{proveedor.typeIngredient}</p>
            </div>
            <Separator />
            <div>
              <p className="text-gray-400">Ingredientes provistos</p>
              <p className="text-2xl font-bold">{loadingIngredientes ? "…" : ingredientesAsociados.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wheat className="h-4 w-4 text-orange-500" /> Ingredientes provistos
          </CardTitle>
          {!loadingIngredientes && ingredientesAsociados.length > 0 && (
            <span className="text-sm text-gray-400">{ingredientesAsociados.length}</span>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingIngredientes ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : ingredientesAsociados.length === 0 ? (
            <EmptyState
              icon={Wheat}
              title="Sin ingredientes"
              description="Este proveedor todavía no provee ingredientes."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredientesAsociados.map((ing) => {
                  const lowStock = ing.stock <= ing.stockLimit
                  return (
                    <TableRow key={ing.id}>
                      <TableCell className="font-mono text-sm">{ing.cod}</TableCell>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell className="text-right">
                        <span className={lowStock ? "text-red-500 font-semibold" : ""}>{ing.stock}</span>
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
