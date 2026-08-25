"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { reservaService } from "@/services/reserva-service"
import { clienteService } from "@/services/cliente-service"
import { mesaService } from "@/services/mesa-service"
import { ApiError } from "@/lib/api"
import { reservaCreateSchema, reservaUpdateSchema, type ReservaCreateInput } from "@/lib/schemas"
import { reservaEstadoLabels } from "@/lib/catalogs"
import type { Cliente } from "@/types/cliente.types"
import type { Mesa } from "@/types/mesa.types"
import type { Reserva } from "@/types/reserva.types"
import { ReservaEstado } from "@/types/reserva.types"

type FormData = ReservaCreateInput

interface ReservaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reserva?: Reserva
  onSuccess: () => void
}

// El input datetime-local trabaja en hora local y sin segundos.
function toInputValue(iso: string) {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const emptyDefaults: FormData = {
  dateTime: "",
  numberOfPeople: 2,
  status: ReservaEstado.PENDIENTE,
  clientId: "",
  tableId: "",
}

export function ReservaFormModal({ open, onOpenChange, reserva, onSuccess }: ReservaFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mesas, setMesas] = useState<Mesa[]>([])
  const isEdit = !!reserva

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isEdit ? reservaUpdateSchema : reservaCreateSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return

    Promise.all([clienteService.getClientes(), mesaService.getMesas()])
      .then(([clientes, mesas]) => {
        setClientes(clientes)
        setMesas(mesas)
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes o las mesas",
          variant: "destructive",
        })
      })

    reset(
      reserva
        ? {
            dateTime: toInputValue(reserva.dateTime),
            numberOfPeople: reserva.numberOfPeople,
            status: reserva.status,
            clientId: reserva.client?.id ?? "",
            tableId: reserva.table?.id ?? "",
          }
        : emptyDefaults,
    )
  }, [open, reserva, reset])

  const onSubmit = async (data: FormData) => {
    const mesa = mesas.find((m) => m.id === data.tableId)
    if (mesa && data.numberOfPeople > mesa.capacity) {
      setError("numberOfPeople", {
        message: `La mesa ${mesa.cod} tiene capacidad para ${mesa.capacity} personas`,
      })
      return
    }

    try {
      setLoading(true)
      const payload = {
        dateTime: new Date(data.dateTime).toISOString(),
        numberOfPeople: data.numberOfPeople,
        status: data.status,
        client: { id: data.clientId },
        table: { id: data.tableId },
      }

      if (reserva) {
        await reservaService.updateReserva(reserva.id, payload)
        toast({
          title: "Reserva actualizada",
          description: "La reserva ha sido actualizada exitosamente",
        })
      } else {
        await reservaService.createReserva(payload)
        toast({
          title: "Reserva creada",
          description: "La reserva ha sido creada exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset(emptyDefaults)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError && error.status === 409
            ? error.message
            : `No se pudo ${reserva ? "actualizar" : "crear"} la reserva`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{reserva ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle>
          <DialogDescription>
            {reserva ? "Modifica los datos de la reserva" : "Completa los datos para crear una nueva reserva"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dateTime">Fecha y hora</Label>
            <Input id="dateTime" type="datetime-local" {...register("dateTime")} />
            {errors.dateTime && <p className="text-sm text-destructive">{errors.dateTime.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfPeople">Cantidad de personas</Label>
              <Input id="numberOfPeople" type="number" min="1" {...register("numberOfPeople")} />
              {errors.numberOfPeople && (
                <p className="text-sm text-destructive">{errors.numberOfPeople.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ReservaEstado).map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {reservaEstadoLabels[estado]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.user?.fullName ?? `DNI ${cliente.dni}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Mesa</Label>
            <Controller
              name="tableId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesas.map((mesa) => (
                      <SelectItem key={mesa.id} value={mesa.id}>
                        {mesa.cod} — {mesa.capacity} personas ({mesa.sector})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tableId && <p className="text-sm text-destructive">{errors.tableId.message}</p>}
          </div>
          <p className="text-xs text-gray-500">
            Dos reservas confirmadas en la misma mesa tienen que estar a más de 2 horas de distancia.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : reserva ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
