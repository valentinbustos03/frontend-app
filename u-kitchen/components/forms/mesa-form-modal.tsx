"use client"
import { useState, useEffect } from "react"
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
import { mesaService } from "@/services/mesa-service"
import type { Mesa, CreateMesaRequest } from "@/types"
import { useForm } from "react-hook-form"

interface MesaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesa?: Mesa
  onSuccess: () => void
}

export function MesaFormModal({ open, onOpenChange, mesa, onSuccess }: MesaFormModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMesaRequest>({
    defaultValues: {
      cod: "",
      capacity: 0,
      description: "",
      occupied: false,
      sector: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(mesa ? {
        cod: mesa.cod,
        capacity: mesa.capacity,
        description: mesa.description || "",
        occupied: mesa.occupied,
        sector: mesa.sector,
      } : {
        cod: "",
        capacity: 0,
        description: "",
        occupied: false,
        sector: "",
      })
    }
  }, [open, mesa, reset])

  const onSubmit = async (data: CreateMesaRequest) => {
    try {
      setLoading(true)
      console.log(data)
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
            <Input 
              id="cod" 
              {...register("cod", { 
                required: "El código es requerido",
                minLength: { value: 1, message: "El código debe tener al menos 1 carácter" }
              })} 
              placeholder="M001" 
            />
            {errors.cod && <p className="text-sm text-destructive">{errors.cod.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad</Label>
            <Input
              id="capacity"
              type="number"
              {...register("capacity", {
                required: "La capacidad es requerida",
                valueAsNumber: true,
                min: { value: 1, message: "La capacidad mínima es 1" },
                max: { value: 20, message: "La capacidad máxima es 20" },
              })}
              placeholder="4"
            />
            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Mesa junto a la ventana..." 
              rows={3} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Input 
              id="sector" 
              {...register("sector", { 
                required: "El sector es requerido",
                minLength: { value: 1, message: "El sector debe tener al menos 1 carácter" }
              })} 
              placeholder="terraza, salón, etc." 
            />
            {errors.sector && <p className="text-sm text-destructive">{errors.sector.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="occupied" 
              {...register("occupied")} 
            />
            <Label htmlFor="occupied">Ocupada</Label>
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