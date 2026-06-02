import { z } from "zod"

export const mesaCreateSchema = z.object({
  cod: z
    .string()
    .min(1, "El código es requerido")
    .max(20, "El código es demasiado largo"),
  capacity: z.coerce
    .number({ invalid_type_error: "La capacidad debe ser numérica" })
    .int("La capacidad debe ser un entero")
    .min(1, "La capacidad mínima es 1")
    .max(50, "La capacidad máxima es 50"),
  description: z
    .string()
    .max(255, "La descripción es demasiado larga")
    .optional()
    .or(z.literal("")),
  occupied: z.boolean(),
  sector: z
    .string()
    .min(1, "El sector es requerido")
    .max(60, "El sector es demasiado largo"),
})

export const mesaUpdateSchema = mesaCreateSchema

export type MesaCreateInput = z.infer<typeof mesaCreateSchema>
