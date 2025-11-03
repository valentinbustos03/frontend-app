"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { proveedorService } from "@/services/proveedor-service"
import type { 
  Proveedor, 
  CreateProveedorRequest 
} from "@/types/proveedor.types"

interface FormData extends CreateProveedorRequest {}

interface ProveedorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor?: Proveedor
  onSuccess: () => void
}

export function ProveedorFormModal({ open, onOpenChange, proveedor, onSuccess }: ProveedorFormModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      companyName: "",
      taxId: "",
      mail: "",
      phoneNumber: "",
      typeIngredient: "",
      fullName: "",
      bussinessName: "",
    },
  })

  const isEdit = !!proveedor

  useEffect(() => {
    if (open) {
      reset(proveedor ? {
        companyName: proveedor.companyName,
        taxId: proveedor.taxId,
        mail: proveedor.mail,
        phoneNumber: proveedor.phoneNumber,
        typeIngredient: proveedor.typeIngredient,
        fullName: proveedor.fullName,
        bussinessName: proveedor.bussinessName,
      } : {
        companyName: "",
        taxId: "",
        mail: "",
        phoneNumber: "",
        typeIngredient: "",
        fullName: "",
        bussinessName: "",
      })
    }
  }, [open, proveedor, reset])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      if (isEdit) {
        await proveedorService.updateProveedor(proveedor!.id, data)
        toast({
          title: "Proveedor actualizado",
          description: "El proveedor ha sido actualizado exitosamente",
        })
      } else {
        await proveedorService.createProveedor(data)
        toast({
          title: "Proveedor creado",
          description: "El proveedor ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${isEdit ? "actualizar" : "crear"} el proveedor`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const ingredientTypes = ["Carnes", "Verduras", "Lácteos", "Cereales", "Bebidas", "Pasta", "Otros"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">
            {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Modifica los datos del proveedor" 
              : "Completa los datos para crear un nuevo proveedor"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Campos principales - Columna izquierda */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Razón Social</Label>
              <Input
                id="companyName"
                {...register("companyName", { required: "La razón social es requerida" })}
                placeholder="Nombre de la empresa"
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">CUIT/CUIL</Label>
              <Input
                id="taxId"
                {...register("taxId", {
                required: "El CUIT/CUIL es requerido",
                pattern: {
                value: /^\d{2}-\d{8}-\d{1}$/,
                message: "Formato de CUIT/CUIL inválido. Debe ser XX-XXXXXXXX-X"
                }
                })}
                placeholder="30-12345678-9"
              />
              {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bussinessName">Compañía</Label>
              <Input
                id="bussinessName"
                {...register("bussinessName", { required: "La compañía es requerida" })}
                placeholder="Nombre de la compañía"
              />
              {errors.bussinessName && <p className="text-sm text-destructive">{errors.bussinessName.message}</p>}
            </div>
          </div>

          {/* Campos de contacto - Columna derecha */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre</Label>
              <Input
                id="fullName"
                {...register("fullName", { required: "El nombre es requerido" })}
                placeholder="Nombre del contacto"
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <Label htmlFor="mail">Email</Label>
                <Input
                  id="mail"
                  type="email"
                  {...register("mail", { 
                    required: "El email es requerido",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Email inválido"
                    }
                  })}
                  placeholder="contacto@proveedor.com"
                />
                {errors.mail && <p className="text-sm text-destructive">{errors.mail.message}</p>}
              </div>
              <div className="w-1/2 space-y-2">
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber", { required: "El teléfono es requerido" })}
                  placeholder="+54 9 341 555 1234"
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeIngredient">Tipo de Ingrediente</Label>
              <Controller
                name="typeIngredient"
                control={control}
                rules={{ required: "El tipo de ingrediente es requerido" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo de ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredientTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error && <p className="text-sm text-destructive">{error.message}</p>}
                  </>
                )}
              />
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
                {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}