import { z } from "zod"
import { PedidoEstado } from "@/types/pedido.types"

export const pedidoItemSchema = z.object({
  dish: z.object({ id: z.string().min(1) }),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
})

export const pedidoCreateSchema = z.object({
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.nativeEnum(PedidoEstado),
  estimatedEndTime: z.string().min(1),
  endTime: z.string().optional().nullable(),
  orderItems: z.array(pedidoItemSchema).min(1, "Agregá al menos un plato"),
  client: z.object({ id: z.string().min(1, "Asigná un cliente") }),
  table: z.object({ id: z.string().min(1, "Asigná una mesa") }),
  waiter: z.object({ id: z.string().min(1, "Asigná un mesero") }),
})

export type PedidoCreateInput = z.infer<typeof pedidoCreateSchema>
