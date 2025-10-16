"use client"

import { useEffect, useState } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
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
import { empleadoService } from "@/services/empleado-service"
import { userService } from "@/services/usuario-service"
import type { 
  Empleado, 
  CreateEmpleadoRequest, 
  Usuario, 
  UserRole, 
  CreateUsuarioRequest,
  EmployeeRole,
  EmployeeShift 
} from "@/types"
import { EmployeeRole as EmployeeRoleEnum, EmployeeShift as EmployeeShiftEnum, UserRole as UserRoleEnum } from "@/types"

interface FormData extends CreateEmpleadoRequest {
  email: string
  fullName: string
  password: string
  phoneNumber: string
}

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
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      taxId: "",
      shift: "",
      workedHours: 0,
      priceHour: 0,
      salary: 0,
      role: EmployeeRoleEnum.CHEF,
      hierarchy: "",
      tag: "",
      calification: 0,
      sector: "",
      email: "",
      fullName: "",
      password: "",
      phoneNumber: "",
    },
  })

  const role = watch("role")
  const isEdit = !!empleado
  const requirePassword = !isEdit

  useEffect(() => {
    if (open) {
      reset(empleado ? {
        taxId: empleado.taxId,
        shift: empleado.shift,
        workedHours: empleado.workedHours || 0,
        priceHour: empleado.priceHour || 0,
        salary: empleado.salary || 0,
        role: empleado.role,
        hierarchy: empleado.hierarchy || "",
        tag: empleado.tag || "",
        calification: empleado.calification || 0,
        sector: empleado.sector || "",
        email: empleado.user?.email || "",
        fullName: empleado.user?.fullName || "",
        password: empleado.user?.password || "",
        phoneNumber: empleado.user?.phoneNumber || "",
      } : {
        taxId: "",
        shift: "",
        workedHours: 0,
        priceHour: 0,
        salary: 0,
        role: EmployeeRoleEnum.CHEF,
        hierarchy: "",
        tag: "",
        calification: 0,
        sector: "",
        email: "",
        fullName: "",
        password: "",
        phoneNumber: "",
      })
    }
  }, [open, empleado, reset])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      const employeeData: CreateEmpleadoRequest = {
        taxId: data.taxId,
        shift: data.shift,
        workedHours: data.workedHours,
        priceHour: data.priceHour,
        salary: data.salary,
        role: data.role,
        ...(role === EmployeeRoleEnum.CHEF && {
          hierarchy: data.hierarchy,
          tag: data.tag,
        }),
        ...(role === EmployeeRoleEnum.WAITER && {
          calification: data.calification,
          sector: data.sector,
        }),
      }

      if (isEdit) {
        // Actualizar empleado
        await empleadoService.updateEmpleado(empleado!.id, employeeData)

        // Manejar usuario
        if (empleado!.user) {
          // Actualizar usuario existente (password solo si se proporciona)
          const updateUserData: Partial<CreateUsuarioRequest> = {
            email: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role: UserRoleEnum.ADMIN,  // Basado en el ejemplo del backend para empleados
          }
          if (data.password) {
            updateUserData.password = data.password
          }
          await userService.updateUsuario(empleado!.user.id, updateUserData)
        } else {
          // Crear usuario nuevo
          const createUserData: CreateUsuarioRequest = {
            email: data.email,
            fullName: data.fullName,
            password: data.password,
            phoneNumber: data.phoneNumber,
            role: UserRoleEnum.ADMIN,
            employee: { id: empleado!.id },
          }
          await userService.createUsuario(createUserData)
        }

        toast({
          title: "Empleado actualizado",
          description: "El empleado y usuario han sido actualizados exitosamente",
        })
      } else {
        // Crear empleado primero
        const newEmpleado = await empleadoService.createEmpleado(employeeData)

        // Crear usuario asociado
        const createUserData: CreateUsuarioRequest = {
          email: data.email,
          fullName: data.fullName,
          password: data.password,
          phoneNumber: data.phoneNumber,
          role: UserRoleEnum.ADMIN,
          employee: { id: newEmpleado.id },
        }
        await userService.createUsuario(createUserData)

        toast({
          title: "Empleado creado",
          description: "El empleado y usuario han sido creados exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${isEdit ? "actualizar" : "crear"} el empleado/usuario`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">
            {isEdit ? "Editar Empleado" : "Nuevo Empleado y Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Modifica los datos del empleado y usuario asociado" 
              : "Completa los datos para crear un nuevo empleado y usuario"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Campos del Empleado - Columna izquierda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos del Empleado</h3>
            <div className="space-y-2">
              <Label htmlFor="taxId">CUIT</Label>
              <Input
                id="taxId"
                {...register("taxId", { required: "El CUIT es requerido" })}
                placeholder="20-12345678-9"
              />
              {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "El rol es requerido" }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EmployeeRoleEnum.CHEF}>Chef</SelectItem>
                          <SelectItem value={EmployeeRoleEnum.WAITER}>Mesero</SelectItem>
                        </SelectContent>
                      </Select>
                      {error && <p className="text-sm text-destructive">{error.message}</p>}
                    </>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <Label htmlFor="shift">Turno</Label>
                <Controller
                  name="shift"
                  control={control}
                  rules={{ required: "El turno es requerido" }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EmployeeShiftEnum.MAÑANA}>Mañana</SelectItem>
                          <SelectItem value={EmployeeShiftEnum.TARDE}>Tarde</SelectItem>
                          <SelectItem value={EmployeeShiftEnum.NOCHE}>Noche</SelectItem>
                        </SelectContent>
                      </Select>
                      {error && <p className="text-sm text-destructive">{error.message}</p>}
                    </>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workedHours">Horas Trabajadas</Label>
              <Input
                id="workedHours"
                type="number"
                {...register("workedHours", { required: "Las horas son requeridas", valueAsNumber: true, min: { value: 0, message: "Debe ser positivo" } })}
                placeholder="160"
              />
              {errors.workedHours && <p className="text-sm text-destructive">{errors.workedHours.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceHour">Precio por Hora</Label>
              <Input
                id="priceHour"
                type="number"
                step="0.01"
                {...register("priceHour", { required: "El precio por hora es requerido", valueAsNumber: true, min: { value: 0, message: "Debe ser positivo" } })}
                placeholder="15.5"
              />
              {errors.priceHour && <p className="text-sm text-destructive">{errors.priceHour.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salario (opcional)</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                {...register("salary", { valueAsNumber: true, min: { value: 0, message: "Debe ser positivo" } })}
                placeholder="0"
              />
              {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
            </div>

            {/* Campos condicionales basados en rol */}
            {role === EmployeeRoleEnum.CHEF && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hierarchy">Jerarquía</Label>
                  <Input
                    id="hierarchy"
                    {...register("hierarchy")}
                    placeholder="Ej: Chef Ejecutivo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag">Tag</Label>
                  <Input
                    id="tag"
                    {...register("tag")}
                    placeholder="Ej: pastas"
                  />
                </div>
              </>
            )}

            {role === EmployeeRoleEnum.WAITER && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="calification">Calificación</Label>
                  <Input
                    id="calification"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    {...register("calification", { valueAsNumber: true, min: { value: 0, message: "Mínimo 0" }, max: { value: 5, message: "Máximo 5" } })}
                    placeholder="4.5"
                  />
                  {errors.calification && <p className="text-sm text-destructive">{errors.calification.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    {...register("sector")}
                    placeholder="Ej: terraza"
                  />
                </div>
              </>
            )}
          </div>

          {/* Campos del Usuario - Columna derecha */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos del Usuario</h3>
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