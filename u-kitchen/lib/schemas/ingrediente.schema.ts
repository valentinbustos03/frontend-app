import { z } from "zod"
import { UnidadMedida } from "@/types/ingrediente.types"

export const ingredienteCreateSchema = z
  .object({
    cod: z.string().min(1, "El código es requerido").max(20),
    name: z.string().min(1, "El nombre es requerido").max(120),
    description: z.string().max(255).optional().or(z.literal("")),
    stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
    uniteOfMeasure: z.nativeEnum(UnidadMedida, {
      errorMap: () => ({ message: "Seleccioná una unidad válida" }),
    }),
    origin: z.string().min(1, "El origen es requerido").max(120),
    stockLimit: z.coerce.number().min(0, "El límite de stock no puede ser negativo"),
    suppliers: z
      .array(z.object({ id: z.string().min(1) }))
      .min(1, "Asigná al menos un proveedor"),
  })
  .refine((data) => data.stockLimit <= data.stock || data.stock === 0, {
    path: ["stockLimit"],
    message: "El límite de stock no debería superar el stock actual",
  })

export type IngredienteCreateInput = z.infer<typeof ingredienteCreateSchema>
