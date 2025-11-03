import { Ingrediente } from './ingrediente.types';
import { Empleado } from './empleado.types';

export interface Plato {
  id: string
  cod: string
  name: string
  description?: string
  picture: string | null
  price: number
  calification?: number
  tag: string
  ingredients: Ingrediente[]
  chef: string
}

export interface CreatePlatoRequest {
  cod: string
  name: string
  description?: string
  picture: string | null
  price: number
  calification?: number
  tag: string
  ingredients: {
      id: string;
  }[];
  chef: Empleado
}

// Filtros para Plato
export interface PlatoFilters {
  search?: string
  precioMin?: number
  precioMax?: number
  calificationMin?: number
  tag?: string
}