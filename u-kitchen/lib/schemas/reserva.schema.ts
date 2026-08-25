import { z } from "zod"
import { ReservaEstado } from "@/types/reserva.types"

const reservaCoreSchema = z.object({
  dateTime: z
    .string()
    .min(1, "La fecha y hora son requeridas")
    .refine((value) => !isNaN(Date.parse(value)), "Fecha inválida"),
  numberOfPeople: z.coerce
    .number({ invalid_type_error: "La cantidad de personas debe ser numérica" })
    .int("Debe ser un número entero")
    .min(1, "Debe haber al menos una persona"),
  status: z.nativeEnum(ReservaEstado),
  clientId: z.string().min(1, "Asigná un cliente"),
  tableId: z.string().min(1, "Asigná una mesa"),
})

// El backend solo rechaza la fecha pasada al crear: al editar hay que poder marcar
// como completada una reserva vieja.
export const reservaCreateSchema = reservaCoreSchema.refine(
  (data) => Date.parse(data.dateTime) >= Date.now(),
  { path: ["dateTime"], message: "La reserva no puede quedar en el pasado" },
)

export const reservaUpdateSchema = reservaCoreSchema

export type ReservaCreateInput = z.infer<typeof reservaCreateSchema>
export type ReservaUpdateInput = z.infer<typeof reservaUpdateSchema>
