"use client"

import { useEffect, useState } from "react"
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
import { toast } from "@/hooks/use-toast"
import { clienteService } from "@/services/cliente-service"
import type { Cliente, CreateClienteRequest } from "@/types"

interface ClienteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente
  onSuccess: () => void
}

export function ClienteFormModal({ open, onOpenChange, cliente, onSuccess }: ClienteFormModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClienteRequest>({
    defaultValues: {},
  })

  useEffect(() => {
    if (open) {
      reset(cliente ? {
        mail: cliente.usuario.mail,
        tel: cliente.usuario.tel,
        nombreApellido: cliente.usuario.nombreApellido,
        penalizacion: cliente.penalizacion,
      } : {});
    }
  }, [open, cliente, reset])

  const onSubmit = async (data: CreateClienteRequest) => {
    try {
      setLoading(true)
      if (cliente) {
        await clienteService.updateCliente(cliente.id, data)
        toast({
          title: "Cliente actualizado",
          description: "El cliente ha sido actualizado exitosamente",
        })
      } else {
        await clienteService.createCliente(data)
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${cliente ? "actualizar" : "crear"} el cliente`,
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
          <DialogTitle className="text-orange-600">{cliente ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {cliente ? "Modifica los datos del cliente" : "Completa los datos para crear un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreApellido">Nombre y Apellido</Label>
            <Input
              id="nombreApellido"
              {...register("nombreApellido", { required: "El nombre es requerido" })}
              placeholder="Juan Pérez"
            />
            {errors.nombreApellido && <p className="text-sm text-destructive">{errors.nombreApellido.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mail">Email</Label>
            <Input
              id="mail"
              type="email"
              {...register("mail", { required: "El email es requerido" })}
              placeholder="juan@email.com"
            />
            {errors.mail && <p className="text-sm text-destructive">{errors.mail.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tel">Teléfono</Label>
            <Input id="tel" {...register("tel", { required: "El teléfono es requerido" })} placeholder="+1234567890" />
            {errors.tel && <p className="text-sm text-destructive">{errors.tel.message}</p>}
          </div>

          {!cliente && (
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <Input
                id="contraseña"
                type="password"
                {...register("contraseña", { required: "La contraseña es requerida" })}
                placeholder="••••••••"
              />
              {errors.contraseña && <p className="text-sm text-destructive">{errors.contraseña.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="penalizacion">Penalización</Label>
            <Input
              id="penalizacion"
              type="number"
              min="0"
              {...register("penalizacion", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : cliente ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
