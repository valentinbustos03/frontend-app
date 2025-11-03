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
import { userService } from "@/services/usuario-service"
import type { CreateUsuarioRequest } from "@/types/usuario.types"
import type { Cliente, CreateClienteRequest } from "@/types/cliente.types"
import { UserRole as UserRoleEnum } from "@/types/usuario.types"

interface FormData extends CreateClienteRequest {
  email: string
  fullName: string
  password: string
  phoneNumber: string
}

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
  } = useForm<FormData>({
    defaultValues: {
      dni: 0,
      penalty: 0,
      email: "",
      fullName: "",
      password: "",
      phoneNumber: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(cliente ? {
        dni: cliente.dni,
        penalty: cliente.penalty,
        email: cliente.user?.email || "",
        fullName: cliente.user?.fullName || "",
        password: cliente.user?.password || "",
        phoneNumber: cliente.user?.phoneNumber || "",
      } : {
        dni: 0,
        penalty: 0,
        email: "",
        fullName: "",
        password: "",
        phoneNumber: "",
      })
    }
  }, [open, cliente, reset])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      if (cliente) {
        // Actualizar cliente
        await clienteService.updateCliente(cliente.id, {
          dni: data.dni,
          penalty: data.penalty,
        })

        // Manejar usuario
        if (cliente.user) {
          // Actualizar usuario existente (password solo si se proporciona)
          const updateUserData: Partial<CreateUsuarioRequest> = {
            email: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role: UserRoleEnum.USER,  // Fijo para clientes
          }
          if (data.password) {
            updateUserData.password = data.password
          }
          await userService.updateUsuario(cliente.user.id, updateUserData)
        } else {
          // Crear usuario nuevo
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
          description: "El cliente y usuario han sido actualizados exitosamente",
        })
      } else {
        // Crear cliente primero
        const createClientData: CreateClienteRequest = {
          dni: data.dni,
          penalty: data.penalty,
        }
        const newCliente = await clienteService.createCliente(createClientData)

        // Crear usuario asociado
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
          description: "El cliente y usuario han sido creados exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${cliente ? "actualizar" : "crear"} el cliente/usuario`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!cliente
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

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "El email es requerido",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Email inválido"
                }
              })}
              placeholder="ejemplo@email.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              {...register("fullName", { 
                required: "El nombre completo es requerido",
                minLength: {
                  value: 1,
                  message: "El nombre debe tener al menos 1 carácter"
                }
              })}
              placeholder="Nombre Apellido"
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña {requirePassword ? "(requerida)" : "(opcional)"}</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { 
                required: requirePassword ? "La contraseña es requerida" : false,
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres"
                },
                maxLength: {
                  value: 64,
                  message: "La contraseña no puede superar los 64 caracteres"
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: "Debe contener al menos una letra mayúscula, una minúscula y un número"
                }
              })}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <Input
              id="phoneNumber"
              {...register("phoneNumber", { 
                required: "El teléfono es requerido",
                minLength: {
                  value: 8,
                  message: "El teléfono debe tener al menos 8 caracteres"
                }
              })}
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