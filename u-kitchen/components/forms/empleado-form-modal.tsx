"use client"
import type React from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { empleadoService } from "@/services/empleado-service"
import { Empleado, CreateEmpleadoRequest, EmployeeRole, EmployeeShift } from "@/types"
import { EmployeeRole as EmployeeRoleEnum, EmployeeShift as ShiftEnum } from "@/types"
import { useForm, Controller } from "react-hook-form"

interface EmpleadoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empleado?: Empleado
  onSuccess: () => void
}

export function EmpleadoFormModal({ open, onOpenChange, empleado, onSuccess }: EmpleadoFormModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateEmpleadoRequest>({
    defaultValues: {
      taxId: "",
      shift: ShiftEnum.MAÑANA,
      workedHours: 0,
      priceHour: 0,
      role: EmployeeRole.WAITER,
      hierarchy: "",
      tag: "",
      calification: 0,
      sector: ""
    },
  })

  // Watch para calcular sueldo y campos condicionales
  const watchedValues = watch()
  const calculatedSueldo = watchedValues.workedHours * watchedValues.priceHour || 0

  // Reset del formulario cuando cambia el modal
  useEffect(() => {
    if (open) {
      reset(empleado ? {
        taxId: empleado.taxId,
        shift: empleado.shift,
        workedHours: empleado.workedHours,
        priceHour: empleado.priceHour,
        role: empleado.role,
        hierarchy: empleado.hierarchy,
        tag: empleado.tag,
        calification: empleado.calification,
        sector: empleado.sector
      } : {
        taxId: "",
        shift: ShiftEnum.MAÑANA,
        workedHours: 0,
        priceHour: 0,
        role: EmployeeRole.WAITER,
        hierarchy: "",
        tag: "",
        calification: 0,
        sector: ""
      })
    }
  }, [open, empleado, reset])

  const onSubmit = async (data: CreateEmpleadoRequest) => {
    try {
      setLoading(true)
      console.log(data)
      if (empleado) {
        await empleadoService.updateEmpleado(empleado.id, data)
        toast({
          title: "Empleado actualizado",
          description: "El empleado ha sido actualizado exitosamente",
        })
      } else {
        await empleadoService.createEmpleado(data)
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${empleado ? "actualizar" : "crear"} el empleado`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{empleado ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
          <DialogDescription>
            {empleado ? "Modifica los datos del empleado" : "Completa los datos del nuevo empleado"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxId">CUIT/CUIL</Label>
            <Input
              id="taxId"
              {...register("taxId", { 
                required: "CUIT/CUIL es requerido",
                pattern: {
                  value: /^\d{2}-\d{8}-\d{1}$/,
                  message: "Formato inválido. Use: 20-12345678-9"
                }
              })}
              placeholder="20-12345678-9"
            />
            {errors.taxId && <p className="text-red-500 text-sm">{errors.taxId.message}</p>}
          </div>

          {/* Campos de texto tag y sector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                {...register("tag", { 
                  maxLength: { 
                    value: 50, 
                    message: "El tag no puede tener más de 50 caracteres" 
                  }
                })}
                placeholder="Etiqueta del empleado"
              />
              {errors.tag && <p className="text-red-500 text-sm">{errors.tag.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                {...register("sector", { 
                  maxLength: { 
                    value: 100, 
                    message: "El sector no puede tener más de 100 caracteres" 
                  }
                })}
                placeholder="Sector de trabajo"
              />
              {errors.sector && <p className="text-red-500 text-sm">{errors.sector.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Controller
                name="shift"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ShiftEnum.MAÑANA}>Mañana</SelectItem>
                      <SelectItem value={ShiftEnum.TARDE}>Tarde</SelectItem>
                      <SelectItem value={ShiftEnum.NOCHE}>Noche</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Empleado</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EmployeeRoleEnum.WAITER}>Mesero</SelectItem>
                      <SelectItem value={EmployeeRoleEnum.CHEF}>Chef</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workedHours">Horas Trabajadas</Label>
              <Input
                id="workedHours"
                type="number"
                {...register("workedHours", { 
                  required: "Horas trabajadas son requeridas",
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  valueAsNumber: true
                })}
                min="0"
              />
              {errors.workedHours && <p className="text-red-500 text-sm">{errors.workedHours.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceHour">Precio por Hora ($)</Label>
              <Input
                id="priceHour"
                type="number"
                step="0.01"
                {...register("priceHour", { 
                  required: "Precio por hora es requerido",
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  valueAsNumber: true
                })}
                min="0"
              />
              {errors.priceHour && <p className="text-red-500 text-sm">{errors.priceHour.message}</p>}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Sueldo Calculado</Label>
            <p className="text-2xl font-bold text-primary">${calculatedSueldo.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {watchedValues.workedHours || 0} horas × ${(watchedValues.priceHour || 0).toFixed(2)}/hora
            </p>
          </div>

          {/* Campo condicional para Chef */}
          {watchedValues.role === EmployeeRoleEnum.CHEF && (
            <div className="space-y-2">
              <Label htmlFor="hierarchy">Jerarquía</Label>
              <Controller
                name="hierarchy"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una jerarquía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chef Ejecutivo">Chef Ejecutivo</SelectItem>
                      <SelectItem value="Sous Chef">Sous Chef</SelectItem>
                      <SelectItem value="Chef de Partida">Chef de Partida</SelectItem>
                      <SelectItem value="Cocinero">Cocinero</SelectItem>
                      <SelectItem value="Ayudante de Cocina">Ayudante de Cocina</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.hierarchy && <p className="text-red-500 text-sm">{errors.hierarchy.message}</p>}
            </div>
          )}

          {/* Campo condicional para Waiter */}
          {watchedValues.role === EmployeeRoleEnum.WAITER && (
            <div className="space-y-2">
              <Label htmlFor="calification">Calificación (1-5)</Label>
              <Input
                id="calification"
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...register("calification", { 
                  min: { value: 1, message: "Mínimo 1" },
                  max: { value: 5, message: "Máximo 5" },
                  valueAsNumber: true
                })}
              />
              {errors.calification && <p className="text-red-500 text-sm">{errors.calification.message}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : empleado ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}