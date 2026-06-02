import { z } from "zod"

const cuitRegex = /^\d{2}-?\d{8}-?\d$|^\d{11}$/

export const proveedorCreateSchema = z.object({
  companyName: z.string().min(1, "El nombre de compañía es requerido").max(120),
  taxId: z
    .string()
    .min(1, "El CUIT/CUIL es requerido")
    .refine((value) => cuitRegex.test(value), "Formato inválido (XX-XXXXXXXX-X u 11 dígitos)"),
  mail: z.string().min(1, "El email es requerido").email("Email inválido"),
  phoneNumber: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 caracteres")
    .max(30, "El teléfono es demasiado largo"),
  typeIngredient: z.string().min(1, "El tipo de ingrediente es requerido").max(60),
  fullName: z.string().min(1, "El nombre completo es requerido").max(120),
  bussinessName: z.string().min(1, "El nombre de negocio es requerido").max(120),
})

export type ProveedorCreateInput = z.infer<typeof proveedorCreateSchema>
