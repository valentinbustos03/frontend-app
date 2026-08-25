import { z } from "zod"

export const promocionCreateSchema = z
  .object({
    cod: z.string().min(1, "El código es requerido").max(20),
    name: z.string().min(1, "El nombre es requerido").max(120),
    description: z.string().max(500).optional().or(z.literal("")),
    discountPercentage: z.coerce
      .number({ invalid_type_error: "El descuento debe ser numérico" })
      .min(0, "El descuento no puede ser negativo")
      .max(100, "El descuento no puede superar el 100%"),
    dateFrom: z.string().min(1, "La fecha de inicio es requerida"),
    dateTo: z.string().min(1, "La fecha de fin es requerida"),
    active: z.boolean(),
    dishIds: z.array(z.string().min(1)).min(1, "Asigná al menos un plato"),
  })
  .refine((data) => data.dateTo >= data.dateFrom, {
    path: ["dateTo"],
    message: "La fecha de fin no puede ser anterior a la de inicio",
  })

export type PromocionCreateInput = z.infer<typeof promocionCreateSchema>
