"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
import { toast } from "@/hooks/use-toast"
import { clienteService } from "@/services/cliente-service"
import { userService } from "@/services/usuario-service"
import { ApiError } from "@/lib/api"
import { clienteCreateSchema, clienteUpdateSchema, type ClienteCreateInput } from "@/lib/schemas"
import type { CreateUsuarioRequest } from "@/types/usuario.types"
import type { Cliente, CreateClienteRequest } from "@/types/cliente.types"
import { UserRole as UserRoleEnum } from "@/types/usuario.types"

// Usamos el tipo Create (password required). El resolver del schema Update
// acepta password vacío en edición — RHF se queda con el tipo más estricto.
type FormData = ClienteCreateInput

interface ClienteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente
  onSuccess: () => void
}

const emptyDefaults: FormData = {
  dni: 0,
  penalty: 0,
  email: "",
  fullName: "",
  password: "",
  phoneNumber: "",
}

export function ClienteFormModal({ open, onOpenChange, cliente, onSuccess }: ClienteFormModalProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!cliente
  const schema = isEdit ? clienteUpdateSchema : clienteCreateSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return
    reset(
      cliente
        ? {
            dni: cliente.dni,
            penalty: cliente.penalty,
            email: cliente.user?.email ?? "",
            fullName: cliente.user?.fullName ?? "",
            password: "",
            phoneNumber: cliente.user?.phoneNumber ?? "",
          }
        : emptyDefaults,
    )
  }, [open, cliente, reset])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      if (cliente) {
        await clienteService.updateCliente(cliente.id, {
          dni: data.dni,
          penalty: data.penalty,
        })

        if (cliente.user) {
          const updateUserData: Partial<CreateUsuarioRequest> = {
            email: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role: UserRoleEnum.USER,
          }
          if (data.password) {
            updateUserData.password = data.password
          }
          await userService.updateUsuario(cliente.user.id, updateUserData)
        } else {
          const createUserData: CreateUsuarioRequest = {
            email: data.email,
            fullName: data.fullName,
            password: data.password,
            phoneNumber: data.phoneNumber,
            role: UserRoleEnum.USER,
            client: { id: cliente.id },
          }
          await userService.createUsuario(createUserData)
        }

        toast({
          title: "Cliente actualizado",
          description: "El cliente y el usuario fueron actualizados exitosamente",
        })
      } else {
        const createClientData: CreateClienteRequest = {
          dni: data.dni,
          penalty: data.penalty,
        }
        const newCliente = await clienteService.createCliente(createClientData)

        const createUserData: CreateUsuarioRequest = {
          email: data.email,
          fullName: data.fullName,
          password: data.password,
          phoneNumber: data.phoneNumber,
          role: UserRoleEnum.USER,
          client: { id: newCliente.id },
        }
        await userService.createUsuario(createUserData)

        toast({
          title: "Cliente creado",
          description: "El cliente y el usuario fueron creados exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset(emptyDefaults)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `No se pudo ${cliente ? "actualizar" : "crear"} el cliente`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const requirePassword = !isEdit

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">
            {isEdit ? "Editar Cliente" : "Nuevo Cliente y Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Modifica los datos del cliente y usuario asociado" 
              : "Completa los datos para crear un nuevo cliente y usuario"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              type="number"
              {...register("dni", { valueAsNumber: true })}
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

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="ejemplo@email.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Nombre Apellido"
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña {requirePassword ? "(requerida)" : "(opcional)"}</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <Input
              id="phoneNumber"
              {...register("phoneNumber")}
              placeholder="+54 9 011 123 4567"
            />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}