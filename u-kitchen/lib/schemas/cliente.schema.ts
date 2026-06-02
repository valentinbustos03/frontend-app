import { z } from "zod"
import { usuarioFields } from "./usuario.schema"

export const clienteCoreSchema = z.object({
  dni: z.coerce
    .number({ invalid_type_error: "El DNI debe ser numérico" })
    .int("El DNI debe ser un entero")
    .min(1_000_000, "DNI inválido")
    .max(99_999_999, "DNI inválido"),
  penalty: z.coerce
    .number({ invalid_type_error: "La penalización debe ser numérica" })
    .min(0, "La penalización no puede ser negativa")
    .default(0),
})

const userFieldsForCliente = z.object({
  email: usuarioFields.email,
  fullName: usuarioFields.fullName,
  phoneNumber: usuarioFields.phoneNumber,
})

export const clienteCreateSchema = clienteCoreSchema.merge(userFieldsForCliente).extend({
  password: usuarioFields.password,
})

export const clienteUpdateSchema = clienteCoreSchema.merge(userFieldsForCliente).extend({
  password: usuarioFields.password.optional().or(z.literal("")),
})

export type ClienteCreateInput = z.infer<typeof clienteCreateSchema>
export type ClienteUpdateInput = z.infer<typeof clienteUpdateSchema>
