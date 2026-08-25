import { z } from "zod"

export const platoCreateSchema = z.object({
  cod: z.string().min(1, "El código es requerido").max(20),
  name: z.string().min(1, "El nombre es requerido").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  picture: z.string().url("Debe ser una URL válida").nullable().or(z.literal("")),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  calification: z.coerce.number().min(0).max(5).optional(),
  tag: z.string().min(1, "El tag es requerido").max(60),
  ingredients: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.coerce
          .number()
          .int("La cantidad debe ser un entero")
          .min(1, "La cantidad debe ser al menos 1"),
      }),
    )
    .min(1, "Asigná al menos un ingrediente"),
  chefId: z.string().min(1, "Asigná un chef"),
})

export type PlatoCreateInput = z.infer<typeof platoCreateSchema>
