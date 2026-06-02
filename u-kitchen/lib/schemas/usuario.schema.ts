import { z } from "zod"
import { UserRole } from "@/types/usuario.types"

const emailField = z
  .string()
  .min(1, "El email es requerido")
  .email("Email inválido")

const fullNameField = z
  .string()
  .min(1, "El nombre completo es requerido")
  .max(120, "El nombre es demasiado largo")

const phoneNumberField = z
  .string()
  .min(8, "El teléfono debe tener al menos 8 caracteres")
  .max(30, "El teléfono es demasiado largo")

const passwordField = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(64, "La contraseña no puede superar los 64 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Debe contener al menos una mayúscula, una minúscula y un número",
  )

export const usuarioBaseSchema = z.object({
  email: emailField,
  fullName: fullNameField,
  phoneNumber: phoneNumberField,
  role: z.nativeEnum(UserRole),
})

export const usuarioCreateSchema = usuarioBaseSchema.extend({
  password: passwordField,
})

export const usuarioUpdateSchema = usuarioBaseSchema.extend({
  password: passwordField.optional().or(z.literal("")),
})

export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>

export const usuarioFields = {
  email: emailField,
  fullName: fullNameField,
  phoneNumber: phoneNumberField,
  password: passwordField,
}
