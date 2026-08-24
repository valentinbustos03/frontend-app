import { z } from "zod"
import { usuarioFields } from "./usuario.schema"

export const loginSchema = z.object({
  email: usuarioFields.email,
  password: z.string().min(1, "La contraseña es requerida"),
})

export type LoginInput = z.infer<typeof loginSchema>
