import type { Promocion } from "@/types/promocion.types"

// Mismo criterio que el backend al calcular el subtotal del pedido: cuando un plato
// entra en varias promociones vigentes, se aplica el descuento más alto.
export function mejorDescuentoPorPlato(promociones: Promocion[]): Map<string, number> {
  const mejorDescuento = new Map<string, number>()

  for (const promocion of promociones) {
    for (const plato of promocion.dishes ?? []) {
      const actual = mejorDescuento.get(plato.id) ?? 0
      if (promocion.discountPercentage > actual) {
        mejorDescuento.set(plato.id, promocion.discountPercentage)
      }
    }
  }

  return mejorDescuento
}

export function precioConDescuento(price: number, descuento: number) {
  return Math.round(price * (1 - descuento / 100) * 100) / 100
}

export function estaVigente(promocion: Promocion, when = new Date()) {
  const desde = new Date(promocion.dateFrom).getTime()
  const hasta = new Date(promocion.dateTo).getTime()
  return promocion.active && desde <= when.getTime() && when.getTime() <= hasta
}
