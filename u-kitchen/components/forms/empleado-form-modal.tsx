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
import { employeeService } from "@/services/employee-service"
import type { Empleado, Turno,CreateEmpleadoRequest, EmpleadoTipo, ChefJerarquia } from "@/types"
import { Turno as TurnoEnum, EmpleadoTipo as EmpleadoTipoEnum, ChefJerarquia as ChefJerarquiaEnum } from "@/types"
import { useForm } from "react-hook-form"

interface EmpleadoFormModalProps {
  open: boolean
    onOpenChange: (open: boolean) => void
    empleado?: Empleado
    onSuccess: () => void
}

export function EmpleadoFormModal({ open, onOpenChange, empleado, onSuccess }: EmpleadoFormModalProps) {

  const [formData, setFormData] = useState<CreateEmpleadoRequest>({
    nombre: "",
    apellido: "",
    cuitCuil: "",
    turno: TurnoEnum.MAÑANA,
    horasTrabajadas: 0,
    precioPorHora: 0,
    tipo: EmpleadoTipoEnum.MESERO,
  })
  const [loading, setLoading] = useState(false)
  const [calculatedSueldo, setCalculatedSueldo] = useState(0)
  const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<CreateEmpleadoRequest>({
      defaultValues: {},
    })

  useEffect(() => {
    if (open) {
      reset(empleado ? {
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        cuitCuil: empleado.cuitCuil,
        turno: empleado.turno,
        horasTrabajadas: empleado.horasTrabajadas,
        precioPorHora: empleado.precioPorHora,
        tipo: empleado.tipo,
        jerarquia: empleado.jerarquia,
        calificacion: empleado.calificacion,
        listaProductosEncargado: empleado.listaProductosEncargado,
      } : {
        nombre: "",
        apellido: "",
        cuitCuil: "",
        turno: TurnoEnum.MAÑANA,
        horasTrabajadas: 0,
        precioPorHora: 0,
        tipo: EmpleadoTipoEnum.MESERO,
      });
    }
  }, [open, empleado, reset])

  useEffect(() => {
    setCalculatedSueldo(formData.horasTrabajadas * formData.precioPorHora)
  }, [formData.horasTrabajadas, formData.precioPorHora])

  const onSubmit = async (data: CreateEmpleadoRequest) => {
      try {
        setLoading(true)
        if (empleado) {
          await employeeService.updateEmployee(empleado.id, data)
          toast({
            title: "Empleado actualizado",
            description: "El empleado ha sido actualizado exitosamente",
          })
        } else {
          await employeeService.createEmployee(data)
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



  const handleInputChange = (field: keyof CreateEmpleadoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuitCuil">CUIT/CUIL</Label>
            <Input
              id="cuitCuil"
              value={formData.cuitCuil}
              onChange={(e) => handleInputChange("cuitCuil", e.target.value)}
              placeholder="20-12345678-9"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={formData.turno} onValueChange={(value) => handleInputChange("turno", value as Turno)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TurnoEnum.MAÑANA}>Mañana</SelectItem>
                  <SelectItem value={TurnoEnum.TARDE}>Tarde</SelectItem>
                  <SelectItem value={TurnoEnum.NOCHE}>Noche</SelectItem>
                  <SelectItem value={TurnoEnum.COMPLETO}>Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Empleado</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value as EmpleadoTipo)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmpleadoTipoEnum.MESERO}>Mesero</SelectItem>
                  <SelectItem value={EmpleadoTipoEnum.CHEF}>Chef</SelectItem>
                  <SelectItem value={EmpleadoTipoEnum.CAJERO}>Cajero</SelectItem>
                  <SelectItem value={EmpleadoTipoEnum.ADMINISTRADOR}>Administrador</SelectItem>
                  <SelectItem value={EmpleadoTipoEnum.LIMPIEZA}>Limpieza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horasTrabajadas">Horas Trabajadas</Label>
              <Input
                id="horasTrabajadas"
                type="number"
                value={formData.horasTrabajadas}
                onChange={(e) => handleInputChange("horasTrabajadas", Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioPorHora">Precio por Hora ($)</Label>
              <Input
                id="precioPorHora"
                type="number"
                step="0.01"
                value={formData.precioPorHora}
                onChange={(e) => handleInputChange("precioPorHora", Number(e.target.value))}
                min="0"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Sueldo Calculado</Label>
            <p className="text-2xl font-bold text-primary">${calculatedSueldo.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {formData.horasTrabajadas} horas × ${formData.precioPorHora}/hora
            </p>
          </div>

          {formData.tipo === EmpleadoTipoEnum.CHEF && (
            <div className="space-y-2">
              <Label htmlFor="jerarquia">Jerarquía</Label>
              <Select
                value={formData.jerarquia || ""}
                onValueChange={(value) => handleInputChange("jerarquia", value as ChefJerarquia)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una jerarquía" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ChefJerarquiaEnum.CHEF_EJECUTIVO}>Chef Ejecutivo</SelectItem>
                  <SelectItem value={ChefJerarquiaEnum.SOUS_CHEF}>Sous Chef</SelectItem>
                  <SelectItem value={ChefJerarquiaEnum.CHEF_DE_PARTIDA}>Chef de Partida</SelectItem>
                  <SelectItem value={ChefJerarquiaEnum.COCINERO}>Cocinero</SelectItem>
                  <SelectItem value={ChefJerarquiaEnum.AYUDANTE_COCINA}>Ayudante de Cocina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.tipo === EmpleadoTipoEnum.MESERO && (
            <div className="space-y-2">
              <Label htmlFor="calificacion">Calificación (1-5)</Label>
              <Input
                id="calificacion"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.calificacion || ""}
                onChange={(e) => handleInputChange("calificacion", Number(e.target.value))}
              />
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
