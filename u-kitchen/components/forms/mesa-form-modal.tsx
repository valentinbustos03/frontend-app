"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { useToast } from "@/hooks/use-toast"
import { mesaService } from "@/services/mesa-service"
import type { Mesa, CreateMesaRequest } from "@/types"

interface MesaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa?: Mesa
  onSuccess: () => void
}

export function MesaFormModal({ open, onOpenChange, mesa, onSuccess }: MesaFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMesaRequest>({
    defaultValues: mesa
      ? {
          cod: mesa.cod,
          capacidad: mesa.capacidad,
          descripcion: mesa.descripcion,
        }
      : {},
  })

  const onSubmit = async (data: CreateMesaRequest) => {
    try {
      setLoading(true)
      if (mesa) {
        await mesaService.updateMesa(mesa.id, data)
        toast({
          title: "Mesa actualizada",
          description: "La mesa ha sido actualizada exitosamente",
        })
      } else {
        await mesaService.createMesa(data)
        toast({
          title: "Mesa creada",
          description: "La mesa ha sido creada exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${mesa ? "actualizar" : "crear"} la mesa`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{mesa ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
          <DialogDescription>
            {mesa ? "Modifica los datos de la mesa" : "Completa los datos para crear una nueva mesa"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cod">Código</Label>
            <Input id="cod" {...register("cod", { required: "El código es requerido" })} placeholder="M001" />
            {errors.cod && <p className="text-sm text-destructive">{errors.cod.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidad">Capacidad</Label>
            <Input
              id="capacidad"
              type="number"
              min="1"
              max="20"
              {...register("capacidad", {
                required: "La capacidad es requerida",
                valueAsNumber: true,
                min: { value: 1, message: "La capacidad mínima es 1" },
                max: { value: 20, message: "La capacidad máxima es 20" },
              })}
              placeholder="4"
            />
            {errors.capacidad && <p className="text-sm text-destructive">{errors.capacidad.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...register("descripcion")} placeholder="Mesa junto a la ventana..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : mesa ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
