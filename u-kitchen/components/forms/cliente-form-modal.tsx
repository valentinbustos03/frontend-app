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
        dni: cliente.dni,
        penalty: cliente.penalty,
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
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              type="number"
              {...register("dni", { required: "El DNI es requerido", valueAsNumber: true })}
              placeholder="12345678"
            />
            {errors.dni && <p className="text-sm text-destructive">{errors.dni.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="penalty">Penalización</Label>
            <Input
              id="penalty"
              type="number"
              min="0"
              {...register("penalty", { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.penalty && <p className="text-sm text-destructive">{errors.penalty.message}</p>}
          </div>

          {/* TODO: Implementar campos de usuario cuando estén disponibles en el backend */}
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            <p><strong>Nota:</strong> Los campos de usuario (nombre, email, teléfono) se implementarán cuando el backend soporte la creación de usuarios asociados a clientes.</p>
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
