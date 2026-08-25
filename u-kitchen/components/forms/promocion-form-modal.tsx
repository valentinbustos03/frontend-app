"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { promocionService } from "@/services/promocion-service"
import { platoService } from "@/services/plato-service"
import { ApiError } from "@/lib/api"
import { promocionCreateSchema, type PromocionCreateInput } from "@/lib/schemas"
import type { Plato } from "@/types/plato.types"
import type { Promocion } from "@/types/promocion.types"

type FormData = PromocionCreateInput

interface PromocionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promocion?: Promocion
  onSuccess: () => void
}

function toInputValue(iso: string) {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const emptyDefaults: FormData = {
  cod: "",
  name: "",
  description: "",
  discountPercentage: 10,
  dateFrom: "",
  dateTo: "",
  active: true,
  dishIds: [],
}

export function PromocionFormModal({ open, onOpenChange, promocion, onSuccess }: PromocionFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [platos, setPlatos] = useState<Plato[]>([])
  const [platosLoading, setPlatosLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(promocionCreateSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return

    setPlatosLoading(true)
    platoService
      .getPlatos()
      .then(setPlatos)
      .catch(() => {
        toast({
          title: "Error",
          description: "No se pudieron cargar los platos",
          variant: "destructive",
        })
      })
      .finally(() => setPlatosLoading(false))

    reset(
      promocion
        ? {
            cod: promocion.cod,
            name: promocion.name,
            description: promocion.description ?? "",
            discountPercentage: promocion.discountPercentage,
            dateFrom: toInputValue(promocion.dateFrom),
            dateTo: toInputValue(promocion.dateTo),
            active: promocion.active,
            dishIds: promocion.dishes?.map((plato) => plato.id) ?? [],
          }
        : emptyDefaults,
    )
  }, [open, promocion, reset])

  const dishIds = watch("dishIds")

  const handlePlatoChange = (platoId: string, checked: boolean) => {
    const current = dishIds || []
    setValue(
      "dishIds",
      checked ? [...current, platoId] : current.filter((id) => id !== platoId),
      { shouldValidate: true },
    )
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      // Los inputs son de día entero: la promo arranca al inicio del primer día y
      // termina al final del último, así el último día también cuenta.
      const payload = {
        cod: data.cod,
        name: data.name,
        description: data.description || undefined,
        discountPercentage: data.discountPercentage,
        dateFrom: new Date(`${data.dateFrom}T00:00:00`).toISOString(),
        dateTo: new Date(`${data.dateTo}T23:59:59`).toISOString(),
        active: data.active,
        dishes: data.dishIds.map((id) => ({ id })),
      }

      if (promocion) {
        await promocionService.updatePromocion(promocion.id, payload)
        toast({
          title: "Promoción actualizada",
          description: "La promoción ha sido actualizada exitosamente",
        })
      } else {
        await promocionService.createPromocion(payload)
        toast({
          title: "Promoción creada",
          description: "La promoción ha sido creada exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset(emptyDefaults)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError && error.status === 409
            ? error.message
            : `No se pudo ${promocion ? "actualizar" : "crear"} la promoción`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-600">
            {promocion ? "Editar Promoción" : "Nueva Promoción"}
          </DialogTitle>
          <DialogDescription>
            {promocion ? "Modifica los datos de la promoción" : "Completa los datos de la nueva promoción"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código</Label>
              <Input id="cod" {...register("cod")} placeholder="PROMO001" />
              {errors.cod && <p className="text-sm text-destructive">{errors.cod.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register("name")} placeholder="Semana de pastas" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register("description")} rows={2} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Descuento (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                step="1"
                min="0"
                max="100"
                {...register("discountPercentage")}
              />
              {errors.discountPercentage && (
                <p className="text-sm text-destructive">{errors.discountPercentage.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Desde</Label>
              <Input id="dateFrom" type="date" {...register("dateFrom")} />
              {errors.dateFrom && <p className="text-sm text-destructive">{errors.dateFrom.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Hasta</Label>
              <Input id="dateTo" type="date" {...register("dateTo")} />
              {errors.dateTo && <p className="text-sm text-destructive">{errors.dateTo.message}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Checkbox id="active" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="active">Promoción activa</Label>
          </div>
          <div className="space-y-2">
            <Label>Platos alcanzados</Label>
            {platosLoading ? (
              <p className="text-gray-500">Cargando platos...</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {platos.map((plato) => (
                  <div key={plato.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`plato-${plato.id}`}
                      checked={(dishIds || []).includes(plato.id)}
                      onCheckedChange={(checked) => handlePlatoChange(plato.id, checked as boolean)}
                    />
                    <Label htmlFor={`plato-${plato.id}`} className="text-sm font-normal cursor-pointer">
                      {plato.cod} - {plato.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {errors.dishIds && <p className="text-sm text-destructive">{errors.dishIds.message}</p>}
          </div>
          <p className="text-xs text-gray-500">
            Si un plato queda en varias promociones vigentes, el pedido aplica el descuento más alto.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : promocion ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
