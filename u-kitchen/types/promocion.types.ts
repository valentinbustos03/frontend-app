import { Plato } from './plato.types';

// `dateFrom` y `dateTo` son los ISO que manda el backend, no Date.
export interface Promocion {
  id: string
  cod: string
  name: string
  description?: string
  discountPercentage: number
  dateFrom: string
  dateTo: string
  active: boolean
  dishes: Plato[]
}

export interface CreatePromocionRequest {
  cod: string
  name: string
  description?: string
  discountPercentage: number
  dateFrom: string
  dateTo: string
  active: boolean
  dishes: {
    id: string
  }[]
}

// Filtros para Promocion
export interface PromocionFilters {
  current?: boolean
}
