import { ApiError } from "@/lib/api"
import { estadoLabels } from "@/lib/catalogs"
import type {
  FaltanteStock,
  PedidoEstado,
  ReferenciaFaltante,
  TransicionInvalida,
} from "@/types/pedido.types"

const referenciaLabels: Record<ReferenciaFaltante["tipo"], string> = {
  client: "cliente",
  table: "mesa",
  waiter: "mesero",
  dish: "plato",
}

function esFaltanteStock(details: unknown): details is FaltanteStock[] {
  return (
    Array.isArray(details) &&
    details.length > 0 &&
    details.every((item) => typeof item?.name === "string" && typeof item?.required === "number")
  )
}

function esReferenciaFaltante(details: unknown): details is ReferenciaFaltante[] {
  return (
    Array.isArray(details) &&
    details.length > 0 &&
    details.every((item) => typeof item?.tipo === "string" && typeof item?.id === "string")
  )
}

function esTransicionInvalida(details: unknown): details is TransicionInvalida {
  const value = details as TransicionInvalida | undefined
  return typeof value?.from === "string" && typeof value?.to === "string"
}

// El backend devuelve el detalle de los errores de negocio en `data`, que ApiError
// expone como `details`. Devuelve null si el error no es uno de esos casos, para que
// el llamador use su mensaje genérico.
export function describirErrorPedido(error: unknown): string | null {
  if (!(error instanceof ApiError)) {
    return null
  }

  const { status, details } = error

  if (status === 409 && esFaltanteStock(details)) {
    const faltantes = details
      .map((item) => `${item.name} (hay ${item.stock}, se necesitan ${item.required})`)
      .join(", ")
    return `Stock insuficiente: ${faltantes}`
  }

  if (status === 400 && esReferenciaFaltante(details)) {
    const referencias = details
      .map((item) => referenciaLabels[item.tipo] ?? item.tipo)
      .join(", ")
    return `No existen los siguientes datos del pedido: ${referencias}`
  }

  if (status === 409 && esTransicionInvalida(details)) {
    const label = (estado: PedidoEstado) => (estadoLabels[estado] ?? estado).toLowerCase()
    return `Un pedido ${label(details.from)} no puede pasar a ${label(details.to)}`
  }

  return null
}
